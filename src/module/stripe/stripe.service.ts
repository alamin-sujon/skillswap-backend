import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});
  }

  async createProduct(name: string, description?: string) {
    return this.stripe.products.create({
      name,
      description,
    });
  }

  async createSubscriptionPrice(
    productId: string,
    amount: number,
    interval: 'month' | 'year',
  ) {
    return this.stripe.prices.create({
      product: productId,
      unit_amount: amount * 100, // Stripe uses cents
      currency: 'usd',
      recurring: {
        interval,
      },
    });
  }

  updateProduct(productId: string, data: Stripe.ProductUpdateParams) {
    return this.stripe.products.update(productId, data);
  }

  async createPaymentIntent(amount: number, currency: string) {
    return this.stripe.paymentIntents.create({
      amount, // in smallest currency unit (e.g., cents)
      currency,
      payment_method_types: ['card'],
    });
  }

  // stripe.service.ts
  async createSubscriptionCheckout(priceId: string, customerEmail: string) {
    return this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: customerEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });
  }

  async retrievePaymentIntent(id: string) {
    return this.stripe.paymentIntents.retrieve(id);
  }
}

// getAllProducts(limit = 100) {
//   return this.stripe.products.list({
//     limit,
//   });
// }

// getProducts(limit = 100) {
//   return this.stripe.products.list({
//     limit,
//     active: true,
//   });
// }

// getPricesByProduct(productId: string) {
//   return this.stripe.prices.list({
//     product: productId,
//     active: true,
//   });
// }
