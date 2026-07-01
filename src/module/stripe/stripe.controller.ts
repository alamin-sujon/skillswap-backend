import { StripeService } from './stripe.service';
import { Controller, Post, Req, Res, Headers, Body } from '@nestjs/common';
import Stripe from 'stripe';
import { Request, Response } from 'express';
import getRawBody from 'raw-body';
import { Public } from 'src/common/decorators/public.decorator';
import { PaymentDto } from './dto/payment-intent-dto';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

  @Post('create-payment-intent')
  @Public()
  async createPaymentIntent(@Body() body: PaymentDto) {
    const paymentIntent = await this.stripeService.createPaymentIntent(
      body.amount,
      body.currency,
    );
    return {
      clientSecret: paymentIntent.client_secret,
    };
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;
    console.log({ webhookSecret });

    try {
      const rawBody = await getRawBody(req); // Use raw-body
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret!,
      );

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
      }

      res.status(200).send({ received: true });
    } catch (err) {
      console.error('Webhook Error:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
}
