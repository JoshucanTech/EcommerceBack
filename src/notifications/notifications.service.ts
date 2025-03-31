import { Injectable } from "@nestjs/common"
import type { PrismaService } from "../prisma/prisma.service"
import type { CreateNotificationDto } from "./dto/create-notification.dto"
import type { UpdateNotificationDto } from "./dto/update-notification.dto"
import type { Notification } from "@prisma/client"

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new notification
   * @param userId User ID
   * @param createNotificationDto Notification creation data
   * @returns The created notification
   */
  async create(userId: string, createNotificationDto: CreateNotificationDto): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        userId,
        ...createNotificationDto,
      },
    })
  }

  /**
   * Find all notifications for a user
   * @param userId User ID
   * @returns Array of notifications
   */
  async findAll(userId: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
    })
  }

  /**
   * Find a notification by ID
   * @param id Notification ID
   * @returns
   */
  async findOne(id: string): Promise<Notification | null> {
    return this.prisma.notification.findUnique({
      where: { id },
    })
  }

  /**
   * Update a notification
   * @param id Notification ID
   * @param updateNotificationDto Notification update data
   * @returns The updated notification
   */
  async update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: updateNotificationDto,
    })
  }

  /**
   * Delete a notification
   * @param id Notification ID
   */
  async remove(id: string): Promise<void> {
    await this.prisma.notification.delete({
      where: { id },
    })
  }

  /**
   * Mark all notifications as read for a user
   * @param userId User ID
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId },
      data: { isRead: true },
    })
  }
}

