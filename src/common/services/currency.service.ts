import { Injectable } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"

@Injectable()
export class CurrencyService {
  private defaultCurrency: string
  private exchangeRates: Record<string, number> = {}

  constructor(private configService: ConfigService) {
    this.defaultCurrency = this.configService.get<string>("DEFAULT_CURRENCY", "USD")

    // Initialize with some default exchange rates
    // In a real application, these would be fetched from an API
    this.exchangeRates = {
      USD: 1,
      EUR: 0.85,
      GBP: 0.75,
      JPY: 110.5,
      CAD: 1.25,
      AUD: 1.35,
      CNY: 6.45,
      INR: 74.5,
      NGN: 410.5,
    }
  }

  /**
   * Convert an amount from one currency to another
   * @param amount The amount to convert
   * @param fromCurrency The source currency code
   * @param toCurrency The target currency code
   * @returns The converted amount
   */
  convert(
    amount: number,
    fromCurrency: string = this.defaultCurrency,
    toCurrency: string = this.defaultCurrency,
  ): number {
    if (fromCurrency === toCurrency) {
      return amount
    }

    const fromRate = this.exchangeRates[fromCurrency] || 1
    const toRate = this.exchangeRates[toCurrency] || 1

    // Convert to USD first (base currency), then to target currency
    const amountInUSD = amount / fromRate
    const amountInTargetCurrency = amountInUSD * toRate

    return amountInTargetCurrency
  }

  /**
   * Format a currency amount according to locale
   * @param amount The amount to format
   * @param currency The currency code
   * @param locale The locale to use for formatting
   * @returns The formatted currency string
   */
  format(amount: number, currency: string = this.defaultCurrency, locale = "en-US"): string {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount)
  }

  /**
   * Get all available currencies
   * @returns An array of currency codes
   */
  getAvailableCurrencies(): string[] {
    return Object.keys(this.exchangeRates)
  }

  /**
   * Get the exchange rate between two currencies
   * @param fromCurrency The source currency code
   * @param toCurrency The target currency code
   * @returns The exchange rate
   */
  getExchangeRate(fromCurrency: string = this.defaultCurrency, toCurrency: string = this.defaultCurrency): number {
    if (fromCurrency === toCurrency) {
      return 1
    }

    const fromRate = this.exchangeRates[fromCurrency] || 1
    const toRate = this.exchangeRates[toCurrency] || 1

    return toRate / fromRate
  }
}

