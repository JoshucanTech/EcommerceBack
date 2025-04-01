import { Controller, Get, UseGuards, Req } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"

import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard"
import { RolesGuard } from "./auth/guards/roles.guard"
import { Role } from "@prisma/client"

@ApiTags('app')
@Controller()
export class AppController {
  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dashboard data based on user role' })
  @ApiResponse({ status: 200, description: 'Dashboard data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDashboardData(@Req() req) {
    const { user } = req;
    
    switch (user.role) {
      case Role.ADMIN:
        return this.getAdminDashboardData();
      case Role.VENDOR:
        return this.getVendorDashboardData(user.id);
      case Role.BUYER:
        return this.getBuyerDashboardData(user.id);
      // case Role.RIDER:
      //   return this.getRiderDashboardData(user.id);
      default:
        return { message: 'Invalid user role' };
    }
  }

  /**
   * Get dashboard data for admin
   * @returns Admin dashboard data
   */
  private async getAdminDashboardData() {
    // Implement logic to fetch admin dashboard data
    return {
      message: 'Admin dashboard data',
      // Add relevant data here
    };
  }

  /**
   * Get dashboard data for vendor
   * @param vendorId Vendor ID
   * @returns Vendor dashboard data
   */
  private async getVendorDashboardData(vendorId: string) {
    // Implement logic to fetch vendor dashboard data
    return {
      message: 'Vendor dashboard data',
      vendorId,
      // Add relevant data here
    };
  }

  /**
   * Get dashboard data for buyer
   * @param userId User ID
   * @returns Buyer dashboard data
   */
  private async getBuyerDashboardData(userId: string) {
    // Implement logic to fetch buyer dashboard data
    return {
      message: 'Buyer dashboard data',
      userId,
      // Add relevant data here
    };
  }

/**
   * Get dashboard data for rider
   * @param riderId Rider ID
   * @returns Rider dashboard data

**/
}