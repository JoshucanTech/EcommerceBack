import { Entity, Column, ManyToOne, JoinColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { BaseEntity } from "../../common/entities/base.entity"
import { User } from "../../users/entities/user.entity"

@Entity("addresses")
export class Address extends BaseEntity {
  @ApiProperty({ description: "Address label (e.g., Home, Work)" })
  @Column()
  label: string

  @ApiProperty({ description: "Recipient full name" })
  @Column({ name: "full_name" })
  fullName: string

  @ApiProperty({ description: "Address line 1" })
  @Column({ name: "address_line1" })
  addressLine1: string

  @ApiProperty({ description: "Address line 2", required: false })
  @Column({ name: "address_line2", nullable: true })
  addressLine2: string

  @ApiProperty({ description: "City" })
  @Column()
  city: string

  @ApiProperty({ description: "State/Province/Region" })
  @Column()
  state: string

  @ApiProperty({ description: "Postal/ZIP code" })
  @Column({ name: "postal_code" })
  postalCode: string

  @ApiProperty({ description: "Country" })
  @Column()
  country: string

  @ApiProperty({ description: "Phone number" })
  @Column()
  phone: string

  @ApiProperty({ description: "Whether this is the default address", default: false })
  @Column({ default: false })
  isDefault: boolean

  @ApiProperty({ description: "Additional delivery instructions", required: false })
  @Column({ type: "text", nullable: true })
  instructions: string

  @ApiProperty({ description: "Latitude for map location", required: false })
  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  latitude: number

  @ApiProperty({ description: "Longitude for map location", required: false })
  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  longitude: number

  // Relationships
  @ManyToOne(
    () => User,
    (user) => user.addresses,
  )
  @JoinColumn({ name: "user_id" })
  user: User
}

