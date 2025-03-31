import { Injectable, BadRequestException } from "@nestjs/common"
import type { StorageService } from "../common/services/storage.service"
import type { Express } from "express"

@Injectable()
export class UploadsService {
  constructor(private storageService: StorageService) {}

  /**
   * Upload a single file
   * @param file Uploaded file
   * @param options Upload options
   * @returns The uploaded file URL
   */
  async uploadFile(
    file: Express.Multer.File,
    options?: {
      folder?: string
      filename?: string
    },
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException("No file uploaded")
    }

    return this.storageService.uploadFile(file.buffer, {
      filename: file.originalname,
      folder: options?.folder,
      mimetype: file.mimetype,
    })
  }

  /**
   * Upload multiple files
   * @param files Array of uploaded files
   * @param options Upload options
   * @returns Array of uploaded file URLs
   */
  async uploadFiles(
    files: Express.Multer.File[],
    options?: {
      folder?: string
      filename?: string
    },
  ): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException("No files uploaded")
    }

    return Promise.all(
      files.map((file) =>
        this.storageService.uploadFile(file.buffer, {
          filename: file.originalname,
          folder: options?.folder,
          mimetype: file.mimetype,
        }),
      ),
    )
  }
}

