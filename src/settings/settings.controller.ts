import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"

import type { SettingsService } from "./settings.service"
import type { CreateSettingsDto } from "./dto/create-settings.dto"
// import type { UpdateSettingsDto } from "./dto/update-settings.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { Role } from "@prisma/client"

@ApiTags("settings")
@Controller("settings")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new setting (Admin only)' })
  @ApiResponse({ status: 201, description: 'Setting created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createSettingsDto: CreateSettingsDto) {
    return this.settingsService.create(createSettingsDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all settings (Admin only)" })
  @ApiResponse({ status: 200, description: "List of settings" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async findAll() {
    return this.settingsService.findAll()
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get setting by key (Admin only)' })
  @ApiResponse({ status: 200, description: 'Setting details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Setting not found' })
  async findOne(@Param('key') key: string) {
    return this.settingsService.findOne(key);
  }

  @Patch(":key")
  @ApiOperation({ summary: "Update setting (Admin only)" })
  @ApiResponse({ status: 200, description: "Setting updated successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Setting not found" })
  // async update(@Param('key') key: string, @Body() updateSettingsDto: UpdateSettingsDto) {
  //   return this.settingsService.update(key, updateSettingsDto)
  // }

  @Delete(':key')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete setting (Admin only)' })
  @ApiResponse({ status: 204, description: 'Setting deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Setting not found' })
  async remove(@Param('key') key: string) {
    await this.settingsService.remove(key);
  }
}

