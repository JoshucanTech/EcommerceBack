import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
  HttpCode,
  HttpStatus,
} from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger"

import type { CouponsService } from "./coupons.service"
import type { CreateCouponDto } from "./dto/create-coupon.dto"
import type { UpdateCouponDto } from "./dto/update-coupon.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { CouponType, Role } from "@prisma/client"

@ApiTags("coupons")
@Controller("coupons")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @Roles(Role.VENDOR, Role.ADMIN)
  @ApiOperation({ summary: "Create a new coupon (Vendor or Admin only)" })
  @ApiResponse({ status: 201, description: "Coupon created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async create(@Body() createCouponDto: CreateCouponDto, @Req() req) {
    const vendorId = req.user.role === Role.ADMIN ? createCouponDto.vendorId : req.user.vendor.id

    return this.couponsService.create(vendorId, createCouponDto)
  }

  @Get()
  @ApiOperation({ summary: "Get all coupons" })
  @ApiQuery({ name: "vendorId", required: false })
  @ApiQuery({ name: "type", enum: CouponType, required: false })
  @ApiQuery({ name: "isActive", type: Boolean, required: false })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "skip", type: Number, required: false })
  @ApiQuery({ name: "take", type: Number, required: false })
  @ApiResponse({ status: 200, description: "List of coupons" })
  async findAll(
    @Query('vendorId') vendorId?: string,
    @Query('type') type?: CouponType,
    @Query('isActive') isActive?: boolean,
    @Query('search') search?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.couponsService.findAll({
      vendorId,
      type,
      isActive,
      search,
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
    })
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get coupon by ID' })
  @ApiResponse({ status: 200, description: 'Coupon details' })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  async findOne(@Param('id') id: string) {
    return this.couponsService.findOne(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get coupon by code' })
  @ApiResponse({ status: 200, description: 'Coupon details' })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  async findByCode(@Param('code') code: string) {
    return this.couponsService.findByCode(code);
  }

  @Patch(":id")
  @Roles(Role.VENDOR, Role.ADMIN)
  @ApiOperation({ summary: "Update coupon (Vendor or Admin only)" })
  @ApiResponse({ status: 200, description: "Coupon updated successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Coupon not found" })
  async update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponsService.update(id, updateCouponDto)
  }

  @Delete(':id')
  @Roles(Role.VENDOR, Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete coupon (Vendor or Admin only)' })
  @ApiResponse({ status: 204, description: 'Coupon deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  async remove(@Param('id') id: string) {
    await this.couponsService.remove(id);
  }
}

