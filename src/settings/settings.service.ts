import { Injectable, NotFoundException } from "@nestjs/common"
import type { PrismaService } from "../prisma/prisma.service"
import type { CreateSettingsDto } from "./dto/create-settings.dto"
// import type { UpdateSettingsDto } from "./dto/update-settings.dto"
import type { Settings } from "@prisma/client"

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new setting
   * @param createSettingsDto Settings creation data
   * @returns The created setting
   */
  async create(createSettingsDto: CreateSettingsDto): Promise<Settings> {
    return this.prisma.settings.create({
      data: createSettingsDto,
    })
  }

  /**
   * Find all settings
   * @returns Array of settings
   */
  async findAll(): Promise<Settings[]> {
    return this.prisma.settings.findMany()
  }

  /**
   * Find a setting by key
   * @param key Setting key
   * @returns The found setting or null
   */
  async findOne(key: string): Promise<Settings | null> {
    return this.prisma.settings.findUnique({
      where: { key },
    })
  }

  /**
   * Update a setting
   * @param key Setting key
   * @param updateSettingsDto Settings update data
   * @returns The updated setting
   */
  // async update(key: string, updateSettingsDto: UpdateSettingsDto): Promise<Settings> {
  //   const setting = await this.findOne(key)
  //   if (!setting) {
  //     throw new NotFoundException(`Setting with key ${key} not found`)
  //   }

  //   return this.prisma.settings.update({
  //     where: { key },
  //     data: updateSettingsDto,
  //   })
  // }

  /**
   * Delete a setting
   * @param key Setting key
   */
  async remove(key: string): Promise<void> {
    const setting = await this.findOne(key)
    if (!setting) {
      throw new NotFoundException(`Setting with key ${key} not found`)
    }

    await this.prisma.settings.delete({
      where: { key },
    })
  }
}

