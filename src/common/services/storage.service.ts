import { Injectable } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import { v2 as cloudinary } from "cloudinary"
import { S3 } from "aws-sdk"
import * as fs from "fs"
import * as path from "path"
import { promisify } from "util"

const writeFileAsync = promisify(fs.writeFile)
const unlinkAsync = promisify(fs.unlink)
const mkdirAsync = promisify(fs.mkdir)

export enum StorageType {
  LOCAL = "local",
  CLOUDINARY = "cloudinary",
  S3 = "s3",
}

@Injectable()
export class StorageService {
  private storageType: StorageType
  private uploadDir: string
  private s3: S3

  constructor(private configService: ConfigService) {
    this.storageType = this.configService.get<StorageType>("STORAGE_TYPE", StorageType.LOCAL)
    this.uploadDir = this.configService.get<string>("UPLOAD_DIR", "./uploads")

    // Initialize Cloudinary if needed
    if (this.storageType === StorageType.CLOUDINARY) {
      cloudinary.config({
        cloud_name: this.configService.get<string>("CLOUDINARY_CLOUD_NAME"),
        api_key: this.configService.get<string>("CLOUDINARY_API_KEY"),
        api_secret: this.configService.get<string>("CLOUDINARY_API_SECRET"),
      })
    }

    // Initialize AWS S3 if needed
    if (this.storageType === StorageType.S3) {
      this.s3 = new S3({
        accessKeyId: this.configService.get<string>("AWS_ACCESS_KEY_ID"),
        secretAccessKey: this.configService.get<string>("AWS_SECRET_ACCESS_KEY"),
        region: this.configService.get<string>("AWS_REGION"),
      })
    }

    // Create upload directory if it doesn't exist
    if (this.storageType === StorageType.LOCAL) {
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true })
      }
    }
  }

  /**
   * Upload a file to the configured storage
   * @param file The file buffer or path
   * @param options Upload options
   * @returns The URL of the uploaded file
   */
  async uploadFile(
    file: Buffer | string,
    options: {
      filename?: string
      folder?: string
      mimetype?: string
    } = {},
  ): Promise<string> {
    const { filename = `file_${Date.now()}`, folder = "", mimetype } = options

    switch (this.storageType) {
      case StorageType.LOCAL:
        return this.uploadToLocal(file, { filename, folder })
      case StorageType.CLOUDINARY:
        return this.uploadToCloudinary(file, { filename, folder })
      case StorageType.S3:
        return this.uploadToS3(file, { filename, folder, mimetype })
      default:
        throw new Error(`Unsupported storage type: ${this.storageType}`)
    }
  }

  /**
   * Delete a file from the configured storage
   * @param fileUrl The URL or path of the file to delete
   * @returns True if the file was deleted successfully
   */
  async deleteFile(fileUrl: string): Promise<boolean> {
    switch (this.storageType) {
      case StorageType.LOCAL:
        return this.deleteFromLocal(fileUrl)
      case StorageType.CLOUDINARY:
        return this.deleteFromCloudinary(fileUrl)
      case StorageType.S3:
        return this.deleteFromS3(fileUrl)
      default:
        throw new Error(`Unsupported storage type: ${this.storageType}`)
    }
  }

  /**
   * Upload a file to local storage
   */
  private async uploadToLocal(file: Buffer | string, options: { filename: string; folder: string }): Promise<string> {
    const { filename, folder } = options
    const folderPath = path.join(this.uploadDir, folder)

    // Create folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      await mkdirAsync(folderPath, { recursive: true })
    }

    const filePath = path.join(folderPath, filename)

    if (typeof file === "string") {
      // If file is a path, copy it
      fs.copyFileSync(file, filePath)
    } else {
      // If file is a buffer, write it
      await writeFileAsync(filePath, file)
    }

    // Return the relative URL
    return `/${path.relative(process.cwd(), filePath).replace(/\\/g, "/")}`
  }

  /**
   * Upload a file to Cloudinary
   */
  private async uploadToCloudinary(
    file: Buffer | string,
    options: { filename: string; folder: string },
  ): Promise<string> {
    const { folder } = options

    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder,
        resource_type: "auto",
      }

      if (typeof file === "string") {
        cloudinary.uploader.upload(file, uploadOptions, (error, result) => {
          if (error) return reject(error)
          resolve(result.secure_url)
        })
      } else {
        cloudinary.uploader
          .upload_stream(uploadOptions, (error, result) => {
            if (error) return reject(error)
            resolve(result.secure_url)
          })
          .end(file)
      }
    })
  }

  /**
   * Upload a file to AWS S3
   */
  private async uploadToS3(
    file: Buffer | string,
    options: { filename: string; folder: string; mimetype?: string },
  ): Promise<string> {
    const { filename, folder, mimetype } = options
    const key = folder ? `${folder}/${filename}` : filename

    let fileBuffer: Buffer

    if (typeof file === "string") {
      fileBuffer = fs.readFileSync(file)
    } else {
      fileBuffer = file
    }

    const params = {
      Bucket: this.configService.get<string>("AWS_S3_BUCKET"),
      Key: key,
      Body: fileBuffer,
      ContentType: mimetype,
      ACL: "public-read",
    }

    const result = await this.s3.upload(params).promise()
    return result.Location
  }

  /**
   * Delete a file from local storage
   */
  private async deleteFromLocal(fileUrl: string): Promise<boolean> {
    try {
      const filePath = path.join(process.cwd(), fileUrl)
      if (fs.existsSync(filePath)) {
        await unlinkAsync(filePath)
        return true
      }
      return false
    } catch (error) {
      console.error("Error deleting local file:", error)
      return false
    }
  }

  /**
   * Delete a file from Cloudinary
   */
  private async deleteFromCloudinary(fileUrl: string): Promise<boolean> {
    try {
      // Extract public ID from URL
      const publicId = fileUrl.split("/").pop().split(".")[0]

      return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) return reject(error)
          resolve(result.result === "ok")
        })
      })
    } catch (error) {
      console.error("Error deleting Cloudinary file:", error)
      return false
    }
  }

  /**
   * Delete a file from AWS S3
   */
  private async deleteFromS3(fileUrl: string): Promise<boolean> {
    try {
      // Extract key from URL
      const urlParts = new URL(fileUrl)
      const key = urlParts.pathname.substring(1) // Remove leading slash

      const params = {
        Bucket: this.configService.get<string>("AWS_S3_BUCKET"),
        Key: key,
      }

      await this.s3.deleteObject(params).promise()
      return true
    } catch (error) {
      console.error("Error deleting S3 file:", error)
      return false
    }
  }
}

