import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import type { PrismaService } from "../prisma/prisma.service"
import type { ProductsService } from "../products/products.service"
import type { CreateOrderDto } from "./dto/create-order.dto"
import type { UpdateOrderDto } from "./dto/update-order.dto"
import { type Order, OrderStatus, PaymentStatus } from "@prisma/client"
import type { EmailService } from "../common/services/email.service"
import type { SmsService } from "../common/services/sms.service"

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  /**
   * Create a new order
   * @param userId User ID
   * @param createOrderDto Order creation data
   * @returns The created order
   */
  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const { items, addressId, paymentMethodId, couponId, notes } = createOrderDto

    // Validate items
    if (!items || items.length === 0) {
      throw new BadRequestException("Order must have at least one item")
    }

    // Generate order number
    const orderNumber = this.generateOrderNumber()

    // Calculate order totals
    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      const product = await this.productsService.findById(item.productId)
      if (!product) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`)
      }

      if (product.inventory < item.quantity) {
        throw new BadRequestException(`Not enough inventory for product ${product.name}`)
      }

      const itemTotal = product.price * item.quantity
      subtotal += itemTotal

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal,
      })

      // Update product inventory
      await this.productsService.update(item.productId, {
        inventory: product.inventory - item.quantity,
      })
    }

    // Apply coupon if provided
    let discount = 0
    if (couponId) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { id: couponId },
      })

      if (!coupon) {
        throw new NotFoundException(`Coupon with ID ${couponId} not found`)
      }

      if (!coupon.isActive || coupon.startDate > new Date() || coupon.endDate < new Date()) {
        throw new BadRequestException("Coupon is not valid")
      }

      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        throw new BadRequestException("Coupon usage limit reached")
      }

      if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
        throw new BadRequestException(`Order subtotal must be at least ${coupon.minOrderValue} to use this coupon`)
      }

      // Calculate discount
      if (coupon.type === "PERCENTAGE") {
        discount = subtotal * (coupon.value / 100)
      } else {
        discount = coupon.value
      }

      // Apply max discount if specified
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount
      }

      // Update coupon usage count
      await this.prisma.coupon.update({
        where: { id: couponId },
        data: {
          usageCount: {
            increment: 1,
          },
        },
      })
    }

    // Calculate tax and shipping (simplified for now)
    const tax = subtotal * 0.1 // 10% tax
    const shipping = 10 // Flat shipping rate

    // Calculate total
    const total = subtotal + tax + shipping - discount

    // Create the order
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        userId,
        addressId,
        paymentMethodId,
        couponId,
        notes,
        subtotal,
        tax,
        shipping,
        discount,
        total,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        orderItems: {
          create: orderItems,
        },
      },
      include: {
        orderItems: true,
        address: true,
        paymentMethod: true,
        coupon: true,
      },
    })

    // Send order confirmation email
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (user && user.email) {
      const address = await this.prisma.address.findUnique({
        where: { id: addressId },
      })

      const addressString = address
        ? `${address.street}, ${address.city}, ${address.state}, ${address.country}, ${address.zipCode}`
        : "No address provided"

      const orderItems = await this.prisma.orderItem.findMany({
        where: { orderId: order.id },
        include: { product: true },
      })

      const items = orderItems.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
      }))

      await this.emailService.sendOrderConfirmationEmail(user.email, {
        orderNumber: order.orderNumber,
        date: order.createdAt.toLocaleDateString(),
        items,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        total: order.total,
        shippingAddress: addressString,
      })

      // Send SMS notification if phone number is available
      if (user.phone) {
        await this.smsService.sendOrderStatusUpdate(user.phone, order.orderNumber, "PENDING")
      }
    }

    return order
  }

  /**
   * Find all orders with optional filtering
   * @param options Query options
   * @returns Array of orders
   */
  async findAll(options?: {
    userId?: string
    status?: OrderStatus
    paymentStatus?: PaymentStatus
    startDate?: Date
    endDate?: Date
    minTotal?: number
    maxTotal?: number
    skip?: number
    take?: number
  }): Promise<Order[]> {
    const { userId, status, paymentStatus, startDate, endDate, minTotal, maxTotal, skip, take } = options || {}

    return this.prisma.order.findMany({
      where: {
        ...(userId && { userId }),
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
        ...(startDate && { createdAt: { gte: startDate } }),
        ...(endDate && { createdAt: { lte: endDate } }),
        ...(minTotal !== undefined && { total: { gte: minTotal } }),
        ...(maxTotal !== undefined && { total: { lte: maxTotal } }),
      },
      include: {
        user: true,
        address: true,
        paymentMethod: true,
        coupon: true,
        orderItems: {
          include: {
            product: true,
          },
        },
        delivery: true,
      },
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
    })
  }

  /**
   * Find an order by ID
   * @param id Order ID
   * @returns The found order or null
   */
  async findById(id: string): Promise<Order | null> {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        address: true,
        paymentMethod: true,
        coupon: true,
        orderItems: {
          include: {
            product: true,
          },
        },
        delivery: true,
      },
    })
  }

  /**
   * Find an order by order number
   * @param orderNumber Order number
   * @returns The found order or null
   */
  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        user: true,
        address: true,
        paymentMethod: true,
        coupon: true,
        orderItems: {
          include: {
            product: true,
          },
        },
        delivery: true,
      },
    })
  }

  /**
   * Update an order
   * @param id Order ID
   * @param updateOrderDto Order update data
   * @returns The updated order
   */
  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findById(id)
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`)
    }

    // Handle status change notifications
    if (updateOrderDto.status && updateOrderDto.status !== order.status) {
      const user = await this.prisma.user.findUnique({
        where: { id: order.userId },
      })

      if (user) {
        // Send email notification
        if (user.email) {
          await this.emailService.sendEmail(
            user.email,
            `Order Status Update: ${order.orderNumber}`,
            `Your order #${order.orderNumber} has been updated to: ${updateOrderDto.status}`,
          )
        }

        // Send SMS notification
        if (user.phone) {
          await this.smsService.sendOrderStatusUpdate(user.phone, order.orderNumber, updateOrderDto.status)
        }
      }
    }

    return this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
      include: {
        user: true,
        address: true,
        paymentMethod: true,
        coupon: true,
        orderItems: {
          include: {
            product: true,
          },
        },
        delivery: true,
      },
    })
  }

  /**
   * Cancel an order
   * @param id Order ID
   * @returns The cancelled order
   */
  async cancel(id: string): Promise<Order> {
    const order = await this.findById(id)
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`)
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException("Only pending orders can be cancelled")
    }

    // Restore product inventory
    for (const item of order.orderItems) {
      await this.productsService.update(item.productId, {
        inventory: {
          increment: item.quantity,
        },
      })
    }

    // Update order status
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.CANCELLED,
      },
      include: {
        user: true,
        address: true,
        paymentMethod: true,
        coupon: true,
        orderItems: {
          include: {
            product: true,
          },
        },
        delivery: true,
      },
    })

    // Send cancellation notification
    const user = await this.prisma.user.findUnique({
      where: { id: order.userId },
    })

    if (user) {
      // Send email notification
      if (user.email) {
        await this.emailService.sendEmail(
          user.email,
          `Order Cancelled: ${order.orderNumber}`,
          `Your order #${order.orderNumber} has been cancelled.`,
        )
      }

      // Send SMS notification
      if (user.phone) {
        await this.smsService.sendOrderStatusUpdate(user.phone, order.orderNumber, "CANCELLED")
      }
    }

    return updatedOrder
  }

  /**
   * Count orders with optional filtering
   * @param options Query options
   * @returns Number of orders
   */
  async count(options?: {
    userId?: string
    status?: OrderStatus
    paymentStatus?: PaymentStatus
    startDate?: Date
    endDate?: Date
    minTotal?: number
    maxTotal?: number
  }): Promise<number> {
    const { userId, status, paymentStatus, startDate, endDate, minTotal, maxTotal } = options || {}

    return this.prisma.order.count({
      where: {
        ...(userId && { userId }),
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
        ...(startDate && { createdAt: { gte: startDate } }),
        ...(endDate && { createdAt: { lte: endDate } }),
        ...(minTotal !== undefined && { total: { gte: minTotal } }),
        ...(maxTotal !== undefined && { total: { lte: maxTotal } }),
      },
    })
  }

  /**
   * Generate a unique order number
   * @returns Generated order number
   */
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString()
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")
    return `ORD-${timestamp.slice(-8)}-${random}`
  }
}

