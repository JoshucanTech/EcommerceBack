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
  HttpCode,
  HttpStatus,
} from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger"

import type { FlashSalesService } from "./flash-sales.service"
import type { CreateFlashSaleDto } from "./dto/create-flash-sale.dto"
import type { UpdateFlashSaleDto } from "./dto/update-flash-sale.dto"
import type { AddFlashSaleItemDto } from "./dto/add-flash-sale-item.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { Role } from "@prisma/client"

@ApiTags("flash-sales")
@Controller("flash-sales")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FlashSalesController {
  constructor(private readonly flashSalesService: FlashSalesService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new flash sale (Admin only)' })
  @ApiResponse({ status: 201, description: 'Flash sale created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createFlashSaleDto: CreateFlashSaleDto) {
    return this.flashSalesService.create(createFlashSaleDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all flash sales" })
  @ApiQuery({ name: "isActive", type: Boolean, required: false })
  @ApiQuery({ name: "skip", type: Number, required: false })
  @ApiQuery({ name: "take", type: Number, required: false })
  @ApiResponse({ status: 200, description: "List of flash sales" })
  async findAll(@Query('isActive') isActive?: boolean, @Query('skip') skip?: number, @Query('take') take?: number) {
    return {
      data: await this.flashSalesService.findAll({
        isActive,
        skip: skip ? +skip : undefined,
        take: take ? +take : undefined,
      }),
      meta: {
        total: await this.flashSalesService.count({ isActive }),
        skip: skip ? +skip : 0,
        take: take ? +take : 10,
      },
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get flash sale by ID' })
  @ApiResponse({ status: 200, description: 'Flash sale details' })
  @ApiResponse({ status: 404, description: 'Flash sale not found' })
  async findOne(@Param('id') id: string) {
    return this.flashSalesService.findOne(id);
  }

  @Patch(":id")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Update flash sale (Admin only)" })
  @ApiResponse({ status: 200, description: "Flash sale updated successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Flash sale not found" })
  async update(@Param('id') id: string, @Body() updateFlashSaleDto: UpdateFlashSaleDto) {
    return this.flashSalesService.update(id, updateFlashSaleDto)
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete flash sale (Admin only)' })
  @ApiResponse({ status: 204, description: 'Flash sale deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Flash sale not found' })
  async remove(@Param('id') id: string) {
    await this.flashSalesService.remove(id);
  }

  @Post(":flashSaleId/items")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Add an item to a flash sale (Admin only)" })
  @ApiResponse({ status: 200, description: "Item added to flash sale successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Flash sale or product not found" })
  async addItem(@Param('flashSaleId') flashSaleId: string, @Body() addFlashSaleItemDto: AddFlashSaleItemDto) {
    return this.flashSalesService.addItem(flashSaleId, addFlashSaleItemDto)
  }

  @Delete(":flashSaleId/items/:productId")
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove an item from a flash sale (Admin only)" })
  @ApiResponse({ status: 204, description: "Item removed from flash sale successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Flash sale or product not found" })
  async removeItem(@Param('flashSaleId') flashSaleId: string, @Param('productId') productId: string) {
    await this.flashSalesService.removeItem(flashSaleId, productId)
  }
}

