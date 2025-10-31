import { db } from '@/db/db';
import { subscription, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { updateTag } from 'next/cache';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    typescript: true,
});

const webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = ((await headers()).get('stripe-signature') || '');

        // Verify the event came from Stripe
        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(
                body,
                signature,
                webhookSecret
            );
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
                return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
            } else {
                console.error('Error processing webhook:', err);
                return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
            }
        }

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed':
                const checkoutSession = await stripe.checkout.sessions.retrieve(
                    (event.data.object as Stripe.Checkout.Session).id,
                    {
                        expand: ["line_items"],
                    }
                );
                console.log(`Checkout Session ${checkoutSession.id} was successful!`);
                const customerId = checkoutSession.customer as string;
                const customerDetails = checkoutSession.customer_details;

                if (customerDetails?.email) {
                    console.log(`Customer Email: ${customerDetails.email}`);
                    const user = await db.query.users.findFirst({
                        where: eq(users.email, customerDetails.email),
                        with: {
                            subscription: true
                        }
                    });
                    if (user) {
                        if (!user.stripeCustomerId) {
                            console.log(`Updating user ${user.id} with Stripe Customer ID ${customerId}`);
                            await db
                                .update(users)
                                .set({ stripeCustomerId: customerId })
                                .where(eq(users.id, user.id));

                        }

                        const lineItems = checkoutSession.line_items?.data || [];
                        for (const item of lineItems) {
                            const priceId = item.price?.id;
                            const isSubscription = item.price?.type === 'recurring';

                            if (isSubscription) {
                                console.log(`User ${user.id} subscribed with Price ID: ${priceId}`);
                                const endDate = new Date();
                                endDate.setMonth(endDate.getMonth() + 1);
                                let plan: "free" | "pro" | "power" = "free";
                                switch (priceId) {
                                    case process.env.STRIPE_PRO_PRODUCT_ID:
                                        plan = "pro";
                                        break;
                                    case process.env.STRIPE_POWER_PRODUCT_ID:
                                        plan = "power";
                                        break;
                                }
                                const values = {
                                    userId: user.id,
                                    stripeSubscriptionId: checkoutSession.subscription as string,
                                    status: 'active',
                                    currentPeriodEnd: endDate,
                                    plan: plan,
                                };
                                if (user.subscription) {
                                    console.log(`Updating existing subscription for user ${user.id}`);
                                    await db
                                        .update(subscription)
                                        .set(values)
                                        .where(eq(subscription.id, user.subscription.id));
                                } else {
                                    console.log(`Creating new subscription for user ${user.id}`);
                                    await db.insert(subscription).values(values);

                                }
                                updateTag(`user-account-${user.id}`);
                            } else {
                                console.log(`User ${user.id} made a one-time purchase with Price ID: ${priceId}`);
                            }
                        }
                    } else {
                        console.log(`No user found with email ${customerDetails.email}`);
                        throw new Error(`No user found with email ${customerDetails.email}`);
                    }
                }
                break;

            case 'customer.subscription.deleted':
                const deleteSubscription = await stripe.subscriptions.retrieve((event.data.object as Stripe.Subscription).id);
                console.log(`Customer subscription deleted: ${deleteSubscription.id}`);
                const user = await db.query.users.findFirst({
                    where: eq(users.stripeCustomerId, deleteSubscription.customer as string),
                    with: {
                        subscription: true
                    }
                });
                if (user && user.subscription) {
                    console.log(`Marking subscription ${user.subscription.id} as canceled for user ${user.id}`);
                    await db
                        .update(subscription)
                        .set({ status: 'canceled', plan: 'free' })
                        .where(eq(subscription.id, user.subscription.id));
                }
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error(`Error processing webhook: ${err.message}`);
            return NextResponse.json({ error: err.message }, { status: 500 });
        } else {
            console.error('Error processing webhook:', err);
            return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
        }
    }
}