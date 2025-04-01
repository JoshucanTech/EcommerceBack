import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from "@nestjs/common"
import type { PaymentsService } from "./payments.service"
import type { CreatePaymentDto } from "./dto/create-payment.dto"
import type { UpdatePaymentDto } from "./dto/update-payment.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "@prisma/client"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from "@nestjs/swagger"
import { CurrentUser } from "../auth/decorators/current-user.decorator"

@ApiTags("payments")
@Controller("payments")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: "Create a new payment" })
  @ApiResponse({ status: 201, description: "Payment created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  create(@Body() createPaymentDto: CreatePaymentDto, @CurrentUser() user) {
    return this.paymentsService.create(createPaymentDto, user.id)
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Get all payments" })
  @ApiResponse({ status: 200, description: "Return all payments" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.paymentsService.findAll(+page, +limit)
  }

  @Get("user")
  @Roles(UserRole.USER)
  @ApiOperation({ summary: "Get current user payments" })
  @ApiResponse({ status: 200, description: "Return user payments" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  findUserPayments(@CurrentUser() user, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.paymentsService.findUserPayments(user.id, +page, +limit)
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: "Get payment by ID" })
  @ApiResponse({ status: 200, description: "Return the payment" })
  @ApiResponse({ status: 404, description: "Payment not found" })
  @ApiParam({ name: "id", description: "Payment ID" })
  findOne(@Param('id') id: string, @CurrentUser() user) {
    return this.paymentsService.findOne(id, user)
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Update payment" })
  @ApiResponse({ status: 200, description: "Payment updated successfully" })
  @ApiResponse({ status: 404, description: "Payment not found" })
  @ApiParam({ name: "id", description: "Payment ID" })
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(id, updatePaymentDto)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete payment' })
  @ApiResponse({ status: 200, description: 'Payment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }

  // Webhook endpoint for payment provider callbacks
  @Post('webhook')
  @ApiOperation({ summary: 'Payment provider webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  processWebhook(@Body() webhookData: any) {
    return this.paymentsService.processWebhook(webhookData);
  }
}

