import "server-only";
import { logger } from "@/lib/logger";
import { redis } from "@/lib/redis";

export class EmailService {
  /**
   * Dispatches an email notification with invoice details.
   */
  async send_invoice_email(params: {
    to_email: string;
    customer_name: string;
    invoice_number: string;
    amount: string;
    currency: string;
    pdf_buffer?: Buffer;
  }) {
    const { to_email, customer_name, invoice_number, amount, currency, pdf_buffer } = params;

    logger.info("billing_email_prepare", {
      to_email,
      invoice_number,
      amount,
      currency,
      has_attachment: !!pdf_buffer,
    });

    // Simulate sending email and push job details to Redis queue for auditing or webhook processing
    const payload = {
      event: "email:invoice_sent",
      to: to_email,
      recipient: customer_name,
      invoice: invoice_number,
      amount: `${amount} ${currency}`,
      timestamp: new Date().toISOString(),
    };

    await redis.publish("finance:notifications", JSON.stringify(payload));

    // Log complete dispatch success (extensible to Resend or Nodemailer)
    logger.info("billing_email_sent_successfully", {
      recipient: to_email,
      invoice: invoice_number,
    });

    return true;
  }
}

export const email_service = new EmailService();
