import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query, Req } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger"

import type { DeliveriesService } from "./deliveries.service"
import type { CreateDeliveryDto } from "./dto/create-delivery.dto"
import type { UpdateDeliveryDto } from "./dto/update-delivery.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { DeliveryStatus, Role } from "@prisma/client"

@ApiTags("deliveries")
@Controller("deliveries")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post(":orderId")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Create a new delivery (Admin only)" })
  @ApiResponse({ status: 201, description: "Delivery created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async create(@Param('orderId') orderId: string, @Body() createDeliveryDto: CreateDeliveryDto) {
    return this.deliveriesService.create(orderId, createDeliveryDto)
  }

  @Get()
  @Roles(Role.ADMIN, Role.RIDER)
  @ApiOperation({ summary: "Get all deliveries (Admin or Rider only)" })
  @ApiQuery({ name: "riderId", required: false })
  @ApiQuery({ name: "status", enum: DeliveryStatus, required: false })
  @ApiQuery({ name: "skip", type: Number, required: false })
  @ApiQuery({ name: "take", type: Number, required: false })
  @ApiResponse({ status: 200, description: "List of deliveries" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async findAll(
    @Query('riderId') riderId?: string,
    @Query('status') status?: DeliveryStatus,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Req() req,
  ) {
    // If rider, only show assigned deliveries
    if (req.user.role === Role.RIDER) {
      riderId = req.user.id
    }

    return {
      data: await this.deliveriesService.findAll({
        riderId,
        status,
        skip: skip ? +skip : undefined,
        take: take ? +take : undefined,
      }),
      meta: {
        total: await this.deliveriesService.count({ riderId, status }),
        skip: skip ? +skip : 0,
        take: take ? +take : 10,
      },
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get delivery by ID' })
  @ApiResponse({ status: 200, description: 'Delivery details' })
  @ApiResponse({ status: 404, description: 'Delivery not found' })
  async findOne(@Param('id') id: string) {
    return this.deliveriesService.findOne(id);
  }

  @Patch(":id")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Update delivery (Admin only)" })
  @ApiResponse({ status: 200, description: "Delivery updated successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Delivery not found" })
  async update(@Param('id') id: string, @Body() updateDeliveryDto: UpdateDeliveryDto) {
    return this.deliveriesService.update(id, updateDeliveryDto)
  }

  @Post(":id/assign/:riderId")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Assign a rider to a delivery (Admin only)" })
  @ApiResponse({ status: 200, description: "Rider assigned successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Delivery or rider not found" })
  async assignRider(@Param('id') id: string, @Param('riderId') riderId: string) {
    return this.deliveriesService.assignRider(id, riderId)
  }

  @Patch(":id/status")
  @Roles(Role.ADMIN, Role.RIDER)
  @ApiOperation({ summary: "Update delivery status (Admin or Rider only)" })
  @ApiResponse({ status: 200, description: "Delivery status updated successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Delivery not found" })
  async updateStatus(@Param('id') id: string, @Body('status') status: DeliveryStatus, @Req() req) {
    // Check if user has permission to update this delivery
    const delivery = await this.deliveriesService.findOne(id)
    if (req.user.role !== Role.ADMIN && delivery.riderId !== req.user.id) {
      throw new Error("You do not have permission to update this delivery")
    }

    return this.deliveriesService.updateStatus(id, status)
  }
}

