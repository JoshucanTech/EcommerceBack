import { Module } from "@nestjs/common"
import { VendorsService } from "./vendors.service"
import { VendorsController } from "./vendors.controller"
import { PrismaModule } from "../prisma/prisma.module"
import { UsersModule } from "../users/users.module"
import { CommonModule } from "../common/common.module"

@Module({
  imports: [PrismaModule, UsersModule, CommonModule],
  controllers: [VendorsController],
  providers: [VendorsService],
  exports: [VendorsService],
})
export class VendorsModule {}

