import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"
import { ConfigService } from "@nestjs/config"
import * as helmet from "helmet"
import { AppModule } from "./app.module"
import { PrismaService } from "./prisma/prisma.service"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  // Enable shutdown hooks for Prisma
  const prismaService = app.get(PrismaService)
  await prismaService.enableShutdownHooks(app)

  // Global prefix
  const apiPrefix = configService.get<string>("API_PREFIX") || "api"
  app.setGlobalPrefix(apiPrefix)

  // Security middleware
  app.use(helmet())

  // CORS configuration
  app.enableCors({
    origin: configService.get<string>("FRONTEND_URL"),
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )

  // Swagger documentation
  if (configService.get<string>("NODE_ENV") !== "production") {
    const config = new DocumentBuilder()
      .setTitle("E-commerce API")
      .setDescription("Multi-vendor e-commerce platform API")
      .setVersion("1.0")
      .addBearerAuth()
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document)
  }

  // Start the server
  const port = configService.get<number>("PORT") || 3001
  await app.listen(port)
  console.log(`Application is running on: http://localhost:${port}/${apiPrefix}`)
}
bootstrap()

