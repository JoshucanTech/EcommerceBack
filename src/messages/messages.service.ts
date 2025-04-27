import { Injectable } from "@nestjs/common"
import type { PrismaService } from "../prisma/prisma.service"
import type { CreateMessageDto } from "./dto/create-message.dto"
import type { UpdateMessageDto } from "./dto/update-message.dto"
import type { Message } from "@prisma/client"

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new message
   * @param senderId Sender ID
   * @param createMessageDto Message creation data
   * @returns The created message
   */
  async create(senderId: string, createMessageDto: CreateMessageDto): Promise<Message> {
    const { receiverId, content } = createMessageDto

    return this.prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
      },
    })
  }

  /**
   * Find all messages between two users
   * @param userId User ID
   * @param receiverId Receiver ID
   * @returns Array of messages
   */
  async findAll(userId: string, receiverId: string): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId },
          { senderId: receiverId, receiverId: userId },
        ],
      },
      orderBy: {
        createdAt: "asc",
      },
    })
  }

  /**
   * Find a message by ID
   * @param id Message ID
   * @returns The found message or null
   */
  async findOne(id: string): Promise<Message | null> {
    return this.prisma.message.findUnique({
      where: { id },
    })
  }

  /**
   * Update a message
   * @param id Message ID
   * @param updateMessageDto Message update data
   * @returns The updated message
   */
  async update(id: string, updateMessageDto: UpdateMessageDto): Promise<Message> {
    return this.prisma.message.update({
      where: { id },
      data: updateMessageDto,
    })
  }

  /**
   * Delete a message
   * @param id Message ID
   */
  async remove(id: string): Promise<void> {
    await this.prisma.message.delete({
      where: { id },
    })
  }

  /**
   * Mark a message as read
   * @param id Message ID
   */
  async markAsRead(id: string): Promise<void> {
    await this.prisma.message.update({
      where: { id },
      data: { isRead: true },
    })
  }
}

