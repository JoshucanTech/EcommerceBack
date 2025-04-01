import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from "@nestjs/common"
import type { JwtService } from "@nestjs/jwt"
import type { ConfigService } from "@nestjs/config"
import type { PrismaService } from "../prisma/prisma.service"
import type { RegisterDto } from "./dto/register.dto"
import type { LoginDto } from "./dto/login.dto"
import * as bcrypt from "bcrypt"

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, phone, role } = registerDto

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new ConflictException("Email already exists")
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: role || "BUYER",
      },
    })

    // Create user settings
    await this.prisma.userSettings.create({
      data: {
        userId: user.id,
      },
    })

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role)

    // Save refresh token
    await this.saveRefreshToken(user.id, tokens.refreshToken)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      ...tokens,
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new UnauthorizedException("Invalid credentials")
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException("User account is inactive")
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials")
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role)

    // Save refresh token
    await this.saveRefreshToken(user.id, tokens.refreshToken)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      ...tokens,
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get("JWT_REFRESH_SECRET"),
      })

      // Check if token exists in database
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      })

      if (!storedToken) {
        throw new UnauthorizedException("Invalid refresh token")
      }

      // Check if token is expired
      if (new Date() > storedToken.expiresAt) {
        // Delete expired token
        await this.prisma.refreshToken.delete({
          where: { id: storedToken.id },
        })
        throw new UnauthorizedException("Refresh token expired")
      }

      // Generate new tokens
      const tokens = await this.generateTokens(storedToken.user.id, storedToken.user.email, storedToken.user.role)

      // Delete old refresh token
      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      })

      // Save new refresh token
      await this.saveRefreshToken(storedToken.user.id, tokens.refreshToken)

      return tokens
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token")
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        addresses: {
          where: { isDefault: true },
        },
        vendor: {
          select: {
            id: true,
            businessName: true,
            slug: true,
            isVerified: true,
          },
        },
        rider: {
          select: {
            id: true,
            isVerified: true,
            isAvailable: true,
          },
        },
        settings: true,
      },
    })

    if (!user) {
      throw new BadRequestException("User not found")
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    return userWithoutPassword
  }

  async logout(userId: string, refreshToken: string) {
    // Delete refresh token
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        token: refreshToken,
      },
    })

    return { message: "Logged out successfully" }
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
        },
        {
          secret: this.configService.get("JWT_ACCESS_SECRET"),
          expiresIn: this.configService.get("JWT_ACCESS_EXPIRATION"),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
        },
        {
          secret: this.configService.get("JWT_REFRESH_SECRET"),
          expiresIn: this.configService.get("JWT_REFRESH_EXPIRATION"),
        },
      ),
    ])

    return {
      accessToken,
      refreshToken,
    }
  }

  private async saveRefreshToken(userId: string, refreshToken: string) {
    // Calculate expiration date
    const expiresIn = this.configService.get("JWT_REFRESH_EXPIRATION")
    const expiresAt = new Date()
    expiresAt.setTime(expiresAt.getTime() + Number.parseInt(expiresIn) * 1000)

    // Save refresh token
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    })
  }
}

