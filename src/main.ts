import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Enable CORS
  app.enableCors()

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  )

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle("E-Commerce API")
    .setDescription("Multi-vendor e-commerce platform API")
    .setVersion("1.0")
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api/docs", app, document)

  // Prefix all routes with /api
  app.setGlobalPrefix("api")

  await app.listen(process.env.PORT || 4000)
  console.log(`Application is running on: ${await app.getUrl()}`)
}
bootstrap()

