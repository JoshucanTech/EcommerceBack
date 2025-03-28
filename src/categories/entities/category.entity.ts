import { Entity, Column, ManyToOne, OneToMany, ManyToMany, JoinColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { BaseEntity } from "../../common/entities/base.entity"
import { Product } from "../../products/entities/product.entity"

@Entity("categories")
export class Category extends BaseEntity {
  @ApiProperty({ description: "Category name" })
  @Column()
  name: string

  @ApiProperty({ description: "Category description", required: false })
  @Column({ type: "text", nullable: true })
  description: string

  @ApiProperty({ description: "Category slug for SEO-friendly URLs" })
  @Column({ unique: true })
  slug: string

  @ApiProperty({ description: "Category image URL", required: false })
  @Column({ nullable: true })
  image: string

  @ApiProperty({ description: "Category icon", required: false })
  @Column({ nullable: true })
  icon: string

  @ApiProperty({ description: "Whether the category is featured", default: false })
  @Column({ default: false })
  featured: boolean

  @ApiProperty({ description: "Category display order", default: 0 })
  @Column({ name: "display_order", default: 0 })
  displayOrder: number

  @ApiProperty({ description: "Category meta title for SEO", required: false })
  @Column({ name: "meta_title", nullable: true })
  metaTitle: string

  @ApiProperty({ description: "Category meta description for SEO", required: false })
  @Column({ name: "meta_description", type: "text", nullable: true })
  metaDescription: string

  // Self-referencing relationship for hierarchical categories
  @ManyToOne(
    () => Category,
    (category) => category.children,
    { nullable: true },
  )
  @JoinColumn({ name: "parent_id" })
  parent: Category

  @OneToMany(
    () => Category,
    (category) => category.parent,
  )
  children: Category[]

  // Many-to-many relationship with products
  @ManyToMany(
    () => Product,
    (product) => product.categories,
  )
  products: Product[]
}

