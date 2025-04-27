import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { JwtModule } from "@nestjs/jwt"
import { PassportModule } from "@nestjs/passport"
import { MulterModule } from "@nestjs/platform-express"
import { I18nModule, I18nJsonParser } from "nestjs-i18n"
import { join } from "path"

import { PrismaModule } from "./prisma/prisma.module"
import { AuthModule } from "./auth/auth.module"
import { UsersModule } from "./users/users.module"
import { ProductsModule } from "./products/products.module"
// import { CategoriesModule } from "./categories/categories.module"
// import { OrdersModule } from "./orders/orders.module"
// import { VendorsModule } from "./vendors/vendors.module"
// import { RidersModule } from "./riders/riders.module"
// import { PaymentsModule } from "./payments/payments.module"
// import { UploadsModule } from "./uploads/uploads.module"
// import { NotificationsModule } from "./notifications/notifications.module"
// import { MessagesModule } from "./messages/messages.module"
// import { ReviewsModule } from "./reviews/reviews.module"
// import { CouponsModule } from "./coupons/coupons.module"
// import { FlashSalesModule } from "./flash-sales/flash-sales.module"
// import { CartsModule } from "./carts/carts.module"
// import { WishlistsModule } from "./wishlists/wishlists.module"
// import { DeliveriesModule } from "./deliveries/deliveries.module"
// import { SettingsModule } from "./settings/settings.module"
import { CommonModule } from "./common/common.module"

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || "development"}`,
    }),

    // Database
    PrismaModule,

    // Authentication
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: configService.get<string>("JWT_EXPIRATION", "1d"),
        },
      }),
    }),

    // Internationalization
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.get<string>("DEFAULT_LANGUAGE", "en"),
        parserOptions: {
          path: join(__dirname, "/i18n/"),
          watch: true,
        },
      }),
      parser: I18nJsonParser,
      inject: [ConfigService],
    }),

    // File uploads
    MulterModule.register({
      dest: "./uploads",
    }),

    // Feature modules
    CommonModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    // CategoriesModule,
    // OrdersModule,
    // VendorsModule,
    // RidersModule,
    // PaymentsModule,
    // UploadsModule,
    // NotificationsModule,
    // MessagesModule,
    // ReviewsModule,
    // CouponsModule,
    // FlashSalesModule,
    // CartsModule,
    // WishlistsModule,
    // DeliveriesModule,
    // SettingsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

