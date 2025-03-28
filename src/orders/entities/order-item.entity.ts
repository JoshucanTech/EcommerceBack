import { Entity, Column, ManyToOne, JoinColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { BaseEntity } from "../../common/entities/base.entity"
import { Order } from "./order.entity"
import { Product } from "../../products/entities/product.entity"

@Entity("order_items")
export class OrderItem extends BaseEntity {
  @ApiProperty({ description: "Quantity of the product ordered" })
  @Column()
  quantity: number

  @ApiProperty({ description: "Unit price of the product at the time of order" })
  @Column({ name: "unit_price", type: "decimal", precision: 10, scale: 2 })
  unitPrice: number

  @ApiProperty({ description: "Subtotal for this item (quantity * unit_price)" })
  @Column({ type: "decimal", precision: 10, scale: 2 })
  subtotal: number

  @ApiProperty({ description: "Product name at the time of order (for historical reference)" })
  @Column({ name: "product_name" })
  productName: string

  @ApiProperty({ description: "Product SKU at the time of order (for historical reference)" })
  @Column({ name: "product_sku", nullable: true })
  productSku: string

  @ApiProperty({ description: "Product image URL at the time of order (for historical reference)" })
  @Column({ name: "product_image" })
  productImage: string

  @ApiProperty({ description: "Selected product options (color, size, etc.)", required: false })
  @Column({ type: "json", nullable: true })
  options: Record<string, any>

  // Relationships
  @ManyToOne(
    () => Order,
    (order) => order.items,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "order_id" })
  order: Order

  @ManyToOne(
    () => Product,
    (product) => product.orderItems,
  )
  @JoinColumn({ name: "product_id" })
  product: Product
}

