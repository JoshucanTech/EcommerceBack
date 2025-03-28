import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"

export abstract class BaseEntity {
  @ApiProperty({ description: "Unique identifier" })
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty({ description: "Creation timestamp" })
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @ApiProperty({ description: "Last update timestamp" })
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date

  @ApiProperty({ description: "Deletion timestamp (for soft deletes)", required: false })
  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt?: Date
}

