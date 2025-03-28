import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Order, OrderStatus, PaymentStatus } from "./entities/order.entity"
import { OrderItem } from "./entities/order-item.entity"
import type { CreateOrderDto } from "./dto/create-order.dto"
import type { UpdateOrderDto } from "./dto/update-order.dto"
import type { ProductsService } from "../products/products.service"
import type { AddressesService } from "../addresses/addresses.service"
import type { PaymentMethodsService } from "../payment-methods/payment-methods.service"
import type { CouponsService } from "../coupons/coupons.service"
import type { User } from "../users/entities/user.entity"

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    private productsService: ProductsService,
    private addressesService: AddressesService,
    private paymentMethodsService: PaymentMethodsService,
    private couponsService: CouponsService,
  ) {}

  /**
   * Create a new order
   * @param createOrderDto Order creation data
   * @param user User creating the order
   * @returns Created order
   */
  async create(createOrderDto: CreateOrderDto, user: User): Promise<Order> {
    const { items, shippingAddressId, billingAddressId, paymentMethodId, couponCode, notes } = createOrderDto

    // Validate shipping address
    const shippingAddress = await this.addressesService.findOne(shippingAddressId, user.id)

    // Validate billing address if provided
    let billingAddress = shippingAddress
    if (billingAddressId && billingAddressId !== shippingAddressId) {
      billingAddress = await this.addressesService.findOne(billingAddressId, user.id)
    }

    // Validate payment method
    const paymentMethod = await this.paymentMethodsService.findOne(paymentMethodId, user.id)

    // Get products
    const productIds = items.map((item) => item.productId)
    const products = await this.productsService.findByIds(productIds)

    // Check if all products exist
    if (products.length !== productIds.length) {
      throw new BadRequestException("One or more products not found")
    }

    // Check if products have enough stock
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)
      if (product.quantity < item.quantity) {
        throw new BadRequestException(`Not enough stock for product: ${product.name}`)
      }
    }

    // Create order
    const order = this.ordersRepository.create({
      user,
      shippingAddress,
      billingAddress,
      paymentMethod,
      notes,
      orderNumber: `ORD-${Date.now()}`,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
    })

    // Calculate order totals
    let subtotal = 0
    const orderItems: OrderItem[] = []

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)
      const price = product.discountPrice || product.price
      const itemSubtotal = price * item.quantity

      const orderItem = this.orderItemsRepository.create({
        product,
        quantity: item.quantity,
        unitPrice: price,
        subtotal: itemSubtotal,
        productName: product.name,
        productSku: product.sku,
        productImage: product.mainImage,
        options: item.options,
      })

      orderItems.push(orderItem)
      subtotal += itemSubtotal

      // Update product stock
      await this.productsService.updateStock(product.id, -item.quantity)
    }

    // Apply coupon if provided
    let discount = 0
    if (couponCode) {
      const coupon = await this.couponsService.findByCode(couponCode)
      if (coupon) {
        discount = await this.couponsService.calculateDiscount(coupon, subtotal, user.id)
        order.couponCode = couponCode
      }
    }

    // Calculate tax and shipping
    const tax = subtotal * 0.1 // 10% tax
    const shippingCost = 10 // Flat shipping rate

    // Set order totals
    order.subtotal = subtotal
    order.tax = tax
    order.shippingCost = shippingCost
    order.discount = discount
    order.total = subtotal + tax + shippingCost - discount

    // Save order
    const savedOrder = await this.ordersRepository.save(order)

    // Save order items
    for (const item of orderItems) {
      item.order = savedOrder
      await this.orderItemsRepository.save(item)
    }

    // Reload order with items
    return this.findOne(savedOrder.id, user)
  }

  /**
   * Find all orders with filtering and pagination
   * @param options Filter and pagination options
   * @param user User requesting orders
   * @returns Paginated orders
   */
  async findAll(
    options: {
      page?: number
      limit?: number
      status?: OrderStatus
      paymentStatus?: PaymentStatus
      startDate?: Date
      endDate?: Date
      sortBy?: string
      sortOrder?: "ASC" | "DESC"
    },
    user: User,
  ) {
    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = options

    // Build query
    const queryBuilder = this.ordersRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.user", "user")
      .leftJoinAndSelect("order.items", "items")
      .leftJoinAndSelect("items.product", "product")
      .leftJoinAndSelect("order.shippingAddress", "shippingAddress")
      .leftJoinAndSelect("order.billingAddress", "billingAddress")
      .leftJoinAndSelect("order.paymentMethod", "paymentMethod")

    // Apply filters
    if (user.role !== "admin") {
      queryBuilder.andWhere("user.id = :userId", { userId: user.id })
    }

    if (status) {
      queryBuilder.andWhere("order.status = :status", { status })
    }

    if (paymentStatus) {
      queryBuilder.andWhere("order.paymentStatus = :paymentStatus", { paymentStatus })
    }

    if (startDate) {
      queryBuilder.andWhere("order.createdAt >= :startDate", { startDate })
    }

    if (endDate) {
      queryBuilder.andWhere("order.createdAt <= :endDate", { endDate })
    }

    // Apply sorting
    queryBuilder.orderBy(`order.${sortBy}`, sortOrder)

    // Apply pagination
    queryBuilder.skip((page - 1) * limit).take(limit)

    // Execute query
    const [orders, total] = await queryBuilder.getManyAndCount()

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Find an order by ID
   * @param id Order ID
   * @param user User requesting the order
   * @returns Order
   */
  async findOne(id: string, user: User): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ["user", "items", "items.product", "shippingAddress", "billingAddress", "paymentMethod", "deliveries"],
    })

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`)
    }

    // Check if user is authorized to view this order
    if (user.role !== "admin" && order.user.id !== user.id) {
      throw new BadRequestException("You are not authorized to view this order")
    }

    return order
  }

  /**
   * Update an order
   * @param id Order ID
   * @param updateOrderDto Order update data
   * @param user User updating the order
   * @returns Updated order
   */
  async update(id: string, updateOrderDto: UpdateOrderDto, user: User): Promise<Order> {
    const order = await this.findOne(id, user)

    // Only admin can update orders
    if (user.role !== "admin") {
      throw new BadRequestException("Only admin can update orders")
    }

    // Update shipping address if provided
    if (updateOrderDto.shippingAddressId) {
      const shippingAddress = await this.addressesService.findOne(updateOrderDto.shippingAddressId, order.user.id)
      order.shippingAddress = shippingAddress
    }

    // Update billing address if provided
    if (updateOrderDto.billingAddressId) {
      const billingAddress = await this.addressesService.findOne(updateOrderDto.billingAddressId, order.user.id)
      order.billingAddress = billingAddress
    }

    // Update order
    const updatedOrder = Object.assign(order, updateOrderDto)
    return this.ordersRepository.save(updatedOrder)
  }

  /**
   * Cancel an order
   * @param id Order ID
   * @param user User cancelling the order
   * @returns Cancelled order
   */
  async cancel(id: string, user: User): Promise<Order> {
    const order = await this.findOne(id, user)

    // Check if order can be cancelled
    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PROCESSING) {
      throw new BadRequestException("Order cannot be cancelled")
    }

    // Update order status
    order.status = OrderStatus.CANCELLED

    // Restore product stock
    for (const item of order.items) {
      await this.productsService.updateStock(item.product.id, item.quantity)
    }

    return this.ordersRepository.save(order)
  }
}

