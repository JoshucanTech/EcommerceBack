import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import type { PrismaService } from "../prisma/prisma.service"
import type { UsersService } from "../users/users.service"
import type { CreateVendorDto } from "./dto/create-vendor.dto"
import type { UpdateVendorDto } from "./dto/update-vendor.dto"
import { type Vendor, Role } from "@prisma/client"
import type { StorageService } from "../common/services/storage.service"
import type { EmailService } from "../common/services/email.service"
import type { Express } from "express"

@Injectable()
export class VendorsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private storageService: StorageService,
    private emailService: EmailService,
  ) {}

  /**
   * Create a new vendor
   * @param userId User ID
   * @param createVendorDto Vendor creation data
   * @returns The created vendor
   */
  async create(userId: string, createVendorDto: CreateVendorDto): Promise<Vendor> {
    const user = await this.usersService.findById(userId)
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`)
    }

    // Check if user already has a vendor profile
    const existingVendor = await this.prisma.vendor.findUnique({
      where: { userId },
    })

    if (existingVendor) {
      throw new BadRequestException("User already has a vendor profile")
    }

    // Update user role to VENDOR
    await this.usersService.update(userId, { role: Role.VENDOR })

    // Create vendor profile
    return this.prisma.vendor.create({
      data: {
        userId,
        ...createVendorDto,
      },
    })
  }

  /**
   * Find all vendors with optional filtering
   * @param options Query options
   * @returns Array of vendors
   */
  async findAll(options?: {
    isVerified?: boolean
    search?: string
    skip?: number
    take?: number
  }): Promise<Vendor[]> {
    const { isVerified, search, skip, take } = options || {}

    return this.prisma.vendor.findMany({
      where: {
        ...(isVerified !== undefined && { isVerified }),
        ...(search && {
          OR: [
            { businessName: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
            isActive: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      skip,
      take,
      orderBy: {
        businessName: "asc",
      },
    })
  }

  /**
   * Find a vendor by ID
   * @param id Vendor ID
   * @returns The found vendor or null
   */
  async findById(id: string): Promise<Vendor | null> {
    return this.prisma.vendor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
            isActive: true,
            isVerified: true,
          },
        },
        products: {
          take: 10,
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    })
  }

  /**
   * Find a vendor by user ID
   * @param userId User ID
   * @returns The found vendor or null
   */
  async findByUserId(userId: string): Promise<Vendor | null> {
    return this.prisma.vendor.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
            isActive: true,
            isVerified: true,
          },
        },
        products: {
          take: 10,
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    })
  }

  /**
   * Update a vendor
   * @param id Vendor ID
   * @param updateVendorDto Vendor update data
   * @returns The updated vendor
   */
  async update(id: string, updateVendorDto: UpdateVendorDto): Promise<Vendor> {
    const vendor = await this.findById(id)
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`)
    }

    return this.prisma.vendor.update({
      where: { id },
      data: updateVendorDto,
    })
  }

  /**
   * Verify a vendor
   * @param id Vendor ID
   * @param isVerified Verification status
   * @returns The updated vendor
   */
  async verify(id: string, isVerified: boolean): Promise<Vendor> {
    const vendor = await this.findById(id)
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`)
    }

    const updatedVendor = await this.prisma.vendor.update({
      where: { id },
      data: { isVerified },
      include: {
        user: true,
      },
    })

    // Send verification email
    if (isVerified && updatedVendor.user.email) {
      await this.emailService.sendEmail(
        updatedVendor.user.email,
        "Vendor Account Verified",
        `Congratulations! Your vendor account "${updatedVendor.businessName}" has been verified. You can now start selling products on our platform.`,
      )
    }

    return updatedVendor
  }

  /**
   * Upload vendor logo
   * @param id Vendor ID
   * @param file Logo file
   * @returns The updated vendor
   */
  async uploadLogo(id: string, file: Express.Multer.File): Promise<Vendor> {
    const vendor = await this.findById(id)
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`)
    }

    // Delete old logo if exists
    if (vendor.businessLogo) {
      await this.storageService.deleteFile(vendor.businessLogo)
    }

    // Upload new logo
    const logoUrl = await this.storageService.uploadFile(file.buffer, {
      filename: `${Date.now()}-${file.originalname}`,
      folder: `vendors/${id}/logo`,
      mimetype: file.mimetype,
    })

    return this.prisma.vendor.update({
      where: { id },
      data: {
        businessLogo: logoUrl,
      },
    })
  }

  /**
   * Upload vendor banner
   * @param id Vendor ID
   * @param file Banner file
   * @returns The updated vendor
   */
  async uploadBanner(id: string, file: Express.Multer.File): Promise<Vendor> {
    const vendor = await this.findById(id)
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`)
    }

    // Delete old banner if exists
    if (vendor.businessBanner) {
      await this.storageService.deleteFile(vendor.businessBanner)
    }

    // Upload new banner
    const bannerUrl = await this.storageService.uploadFile(file.buffer, {
      filename: `${Date.now()}-${file.originalname}`,
      folder: `vendors/${id}/banner`,
      mimetype: file.mimetype,
    })

    return this.prisma.vendor.update({
      where: { id },
      data: {
        businessBanner: bannerUrl,
      },
    })
  }

  /**
   * Upload vendor verification documents
   * @param id Vendor ID
   * @param files Document files
   * @returns The updated vendor
   */
  async uploadVerificationDocuments(id: string, files: Express.Multer.File[]): Promise<Vendor> {
    const vendor = await this.findById(id)
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`)
    }

    // Upload new documents
    const documentUrls = await Promise.all(
      files.map((file) =>
        this.storageService.uploadFile(file.buffer, {
          filename: `${Date.now()}-${file.originalname}`,
          folder: `vendors/${id}/documents`,
          mimetype: file.mimetype,
        }),
      ),
    )

    return this.prisma.vendor.update({
      where: { id },
      data: {
        verificationDocuments: [...vendor.verificationDocuments, ...documentUrls],
      },
    })
  }

  /**
   * Count vendors with optional filtering
   * @param options Query options
   * @returns Number of vendors
   */
  async count(options?: {
    isVerified?: boolean
    search?: string
  }): Promise<number> {
    const { isVerified, search } = options || {}

    return this.prisma.vendor.count({
      where: {
        ...(isVerified !== undefined && { isVerified }),
        ...(search && {
          OR: [
            { businessName: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
    })
  }
}

