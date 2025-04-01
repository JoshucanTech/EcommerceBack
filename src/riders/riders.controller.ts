// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   UseGuards,
//   Query,
//   UseInterceptors,
//   UploadedFile,
//   Req,
// } from "@nestjs/common"
// import { FileInterceptor } from "@nestjs/platform-express"
// import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from "@nestjs/swagger"
// import type { Express } from "express"

// // import type { RidersService } from "./riders.service"
// // import type { CreateRiderDto } from "./dto/create-rider.dto"
// // import type { UpdateRiderDto } from "./dto/update-rider.dto"
// // import type { UpdateLocationDto } from "./dto/update-location.dto"
// import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
// import { RolesGuard } from "../auth/guards/roles.guard"
// import { Roles } from "../auth/decorators/roles.decorator"
// import { Role } from "@prisma/client"

// @ApiTags("riders")
// @Controller("riders")
// export class RidersController {
//   // constructor(private readonly ridersService: RidersService) {}

//   // @Post()
//   // @UseGuards(JwtAuthGuard)
//   // @ApiBearerAuth()
//   // @ApiOperation({ summary: "Create a new rider profile" })
//   // @ApiResponse({ status: 201, description: "Rider profile created successfully" })
//   // @ApiResponse({ status: 400, description: "Bad request" })
//   // @ApiResponse({ status: 401, description: "Unauthorized" })
//   // async create(@Body() createRiderDto: CreateRiderDto, @Req() req) {
//   //   return this.ridersService.create(req.user.id, createRiderDto)
//   // }

//   // @Get()
//   // @ApiOperation({ summary: "Get all riders" })
//   // @ApiQuery({ name: "isVerified", type: Boolean, required: false })
//   // @ApiQuery({ name: "isAvailable", type: Boolean, required: false })
//   // @ApiQuery({ name: "search", required: false })
//   // @ApiQuery({ name: "skip", type: Number, required: false })
//   // @ApiQuery({ name: "take", type: Number, required: false })
//   // @ApiResponse({ status: 200, description: "List of riders" })
//   // async findAll(
//   //   @Query('isVerified') isVerified?: boolean,
//   //   @Query('isAvailable') isAvailable?: boolean,
//   //   @Query('search') search?: string,
//   //   @Query('skip') skip?: number,
//   //   @Query('take') take?: number,
//   // ) {
//   //   // const riders = await this.ridersService.findAll({
//   //   //   isVerified,
//   //   //   isAvailable,
//   //   //   search,
//   //   //   skip: skip ? +skip : undefined,
//   //   //   take: take ? +take : undefined,
//   //   // })

//   //   return {
//   //     data: riders,
//   //     meta: {
//   //       total: await this.ridersService.count({ isVerified, isAvailable, search }),
//   //       skip: skip ? +skip : 0,
//   //       take: take ? +take : riders.length,
//   //     },
//   //   }
//   // }

//   @Get('me')
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(Role.RIDER)
//   @ApiBearerAuth()
//   @ApiOperation({ summary: 'Get current rider profile' })
//   @ApiResponse({ status: 200, description: 'Rider profile' })
//   @ApiResponse({ status: 401, description: 'Unauthorized' })
//   @ApiResponse({ status: 403, description: 'Forbidden' })
//   async findMe(@Req() req) {
//     return this.ridersService.findByUserId(req.user.id);
//   }

//   @Get(':id')
//   @ApiOperation({ summary: 'Get rider by ID' })
//   @ApiResponse({ status: 200, description: 'Rider details' })
//   @ApiResponse({ status: 404, description: 'Rider not found' })
//   async findOne(@Param('id') id: string) {
//     return this.ridersService.findById(id);
//   }

//   @Patch(":id")
//   @UseGuards(JwtAuthGuard)
//   @ApiBearerAuth()
//   @ApiOperation({ summary: "Update rider profile" })
//   @ApiResponse({ status: 200, description: "Rider profile updated successfully" })
//   @ApiResponse({ status: 401, description: "Unauthorized" })
//   @ApiResponse({ status: 404, description: "Rider not found" })
//   async update(@Param('id') id: string, @Body() updateRiderDto: UpdateRiderDto, @Req() req) {
//     // Check if user has permission to update this rider
//     const rider = await this.ridersService.findById(id)
//     if (req.user.role !== Role.ADMIN && rider.userId !== req.user.id) {
//       throw new Error("You do not have permission to update this rider")
//     }

//     return this.ridersService.update(id, updateRiderDto)
//   }

//   @Patch(":id/location")
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(Role.RIDER)
//   @ApiBearerAuth()
//   @ApiOperation({ summary: "Update rider location" })
//   @ApiResponse({ status: 200, description: "Rider location updated successfully" })
//   @ApiResponse({ status: 401, description: "Unauthorized" })
//   @ApiResponse({ status: 403, description: "Forbidden" })
//   @ApiResponse({ status: 404, description: "Rider not found" })
//   async updateLocation(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto, @Req() req) {
//     // Check if user has permission to update this rider
//     if (req.user.role !== Role.ADMIN && req.user.id !== id) {
//       throw new Error("You do not have permission to update this rider")
//     }

//     return this.ridersService.updateLocation(id, updateLocationDto)
//   }

//   @Patch(":id/availability")
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(Role.RIDER, Role.ADMIN)
//   @ApiBearerAuth()
//   @ApiOperation({ summary: "Toggle rider availability" })
//   @ApiResponse({ status: 200, description: "Rider availability toggled successfully" })
//   @ApiResponse({ status: 401, description: "Unauthorized" })
//   @ApiResponse({ status: 403, description: "Forbidden" })
//   @ApiResponse({ status: 404, description: "Rider not found" })
//   async toggleAvailability(@Param('id') id: string, @Body('isAvailable') isAvailable: boolean, @Req() req) {
//     // Check if user has permission to update this rider
//     if (req.user.role !== Role.ADMIN && req.user.id !== id) {
//       throw new Error("You do not have permission to update this rider")
//     }

//     return this.ridersService.toggleAvailability(id, isAvailable)
//   }

//   @Patch(":id/verify")
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(Role.ADMIN)
//   @ApiBearerAuth()
//   @ApiOperation({ summary: "Verify rider (Admin only)" })
//   @ApiResponse({ status: 200, description: "Rider verified successfully" })
//   @ApiResponse({ status: 401, description: "Unauthorized" })
//   @ApiResponse({ status: 403, description: "Forbidden" })
//   @ApiResponse({ status: 404, description: "Rider not found" })
//   async verify(@Param('id') id: string, @Body('isVerified') isVerified: boolean) {
//     return this.ridersService.verify(id, isVerified)
//   }

//   @Post(":id/identification")
//   @UseGuards(JwtAuthGuard)
//   @ApiBearerAuth()
//   @UseInterceptors(FileInterceptor("identificationDocument"))
//   @ApiConsumes("multipart/form-data")
//   @ApiBody({
//     schema: {
//       type: "object",
//       properties: {
//         identificationDocument: {
//           type: "string",
//           format: "binary",
//         },
//       },
//     },
//   })
//   @ApiOperation({ summary: "Upload rider identification document" })
//   @ApiResponse({ status: 200, description: "Identification document uploaded successfully" })
//   @ApiResponse({ status: 401, description: "Unauthorized" })
//   @ApiResponse({ status: 404, description: "Rider not found" })
//   async uploadIdentificationDocument(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Req() req) {
//     // Check if user has permission to update this rider
//     const rider = await this.ridersService.findById(id)
//     if (req.user.role !== Role.ADMIN && rider.userId !== req.user.id) {
//       throw new Error("You do not have permission to update this rider")
//     }

//     return this.ridersService.uploadIdentificationDocument(id, file)
//   }

//   @Post(":id/license")
//   @UseGuards(JwtAuthGuard)
//   @ApiBearerAuth()
//   @UseInterceptors(FileInterceptor("licenseDocument"))
//   @ApiConsumes("multipart/form-data")
//   @ApiBody({
//     schema: {
//       type: "object",
//       properties: {
//         licenseDocument: {
//           type: "string",
//           format: "binary",
//         },
//       },
//     },
//   })
//   @ApiOperation({ summary: "Upload rider license document" })
//   @ApiResponse({ status: 200, description: "License document uploaded successfully" })
//   @ApiResponse({ status: 401, description: "Unauthorized" })
//   @ApiResponse({ status: 404, description: "Rider not found" })
//   async uploadLicenseDocument(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Req() req) {
//     // Check if user has permission to update this rider
//     const rider = await this.ridersService.findById(id)
//     if (req.user.role !== Role.ADMIN && rider.userId !== req.user.id) {
//       throw new Error("You do not have permission to update this rider")
//     }

//     return this.ridersService.uploadLicenseDocument(id, file)
//   }
// }

