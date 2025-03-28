import { Entity, Column, ManyToOne, JoinColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { BaseEntity } from "../../common/entities/base.entity"
import { Product } from "../../products/entities/product.entity"

export enum InventoryTransactionType {
  PURCHASE = "purchase",
  SALE = "sale",
  RETURN = "return",
  ADJUSTMENT = "adjustment",
  TRANSFER = "transfer",
}

@Entity("inventory_items")
export class InventoryItem extends BaseEntity {
  @ApiProperty({ description: "Transaction type", enum: InventoryTransactionType })
  @Column({
    name: "transaction_type",
    type: "enum",
    enum: InventoryTransactionType,
  })
  transactionType: InventoryTransactionType

  @ApiProperty({ description: "Quantity change (positive for additions, negative for reductions)" })
  @Column()
  quantity: number

  @ApiProperty({ description: "Unit cost (for purchases)", required: false })
  @Column({ name: "unit_cost", type: "decimal", precision: 10, scale: 2, nullable: true })
  unitCost: number

  @ApiProperty({ description: "Reference number (e.g., order ID, purchase order ID)", required: false })
  @Column({ name: "reference_number", nullable: true })
  referenceNumber: string

  @ApiProperty({ description: "Notes about the inventory transaction", required: false })
  @Column({ type: "text", nullable: true })
  notes: string

  @ApiProperty({ description: "Location or warehouse code", required: false })
  @Column({ nullable: true })
  location: string

  @ApiProperty({ description: "Batch or lot number", required: false })
  @Column({ name: "batch_number", nullable: true })
  batchNumber: string

  @ApiProperty({ description: "Expiration date (for perishable items)", required: false })
  @Column({ name: "expiration_date", nullable: true })
  expirationDate: Date

  // Relationships
  @ManyToOne(
    () => Product,
    (product) => product.inventoryItems,
  )
  @JoinColumn({ name: "product_id" })
  product: Product
}

