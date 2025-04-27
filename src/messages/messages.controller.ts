import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpCode, HttpStatus } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"

import type { MessagesService } from "./messages.service"
import type { CreateMessageDto } from "./dto/create-message.dto"
import type { UpdateMessageDto } from "./dto/update-message.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@ApiTags("messages")
@Controller("messages")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: "Create a new message" })
  @ApiResponse({ status: 201, description: "Message created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async create(@Body() createMessageDto: CreateMessageDto, @Req() req) {
    return this.messagesService.create(req.user.id, createMessageDto)
  }

  @Get(":receiverId")
  @ApiOperation({ summary: "Get all messages between two users" })
  @ApiResponse({ status: 200, description: "List of messages" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async findAll(@Param('receiverId') receiverId: string, @Req() req) {
    return this.messagesService.findAll(req.user.id, receiverId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get message by ID' })
  @ApiResponse({ status: 200, description: 'Message details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async findOne(@Param('id') id: string) {
    return this.messagesService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update message" })
  @ApiResponse({ status: 200, description: "Message updated successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Message not found" })
  async update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messagesService.update(id, updateMessageDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete message' })
  @ApiResponse({ status: 204, description: 'Message deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async remove(@Param('id') id: string) {
    await this.messagesService.remove(id);
  }

  @Post(':id/mark-as-read')
  @ApiOperation({ summary: 'Mark a message as read' })
  @ApiResponse({ status: 200, description: 'Message marked as read' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async markAsRead(@Param('id') id: string) {
    await this.messagesService.markAsRead(id);
    return { message: 'Message marked as read' };
  }
}

