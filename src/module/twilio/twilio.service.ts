import { Injectable, Logger } from '@nestjs/common';
import Twilio from 'twilio';

@Injectable()
export class TwilioService {
  private readonly client;
  private readonly logger = new Logger(TwilioService.name);

  constructor() {
    this.client = Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
  }

  /** Send OTP SMS */
  async sendOtp(phone: string, code: string): Promise<void> {
    this.logger.log(`Sending OTP ${code} to ${phone}`);
    await this.client.messages.create({
      body: `Your verification code is: ${code}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
  }
}
