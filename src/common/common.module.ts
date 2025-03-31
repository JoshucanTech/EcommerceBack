import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { StorageService } from "./services/storage.service"
import { EmailService } from "./services/email.service"
import { SmsService } from "./services/sms.service"
import { CurrencyService } from "./services/currency.service"
import { TranslationService } from "./services/translation.service"

@Module({
  imports: [ConfigModule],
  providers: [StorageService, EmailService, SmsService, CurrencyService, TranslationService],
  exports: [StorageService, EmailService, SmsService, CurrencyService, TranslationService],
})
export class CommonModule {}

