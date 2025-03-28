import { Entity, Column, OneToOne, JoinColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { BaseEntity } from "../../common/entities/base.entity"
import { User } from "../../users/entities/user.entity"

export enum VehicleType {
  BICYCLE = "bicycle",
  MOTORCYCLE = "motorcycle",
  CAR = "car",
  VAN = "van",
  TRUCK = "truck",
}

export enum RiderStatus {
  PENDING = "pending",
  APPROVED = "approved",
  SUSPENDED = "suspended",
  REJECTED = "rejected",
}

@Entity("rider_profiles")
export class RiderProfile extends BaseEntity {
  @ApiProperty({ description: "Rider national ID number" })
  @Column({ name: "national_id" })
  nationalId: string

  @ApiProperty({ description: "Rider vehicle type", enum: VehicleType })
  @Column({
    name: "vehicle_type",
    type: "enum",
    enum: VehicleType,
  })
  vehicleType: VehicleType

  @ApiProperty({ description: "Rider vehicle make/model" })
  @Column({ name: "vehicle_model" })
  vehicleModel: string

  @ApiProperty({ description: "Rider vehicle license plate" })
  @Column({ name: "license_plate" })
  licensePlate: string

  @ApiProperty({ description: "Rider driver license number" })
  @Column({ name: "driver_license" })
  driverLicense: string

  @ApiProperty({ description: "Rider driver license expiry date" })
  @Column({ name: "license_expiry" })
  licenseExpiry: Date

  @ApiProperty({ description: "Rider insurance policy number", required: false })
  @Column({ name: "insurance_number", nullable: true })
  insuranceNumber: string

  @ApiProperty({ description: "Rider insurance expiry date", required: false })
  @Column({ name: "insurance_expiry", nullable: true })
  insuranceExpiry: Date

  @ApiProperty({ description: "Rider background check status", default: false })
  @Column({ name: "background_check_passed", default: false })
  backgroundCheckPassed: boolean

  @ApiProperty({ description: "Rider profile status", enum: RiderStatus, default: RiderStatus.PENDING })
  @Column({
    type: "enum",
    enum: RiderStatus,
    default: RiderStatus.PENDING,
  })
  status: RiderStatus

  @ApiProperty({ description: "Rider average rating", default: 0 })
  @Column({ name: "average_rating", type: "decimal", precision: 3, scale: 2, default: 0 })
  averageRating: number

  @ApiProperty({ description: "Rider total deliveries", default: 0 })
  @Column({ name: "total_deliveries", default: 0 })
  totalDeliveries: number

  @ApiProperty({ description: "Rider total earnings", default: 0 })
  @Column({ name: "total_earnings", type: "decimal", precision: 10, scale: 2, default: 0 })
  totalEarnings: number

  @ApiProperty({ description: "Rider documents (ID, license, etc.)", required: false })
  @Column({ type: "json", nullable: true })
  documents: Record<string, string>

  @ApiProperty({ description: "Rider bank account details", required: false })
  @Column({ type: "json", nullable: true })
  bankDetails: Record<string, any>

  @ApiProperty({ description: "Rider service areas (list of zip/postal codes)", required: false })
  @Column({ name: "service_areas", type: "json", nullable: true })
  serviceAreas: string[]

  @ApiProperty({ description: "Rider availability schedule", required: false })
  @Column({ type: "json", nullable: true })
  availability: Record<string, any>

  @ApiProperty({ description: "Rider current location", required: false })
  @Column({ type: "json", nullable: true })
  currentLocation: {
    latitude: number
    longitude: number
    lastUpdated: Date
  }

  @ApiProperty({ description: "Rider is currently online", default: false })
  @Column({ name: "is_online", default: false })
  isOnline: boolean

  // Relationships
  @OneToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User
}

