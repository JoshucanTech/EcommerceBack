import { Injectable } from "@nestjs/common"
import type { I18nService } from "nestjs-i18n"

@Injectable()
export class TranslationService {
  constructor(private i18n: I18nService) {}

  /**
   * Translate a key to the specified language
   * @param key The translation key
   * @param options Translation options
   * @returns The translated string
   */
  translate(
    key: string,
    options: {
      lang?: string
      args?: Record<string, any>
    } = {},
  ): string {
    const { lang, args } = options
    return this.i18n.translate(key, { lang, args })
  }

  /**
   * Get all available languages
   * @returns An array of language codes
   */
  getAvailableLanguages(): string[] {
    return this.i18n.getSupportedLanguages()
  }
}

