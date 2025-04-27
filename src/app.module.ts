import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UsersModule } from "./users/users.module"
import { ProductsModule } from "./products/products.module"
import { OrdersModule } from "./orders/orders.module"
import { AuthModule } from "./auth/auth.module"
import { VendorsModule } from "./vendors/vendors.module"
import { RidersModule } from "./riders/riders.module"
import { CategoriesModule } from "./categories/categories.module"
import { ReviewsModule } from "./reviews/reviews.module"
import { CouponsModule } from "./coupons/coupons.module"
import { AddressesModule } from "./addresses/addresses.module"
import { PaymentMethodsModule } from "./payment-methods/payment-methods.module"
import { DeliveriesModule } from "./deliveries/deliveries.module"
import { NotificationsModule } from "./notifications/notifications.module"
import { WishlistModule } from "./wishlist/wishlist.module"
import { InventoryModule } from "./inventory/inventory.module"
import { AnalyticsModule } from "./analytics/analytics.module"
import { SettingsModule } from "./settings/settings.module"
import { MessagesModule } from "./messages/messages.module"

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || "development"}`,
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("DB_HOST", "localhost"),
        port: configService.get<number>("DB_PORT", 5432),
        username: configService.get("DB_USERNAME", "postgres"),
        password: configService.get("DB_PASSWORD", "postgres"),
        database: configService.get("DB_DATABASE", "ecommerce"),
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        synchronize: configService.get<boolean>("DB_SYNCHRONIZE", false),
        logging: configService.get<boolean>("DB_LOGGING", false),
        migrations: [__dirname + "/migrations/**/*{.ts,.js}"],
        migrationsRun: configService.get<boolean>("DB_MIGRATIONS_RUN", false),
      }),
    }),

    // Feature modules
    UsersModule,
    ProductsModule,
    OrdersModule,
    AuthModule,
    VendorsModule,
    RidersModule,
    CategoriesModule,
    ReviewsModule,
    CouponsModule,
    AddressesModule,
    PaymentMethodsModule,
    DeliveriesModule,
    NotificationsModule,
    WishlistModule,
    InventoryModule,
    AnalyticsModule,
    SettingsModule,
    MessagesModule,
  ],
})
export class AppModule {}

