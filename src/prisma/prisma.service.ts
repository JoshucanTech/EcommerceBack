import { Injectable, type OnModuleInit, type OnModuleDestroy, type INestApplication } from "@nestjs/common"
import { PrismaClient } from "@prisma/client"

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"],
    })
  }

  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on("beforeExit", async () => {
      await app.close()
    })
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === "production") {
      return
    }

    // This is used for testing purposes only
    const models = Reflect.ownKeys(this).filter((key) => {
      return (
        typeof key === "string" &&
        !key.startsWith("_") &&
        !["$connect", "$disconnect", "$on", "$transaction", "$use"].includes(key as string)
      )
    })

    return Promise.all(
      models.map((modelKey) => {
        return this[modelKey as string].deleteMany()
      }),
    )
  }
}

