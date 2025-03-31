import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common"
import type { JwtService } from "@nestjs/jwt"
import type { ConfigService } from "@nestjs/config"
import * as bcrypt from "bcrypt"
import { v4 as uuidv4 } from "uuid"

import type { UsersService } from "../users/users.service"
import type { EmailService } from "../common/services/email.service"
import type { SmsService } from "../common/services/sms.service"
import type { RegisterDto } from "./dto/register.dto"
import type { LoginDto } from "./dto/login.dto"
import type { ForgotPasswordDto } from "./dto/forgot-password.dto"
import type { ResetPasswordDto } from "./dto/reset-password.dto"
import type { VerifyEmailDto } from "./dto/verify-email.dto"
import { Role } from "@prisma/client"

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private smsService: SmsService,
    private configService: ConfigService,
  ) {}

  /**
   * Register a new user
   * @param registerDto User registration data
   * @returns The created user and access token
   */
  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, phone, role } = registerDto

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email)
    if (existingUser) {
      throw new BadRequestException("User with this email already exists")
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate verification token
    const verificationToken = uuidv4()

    // Create the user
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: role || Role.BUYER,
      verificationToken,
      isVerified: false,
    })

    // Generate JWT token
    const token = this.generateToken(user)

    // Send verification email
    const frontendUrl = this.configService.get<string>("FRONTEND_URL")
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`
    await this.emailService.sendWelcomeEmail(email, firstName || email, verificationUrl)

    // Return user and token
    return {
      user: this.usersService.sanitizeUser(user),
      token,
    }
  }

  /**
   * Authenticate a user and return a JWT token
   * @param loginDto User login credentials
   * @returns The authenticated user and access token
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto

    // Find the user
    const user = await this.usersService.findByEmail(email)
    if (!user) {
      throw new UnauthorizedException("Invalid credentials")
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials")
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException("Your account has been deactivated")
    }

    // Generate JWT token
    const token = this.generateToken(user)

    // Return user and token
    return {
      user: this.usersService.sanitizeUser(user),
      token,
    }
  }

  /**
   * Verify a user's email address
   * @param verifyEmailDto Email verification data
   * @returns Success message
   */
  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { token } = verifyEmailDto

    // Find user by verification token
    const user = await this.usersService.findByVerificationToken(token)
    if (!user) {
      throw new BadRequestException("Invalid verification token")
    }

    // Update user as verified
    await this.usersService.update(user.id, {
      isVerified: true,
      verificationToken: null,
    })

    return { message: "Email verified successfully" }
  }

  /**
   * Initiate password reset process
   * @param forgotPasswordDto Forgot password data
   * @returns Success message
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto

    // Find the user
    const user = await this.usersService.findByEmail(email)
    if (!user) {
      // Don't reveal that the user doesn't exist
      return { message: "If your email is registered, you will receive a password reset link" }
    }

    // Generate reset token
    const resetToken = uuidv4()
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Update user with reset token
    await this.usersService.update(user.id, {
      resetToken,
      resetTokenExpiry,
    })

    // Send password reset email
    const frontendUrl = this.configService.get<string>("FRONTEND_URL")
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`
    await this.emailService.sendPasswordResetEmail(email, resetUrl)

    return { message: "If your email is registered, you will receive a password reset link" }
  }

  /**
   * Reset user's password
   * @param resetPasswordDto Reset password data
   * @returns Success message
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto

    // Find user by reset token
    const user = await this.usersService.findByResetToken(token)
    if (!user) {
      throw new BadRequestException("Invalid or expired reset token")
    }

    // Check if token is expired
    if (user.resetTokenExpiry < new Date()) {
      throw new BadRequestException("Reset token has expired")
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user with new password
    await this.usersService.update(user.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    })

    return { message: "Password reset successfully" }
  }

  /**
   * Validate user for local strategy
   * @param email User's email
   * @param password User's password
   * @returns The validated user
   */
  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email)
    if (!user) {
      return null
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return null
    }

    return this.usersService.sanitizeUser(user)
  }

  /**
   * Generate JWT token for a user
   * @param user User object
   * @returns JWT token
   */
  generateToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    }
    return this.jwtService.sign(payload)
  }

  /**
   * Validate JWT token payload
   * @param payload JWT payload
   * @returns The validated user
   */
  async validateJwtPayload(payload: any) {
    const user = await this.usersService.findById(payload.sub)
    if (!user || !user.isActive) {
      return null
    }
    return this.usersService.sanitizeUser(user)
  }
}

