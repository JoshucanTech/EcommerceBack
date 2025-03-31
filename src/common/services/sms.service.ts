import { Injectable } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import * as twilio from "twilio"

@Injectable()
export class SmsService {
  private client: twilio.Twilio
  private fromNumber: string

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>("TWILIO_ACCOUNT_SID")
    const authToken = this.configService.get<string>("TWILIO_AUTH_TOKEN")
    this.fromNumber = this.configService.get<string>("TWILIO_PHONE_NUMBER")

    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken)
    }
  }

  /**
   * Send an SMS message
   * @param to Recipient phone number
   * @param message SMS message content
   * @returns True if the SMS was sent successfully
   */
  async sendSms(to: string, message: string): Promise<boolean> {
    try {
      if (!this.client) {
        console.warn("Twilio client not initialized. SMS not sent.")
        return false
      }

      await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to,
      })

      return true
    } catch (error) {
      console.error("Error sending SMS:", error)
      return false
    }
  }

  /**
   * Send a verification code via SMS
   * @param to Recipient phone number
   * @param code Verification code
   * @returns True if the SMS was sent successfully
   */
  async sendVerificationCode(to: string, code: string): Promise<boolean> {
    const message = `Your verification code is: ${code}. This code will expire in 10 minutes.`
    return this.sendSms(to, message)
  }

  /**
   * Send an order status update via SMS
   * @param to Recipient phone number
   * @param orderNumber Order number
   * @param status New order status
   * @returns True if the SMS was sent successfully
   */
  async sendOrderStatusUpdate(to: string, orderNumber: string, status: string): Promise<boolean> {
    const message = `Your order #${orderNumber} has been updated to: ${status}. Thank you for shopping with us!`
    return this.sendSms(to, message)
  }

  /**
   * Send a delivery notification via SMS
   * @param to Recipient phone number
   * @param orderNumber Order number
   * @param estimatedTime Estimated delivery time
   * @returns True if the SMS was sent successfully
   */
  async sendDeliveryNotification(to: string, orderNumber: string, estimatedTime: string): Promise<boolean> {
    const message = `Your order #${orderNumber} is on the way! Estimated delivery time: ${estimatedTime}. Thank you for your patience.`
    return this.sendSms(to, message)
  }
}

