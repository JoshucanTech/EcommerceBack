import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query, ParseUUIDPipe, Req } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger"
import { AuthGuard } from "@nestjs/passport"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import type { OrdersService } from "./orders.service"
import type { CreateOrderDto } from "./dto/create-order.dto"
import type { UpdateOrderDto } from "./dto/update-order.dto"
import { UserRole } from "../users/entities/user.entity"
import { OrderStatus, PaymentStatus } from "./entities/order.entity"

@ApiTags("Orders")
@Controller("orders")
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: "Create a new order" })
  @ApiResponse({ status: 201, description: "Order created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Req() req) {
    return this.ordersService.create(createOrderDto, req.user)
  }

  @ApiOperation({ summary: "Get all orders with filtering and pagination" })
  @ApiResponse({ status: 200, description: "Orders retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "status", required: false, enum: OrderStatus })
  @ApiQuery({ name: "paymentStatus", required: false, enum: PaymentStatus })
  @ApiQuery({ name: "startDate", required: false, type: Date })
  @ApiQuery({ name: "endDate", required: false, type: Date })
  @ApiQuery({ name: "sortBy", required: false, type: String })
  @ApiQuery({ name: "sortOrder", required: false, enum: ["ASC", "DESC"] })
  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: OrderStatus,
    @Query('paymentStatus') paymentStatus?: PaymentStatus,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Req() req,
  ) {
    return this.ordersService.findAll(
      {
        page,
        limit,
        status,
        paymentStatus,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      },
      req.user,
    )
  }

  @ApiOperation({ summary: "Get an order by ID" })
  @ApiResponse({ status: 200, description: "Order retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Order not found" })
  @Get(":id")
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.ordersService.findOne(id, req.user)
  }

  @ApiOperation({ summary: "Update an order (Admin only)" })
  @ApiResponse({ status: 200, description: "Order updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Order not found" })
  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateOrderDto: UpdateOrderDto, @Req() req) {
    return this.ordersService.update(id, updateOrderDto, req.user)
  }

  @ApiOperation({ summary: "Cancel an order" })
  @ApiResponse({ status: 200, description: "Order cancelled successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Order not found" })
  @Post(":id/cancel")
  cancel(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.ordersService.cancel(id, req.user)
  }
}

