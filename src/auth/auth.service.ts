import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common"
import type { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcrypt"
import type { UsersService } from "../users/users.service"
import type { LoginDto } from "./dto/login.dto"
import type { RegisterDto } from "./dto/register.dto"
import type { User } from "../users/entities/user.entity"

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Validate user credentials
   * @param email User email
   * @param password User password
   * @returns User object without password
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email)
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user
      return result
    }
    return null
  }

  /**
   * Login user and generate JWT token
   * @param loginDto Login credentials
   * @returns JWT token and user data
   */
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password)
    if (!user) {
      throw new UnauthorizedException("Invalid credentials")
    }

    // Update last login timestamp
    await this.usersService.updateLastLogin(user.id)

    return this.generateToken(user)
  }

  /**
   * Register a new user
   * @param registerDto User registration data
   * @returns JWT token and user data
   */
  async register(registerDto: RegisterDto) {
    // Check if email already exists
    const existingEmail = await this.usersService.findByEmail(registerDto.email)
    if (existingEmail) {
      throw new BadRequestException("Email already exists")
    }

    // Check if username already exists
    const existingUsername = await this.usersService.findByUsername(registerDto.username)
    if (existingUsername) {
      throw new BadRequestException("Username already exists")
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10)

    // Create user
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    })

    // Remove password from response
    const { password, ...result } = user

    return this.generateToken(result)
  }

  /**
   * Handle Google OAuth login
   * @param profile Google profile data
   * @returns JWT token and user data
   */
  async googleLogin(profile: any) {
    let user = await this.usersService.findByEmail(profile.email)

    if (!user) {
      // Create a new user with Google profile data
      user = await this.usersService.create({
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        username: profile.email.split("@")[0],
        password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10),
        isEmailVerified: true,
        profileImage: profile.picture,
      })
    }

    // Update last login timestamp
    await this.usersService.updateLastLogin(user.id)

    const { password, ...result } = user
    return this.generateToken(result)
  }

  /**
   * Generate JWT token for authenticated user
   * @param user User data
   * @returns JWT token and user data
   */
  private generateToken(user: Partial<User>) {
    const payload = { email: user.email, sub: user.id, role: user.role }

    return {
      access_token: this.jwtService.sign(payload),
      user,
    }
  }
}

