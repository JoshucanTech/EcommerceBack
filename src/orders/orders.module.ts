import { Module } from "@nestjs/common"
import { OrdersService } from "./orders.service"
import { OrdersController } from "./orders.controller"
import { PrismaModule } from "../prisma/prisma.module"
import { ProductsModule } from "../products/products.module"
import { PaymentsModule } from "../payments/payments.module"
import { NotificationsModule } from "../notifications/notifications.module"
import { CommonModule } from "../common/common.module"

@Module({
  imports: [PrismaModule, ProductsModule, PaymentsModule, NotificationsModule, CommonModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}

