/**
 * Script to create Stripe products and prices for TankFindr
 * Run this once to set up your Stripe account
 * 
 * Usage: STRIPE_SECRET_KEY=sk_test_... node scripts/setup-stripe-products.js
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const products = [
  {
    name: 'TankFindr Starter',
    description: 'For small septic companies (1 truck) - 300 lookups/month',
    price: 9900, // $99.00 in cents
    interval: 'month',
    metadata: {
      tier: 'starter',
      lookup_limit: '300',
    },
  },
  {
    name: 'TankFindr Pro',
    description: 'For companies with multiple trucks - 1,500 lookups/month',
    price: 24900, // $249.00 in cents
    interval: 'month',
    metadata: {
      tier: 'pro',
      lookup_limit: '1500',
    },
  },
  {
    name: 'TankFindr Enterprise',
    description: 'For regional multi-county operators - Unlimited lookups',
    price: 59900, // $599.00 in cents
    interval: 'month',
    metadata: {
      tier: 'enterprise',
      lookup_limit: 'unlimited',
    },
  },
  {
    name: 'Property Septic Status & Location Report',
    description: 'One-time property report with septic status and tank location',
    price: 1900, // $19.00 in cents
    interval: null, // One-time payment
    metadata: {
      type: 'property_report',
    },
  },
];

async function setupStripeProducts() {
  console.log('Setting up Stripe products...\n');

  for (const productData of products) {
    try {
      // Create product
      const product = await stripe.products.create({
        name: productData.name,
        description: productData.description,
        metadata: productData.metadata,
      });

      console.log(`✅ Created product: ${product.name}`);
      console.log(`   Product ID: ${product.id}`);

      // Create price
      const priceParams = {
        product: product.id,
        unit_amount: productData.price,
        currency: 'usd',
        metadata: productData.metadata,
      };

      if (productData.interval) {
        priceParams.recurring = { interval: productData.interval };
      }

      const price = await stripe.prices.create(priceParams);

      console.log(`✅ Created price: ${price.id}`);
      console.log(`   Amount: $${(price.unit_amount / 100).toFixed(2)}`);
      console.log(`   Type: ${price.recurring ? 'Subscription' : 'One-time'}\n`);

      // Output environment variable format
      const envVarName = productData.metadata.type 
        ? `STRIPE_PRICE_ID_${productData.metadata.type.toUpperCase()}`
        : `STRIPE_PRICE_ID_${productData.metadata.tier.toUpperCase()}`;
      
      console.log(`   Add to .env.local:`);
      console.log(`   ${envVarName}=${price.id}\n`);
      console.log('---\n');
    } catch (error) {
      console.error(`❌ Error creating ${productData.name}:`, error.message);
    }
  }

  console.log('\n✅ Stripe setup complete!');
  console.log('\nNext steps:');
  console.log('1. Copy the STRIPE_PRICE_ID_* variables to your .env.local file');
  console.log('2. Update lib/stripe/config.ts with the actual price IDs');
  console.log('3. Test the checkout flow');
}

// Run the setup
setupStripeProducts().catch(console.error);
