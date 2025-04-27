import { Injectable } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import * as SendGrid from "@sendgrid/mail"

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>("SENDGRID_API_KEY")
    if (apiKey) {
      SendGrid.setApiKey(apiKey)
    }
  }

  /**
   * Send an email
   * @param to Recipient email address
   * @param subject Email subject
   * @param content Email content (HTML)
   * @param options Additional options
   * @returns True if the email was sent successfully
   */
  async sendEmail(
    to: string,
    subject: string,
    content: string,
    options: {
      from?: string
      cc?: string | string[]
      bcc?: string | string[]
      attachments?: any[]
    } = {},
  ): Promise<boolean> {
    try {
      const { from, cc, bcc, attachments } = options

      const msg = {
        to,
        from: from || this.configService.get<string>("EMAIL_FROM"),
        subject,
        html: content,
        cc,
        bcc,
        attachments,
      }

      await SendGrid.send(msg)
      return true
    } catch (error) {
      console.error("Error sending email:", error)
      return false
    }
  }

  /**
   * Send a welcome email to a new user
   * @param to User's email address
   * @param name User's name
   * @param verificationUrl Verification URL (optional)
   * @returns True if the email was sent successfully
   */
  async sendWelcomeEmail(to: string, name: string, verificationUrl?: string): Promise<boolean> {
    const subject = "Welcome to our E-commerce Platform"

    let content = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome, ${name}!</h1>
        <p>Thank you for joining our e-commerce platform. We're excited to have you on board!</p>
    `

    if (verificationUrl) {
      content += `
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Verify Email</a>
      `
    }

    content += `
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>The E-commerce Team</p>
      </div>
    `

    return this.sendEmail(to, subject, content)
  }

  /**
   * Send a password reset email
   * @param to User's email address
   * @param resetUrl Password reset URL
   * @returns True if the email was sent successfully
   */
  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
    const subject = "Password Reset Request"

    const content = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Password Reset</h1>
        <p>You requested a password reset. Please click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>Best regards,<br>The E-commerce Team</p>
      </div>
    `

    return this.sendEmail(to, subject, content)
  }

  /**
   * Send an order confirmation email
   * @param to User's email address
   * @param orderDetails Order details
   * @returns True if the email was sent successfully
   */
  async sendOrderConfirmationEmail(
    to: string,
    orderDetails: {
      orderNumber: string
      date: string
      items: Array<{ name: string; quantity: number; price: number }>
      subtotal: number
      tax: number
      shipping: number
      total: number
      shippingAddress: string
    },
  ): Promise<boolean> {
    const subject = `Order Confirmation #${orderDetails.orderNumber}`

    let itemsHtml = ""
    orderDetails.items.forEach((item) => {
      itemsHtml += `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${item.price.toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `
    })

    const content = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Order Confirmation</h1>
        <p>Thank you for your order! We've received your order and are processing it.</p>
        
        <div style="margin: 20px 0; padding: 20px; background-color: #f9f9f9; border-radius: 4px;">
          <p><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
          <p><strong>Order Date:</strong> ${orderDetails.date}</p>
        </div>
        
        <h2 style="color: #333;">Order Summary</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: center;">Quantity</th>
              <th style="padding: 10px; text-align: right;">Price</th>
              <th style="padding: 10px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right;"><strong>Subtotal:</strong></td>
              <td style="padding: 10px; text-align: right;">$${orderDetails.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right;"><strong>Tax:</strong></td>
              <td style="padding: 10px; text-align: right;">$${orderDetails.tax.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right;"><strong>Shipping:</strong></td>
              <td style="padding: 10px; text-align: right;">$${orderDetails.shipping.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
              <td style="padding: 10px; text-align: right; font-weight: bold;">$${orderDetails.total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        
        <div style="margin: 20px 0; padding: 20px; background-color: #f9f9f9; border-radius: 4px;">
          <h3 style="color: #333;">Shipping Address</h3>
          <p>${orderDetails.shippingAddress}</p>
        </div>
        
        <p>If you have any questions about your order, please contact our customer support.</p>
        <p>Best regards,<br>The E-commerce Team</p>
      </div>
    `

    return this.sendEmail(to, subject, content)
  }
}

