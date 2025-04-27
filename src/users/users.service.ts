import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import * as bcrypt from "bcrypt"
import { User } from "./entities/user.entity"
import type { CreateUserDto } from "./dto/create-user.dto"
import type { UpdateUserDto } from "./dto/update-user.dto"

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Create a new user
   * @param createUserDto User creation data
   * @returns Created user
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto)
    return this.usersRepository.save(user)
  }

  /**
   * Find all users with pagination
   * @param page Page number
   * @param limit Items per page
   * @returns Paginated users
   */
  async findAll(page = 1, limit = 10) {
    const [users, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
    })

    // Remove passwords from response
    const usersWithoutPasswords = users.map((user) => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })

    return {
      data: usersWithoutPasswords,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Find a user by ID
   * @param id User ID
   * @returns User
   */
  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }
    return user
  }

  /**
   * Find a user by email
   * @param email User email
   * @returns User
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } })
  }

  /**
   * Find a user by username
   * @param username User username
   * @returns User
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } })
  }

  /**
   * Update a user
   * @param id User ID
   * @param updateUserDto User update data
   * @returns Updated user
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id)

    // Hash password if provided
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10)
    }

    // Update user
    const updatedUser = Object.assign(user, updateUserDto)
    await this.usersRepository.save(updatedUser)

    // Remove password from response
    const { password, ...result } = updatedUser
    return result as User
  }

  /**
   * Update user's last login timestamp
   * @param id User ID
   */
  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, { lastLogin: new Date() })
  }

  /**
   * Remove a user
   * @param id User ID
   * @returns Deletion result
   */
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id)
    await this.usersRepository.softRemove(user)
  }
}

