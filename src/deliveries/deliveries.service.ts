import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import type { PrismaService } from "../prisma/prisma.service"
import type { OrdersService } from "../orders/orders.service"
import type { RidersService } from "../riders/riders.service"
import type { CreateDeliveryDto } from "./dto/create-delivery.dto"
import type { UpdateDeliveryDto } from "./dto/update-delivery.dto"
import { type Delivery, DeliveryStatus, OrderStatus } from "@prisma/client"

@Injectable()
export class DeliveriesService {
  constructor(
    private prisma: PrismaService,
    private ordersService: OrdersService,
    private ridersService: RidersService,
  ) {}

  /**
   * Create a new delivery
   * @param orderId Order ID
   * @param createDeliveryDto Delivery creation data
   * @returns The created delivery
   */
  async create(orderId: string, createDeliveryDto: CreateDeliveryDto): Promise<Delivery> {
    // Validate order
    const order = await this.ordersService.findById(orderId)
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`)
    }

    if (order.status !== OrderStatus.SHIPPED) {
      throw new BadRequestException("Order status must be SHIPPED to create a delivery")
    }

    // Check if delivery already exists for this order
    const existingDelivery = await this.prisma.delivery.findUnique({
      where: { orderId },
    })

    if (existingDelivery) {
      throw new BadRequestException("Delivery already exists for this order")
    }

    // Create delivery
    return this.prisma.delivery.create({
      data: {
        orderId,
        ...createDeliveryDto,
      },
    })
  }

  /**
   * Find all deliveries with optional filtering
   * @param options Query options
   * @returns Array of deliveries
   */
  async findAll(options?: {
    riderId?: string
    status?: DeliveryStatus
    skip?: number
    take?: number
  }): Promise<Delivery[]> {
    const { riderId, status, skip, take } = options || {}

    return this.prisma.delivery.findMany({
      where: {
        ...(riderId && { riderId }),
        ...(status && { status }),
      },
      include: {
        order: true,
        rider: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
    })
  }

  /**
   * Find a delivery by ID
   * @param id Delivery ID
   * @returns The found delivery or null
   */
  async findOne(id: string): Promise<Delivery | null> {
    return this.prisma.delivery.findUnique({
      where: { id },
      include: {
        order: true,
        rider: true,
      },
    })
  }

  /**
   * Update a delivery
   * @param id Delivery ID
   * @param updateDeliveryDto Delivery update data
   * @returns The updated delivery
   */
  async update(id: string, updateDeliveryDto: UpdateDeliveryDto): Promise<Delivery> {
    const delivery = await this.findOne(id)
    if (!delivery) {
      throw new NotFoundException(`Delivery with ID ${id} not found`)
    }

    return this.prisma.delivery.update({
      where: { id },
      data: updateDeliveryDto,
    })
  }

  /**
   * Assign a rider to a delivery
   * @param id Delivery ID
   * @param riderId Rider ID
   * @returns The updated delivery
   */
  async assignRider(id: string, riderId: string): Promise<Delivery> {
    // Validate delivery
    const delivery = await this.findOne(id)
    if (!delivery) {
      throw new NotFoundException(`Delivery with ID ${id} not found`)
    }

    // Validate rider
    const rider = await this.ridersService.findById(riderId)
    if (!rider) {
      throw new NotFoundException(`Rider with ID ${riderId} not found`)
    }

    return this.prisma.delivery.update({
      where: { id },
      data: {
        riderId,
        status: DeliveryStatus.ASSIGNED,
      },
    })
  }

  /**
   * Update delivery status
   * @param id Delivery ID
   * @param status New delivery status
   * @returns The updated delivery
   */
  async updateStatus(id: string, status: DeliveryStatus): Promise<Delivery> {
    const delivery = await this.findOne(id)
    if (!delivery) {
      throw new NotFoundException(`Delivery with ID ${id} not found`)
    }

    return this.prisma.delivery.update({
      where: { id },
      data: { status },
    })
  }
}

