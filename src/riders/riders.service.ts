// import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
// import type { PrismaService } from "../prisma/prisma.service"
// import type { UsersService } from "../users/users.service"
// import type { CreateRiderDto } from "./dto/create-rider.dto"
// import { type Rider, Role } from "@prisma/client"
// import type { StorageService } from "../common/services/storage.service"
// import type { EmailService } from "../common/services/email.service"

// @Injectable()
// export class RidersService {
//   constructor(
//     private prisma: PrismaService,
//     private usersService: UsersService,
//     private storageService: StorageService,
//     private emailService: EmailService,
//   ) {}

//   /**
//    * Create a new rider
//    * @param userId User ID
//    * @param createRiderDto Rider creation data
//    * @returns The created rider
//    */
//   async create(userId: string, createRiderDto: CreateRiderDto): Promise<Rider> {
//     const user = await this.usersService.findById(userId);
//     if (!user) {
//       throw new NotFoundException(`User with ID ${userId} not found`);
//     }
    
//     // Check if user already has a rider profile
//     const existingRider = await this.prisma.rider.findUnique({
//       where: { userId },
//     });
    
//     if (existingRider) {
//       throw new BadRequestException('User already has a rider profile');
//     }
    
//     // Update user role to RIDER
//     await this.usersService.update(userId, { role: Role.RIDER });
    
//     // Create rider profile
//     return this.prisma.rider.create({
//       data: {
//         userId,
//         ...createRiderDto,
//       },
//     });
//   }

// /**
//    * Find all riders with

