import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, UploadedFiles, Query } from "@nestjs/common"
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from "@nestjs/swagger"
import type { Express } from "express"

import type { UploadsService } from "./uploads.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@ApiTags("uploads")
@Controller("uploads")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post("file")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @ApiOperation({ summary: "Upload a single file" })
  @ApiResponse({ status: 200, description: "File uploaded successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Query('folder') folder?: string) {
    return this.uploadsService.uploadFile(file, { folder })
  }

  @Post("files")
  @UseInterceptors(FilesInterceptor("files"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        files: {
          type: "array",
          items: {
            type: "string",
            format: "binary",
          },
        },
      },
    },
  })
  @ApiOperation({ summary: "Upload multiple files" })
  @ApiResponse({ status: 200, description: "Files uploaded successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[], @Query('folder') folder?: string) {
    return this.uploadsService.uploadFiles(files, { folder })
  }
}

