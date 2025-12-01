import stripe
import os

# Load environment variables
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

# Webhook endpoint URL
webhook_url = "https://tankfindr.vercel.app/api/webhooks/stripe"

# Events to listen for
enabled_events = [
    # Checkout events
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
    "checkout.session.async_payment_failed",
    
    # Subscription events
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "customer.subscription.paused",
    "customer.subscription.resumed",
    "customer.subscription.trial_will_end",
    
    # Invoice events
    "invoice.created",
    "invoice.finalized",
    "invoice.payment_succeeded",
    "invoice.payment_failed",
    "invoice.upcoming",
    
    # Payment events
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
    "payment_intent.canceled",
    
    # Customer events
    "customer.created",
    "customer.updated",
    "customer.deleted",
]

try:
    # Create webhook endpoint
    webhook_endpoint = stripe.WebhookEndpoint.create(
        url=webhook_url,
        enabled_events=enabled_events,
        description="TankFindr production webhook for subscription and payment events",
    )
    
    print("✅ Webhook endpoint created successfully!")
    print(f"\n📍 Webhook URL: {webhook_endpoint.url}")
    print(f"🆔 Webhook ID: {webhook_endpoint.id}")
    print(f"\n🔐 Signing Secret (IMPORTANT - Save this!):")
    print(f"   {webhook_endpoint.secret}")
    print(f"\n📋 Events configured: {len(enabled_events)} events")
    print(f"\n⚠️  NEXT STEPS:")
    print(f"   1. Copy the signing secret above")
    print(f"   2. Add to Vercel environment variables:")
    print(f"      STRIPE_WEBHOOK_SECRET={webhook_endpoint.secret}")
    print(f"   3. Redeploy Vercel")
    
except stripe.error.StripeError as e:
    print(f"❌ Error creating webhook: {e}")
    print(f"\nError details: {e.user_message if hasattr(e, 'user_message') else str(e)}")
except Exception as e:
    print(f"❌ Unexpected error: {e}")
