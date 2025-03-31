import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  Req,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from "@nestjs/common"
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from "@nestjs/swagger"

import type { VendorsService } from "./vendors.service"
import type { CreateVendorDto } from "./dto/create-vendor.dto"
import type { UpdateVendorDto } from "./dto/update-vendor.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { Role } from "@prisma/client"
import type { Express } from "express"

@ApiTags("vendors")
@Controller("vendors")
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new vendor profile" })
  @ApiResponse({ status: 201, description: "Vendor profile created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async create(@Body() createVendorDto: CreateVendorDto, @Req() req) {
    return this.vendorsService.create(req.user.id, createVendorDto)
  }

  @Get()
  @ApiOperation({ summary: "Get all vendors" })
  @ApiQuery({ name: "isVerified", type: Boolean, required: false })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "skip", type: Number, required: false })
  @ApiQuery({ name: "take", type: Number, required: false })
  @ApiResponse({ status: 200, description: "List of vendors" })
  async findAll(
    @Query('isVerified') isVerified?: boolean,
    @Query('search') search?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    const vendors = await this.vendorsService.findAll({
      isVerified,
      search,
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
    })

    const count = await this.vendorsService.count({
      isVerified,
      search,
    })

    return {
      data: vendors,
      meta: {
        total: count,
        skip: skip ? +skip : 0,
        take: take ? +take : vendors.length,
      },
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current vendor profile' })
  @ApiResponse({ status: 200, description: 'Vendor profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findMe(@Req() req) {
    return this.vendorsService.findByUserId(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vendor by ID' })
  @ApiResponse({ status: 200, description: 'Vendor details' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async findOne(@Param('id') id: string) {
    return this.vendorsService.findById(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update vendor profile" })
  @ApiResponse({ status: 200, description: "Vendor profile updated successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Vendor not found" })
  async update(@Param('id') id: string, @Body() updateVendorDto: UpdateVendorDto, @Req() req) {
    // Check if user has permission to update this vendor
    const vendor = await this.vendorsService.findById(id)
    if (req.user.role !== Role.ADMIN && vendor.userId !== req.user.id) {
      throw new Error("You do not have permission to update this vendor")
    }

    return this.vendorsService.update(id, updateVendorDto)
  }

  @Patch(":id/verify")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Verify vendor (Admin only)" })
  @ApiResponse({ status: 200, description: "Vendor verified successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Vendor not found" })
  async verify(@Param('id') id: string, @Body('isVerified') isVerified: boolean) {
    return this.vendorsService.verify(id, isVerified)
  }

  @Post(":id/logo")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor("logo"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        logo: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @ApiOperation({ summary: "Upload vendor logo" })
  @ApiResponse({ status: 200, description: "Logo uploaded successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Vendor not found" })
  async uploadLogo(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Req() req) {
    // Check if user has permission to update this vendor
    const vendor = await this.vendorsService.findById(id)
    if (req.user.role !== Role.ADMIN && vendor.userId !== req.user.id) {
      throw new Error("You do not have permission to update this vendor")
    }

    return this.vendorsService.uploadLogo(id, file)
  }

  @Post(":id/banner")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor("banner"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        banner: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @ApiOperation({ summary: "Upload vendor banner" })
  @ApiResponse({ status: 200, description: "Banner uploaded successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Vendor not found" })
  async uploadBanner(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Req() req) {
    // Check if user has permission to update this vendor
    const vendor = await this.vendorsService.findById(id)
    if (req.user.role !== Role.ADMIN && vendor.userId !== req.user.id) {
      throw new Error("You do not have permission to update this vendor")
    }

    return this.vendorsService.uploadBanner(id, file)
  }

  @Post(":id/documents")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor("documents", 5))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        documents: {
          type: "array",
          items: {
            type: "string",
            format: "binary",
          },
        },
      },
    },
  })
  @ApiOperation({ summary: "Upload vendor verification documents" })
  @ApiResponse({ status: 200, description: "Documents uploaded successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Vendor not found" })
  async uploadDocuments(@Param('id') id: string, @UploadedFiles() files: Express.Multer.File[], @Req() req) {
    // Check if user has permission to update this vendor
    const vendor = await this.vendorsService.findById(id)
    if (req.user.role !== Role.ADMIN && vendor.userId !== req.user.id) {
      throw new Error("You do not have permission to update this vendor")
    }

    return this.vendorsService.uploadVerificationDocuments(id, files)
  }
}

