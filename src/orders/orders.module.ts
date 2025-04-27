import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { OrdersService } from "./orders.service"
import { OrdersController } from "./orders.controller"
import { Order } from "./entities/order.entity"
import { OrderItem } from "./entities/order-item.entity"
import { ProductsModule } from "../products/products.module"
import { AddressesModule } from "../addresses/addresses.module"
import { PaymentMethodsModule } from "../payment-methods/payment-methods.module"
import { CouponsModule } from "../coupons/coupons.module"

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    ProductsModule,
    AddressesModule,
    PaymentMethodsModule,
    CouponsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}

