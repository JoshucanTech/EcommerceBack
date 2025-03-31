import { Injectable, NotFoundException } from "@nestjs/common"
import type { PrismaService } from "../prisma/prisma.service"
import type { CreateUserDto } from "./dto/create-user.dto"
import type { UpdateUserDto } from "./dto/update-user.dto"
import type { Role, User } from "@prisma/client"

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new user
   * @param createUserDto User creation data
   * @returns The created user
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.prisma.user.create({
      data: createUserDto,
    })
  }

  /**
   * Find all users with optional filtering
   * @param options Query options
   * @returns Array of users
   */
  async findAll(options?: {
    role?: Role
    isActive?: boolean
    isVerified?: boolean
    skip?: number
    take?: number
  }): Promise<User[]> {
    const { role, isActive, isVerified, skip, take } = options || {}

    return this.prisma.user.findMany({
      where: {
        ...(role !== undefined && { role }),
        ...(isActive !== undefined && { isActive }),
        ...(isVerified !== undefined && { isVerified }),
      },
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
    })
  }

  /**
   * Find a user by ID
   * @param id User ID
   * @returns The found user or null
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    })
  }

  /**
   * Find a user by email
   * @param email User email
   * @returns The found user or null
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    })
  }

  /**
   * Find a user by verification token
   * @param token Verification token
   * @returns The found user or null
   */
  async findByVerificationToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { verificationToken: token },
    })
  }

  /**
   * Find a user by reset token
   * @param token Reset token
   * @returns The found user or null
   */
  async findByResetToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { resetToken: token },
    })
  }

  /**
   * Update a user
   * @param id User ID
   * @param updateUserDto User update data
   * @returns The updated user
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id)
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    })
  }

  /**
   * Delete a user
   * @param id User ID
   * @returns The deleted user
   */
  async remove(id: string): Promise<User> {
    const user = await this.findById(id)
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }

    return this.prisma.user.delete({
      where: { id },
    })
  }

  /**
   * Count users with optional filtering
   * @param options Query options
   * @returns Number of users
   */
  async count(options?: {
    role?: Role
    isActive?: boolean
    isVerified?: boolean
  }): Promise<number> {
    const { role, isActive, isVerified } = options || {}

    return this.prisma.user.count({
      where: {
        ...(role !== undefined && { role }),
        ...(isActive !== undefined && { isActive }),
        ...(isVerified !== undefined && { isVerified }),
      },
    })
  }

  /**
   * Remove sensitive information from user object
   * @param user User object
   * @returns Sanitized user object
   */
  sanitizeUser(user: User): Partial<User> {
    const { password, verificationToken, resetToken, resetTokenExpiry, ...sanitizedUser } = user
    return sanitizedUser
  }
}

