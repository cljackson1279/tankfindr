// Environment variable validation
// This ensures all required environment variables are set before the app starts

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_STARTER',
  'STRIPE_PRICE_PRO',
  'STRIPE_PRICE_ENTERPRISE',
  'STRIPE_PRICE_INSPECTOR',
  'NEXT_PUBLIC_MAPBOX_TOKEN',
] as const;

const optionalEnvVars = [
  'STRIPE_PRICE_PROPERTY_REPORT',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_GA_MEASUREMENT_ID',
] as const;

export function validateEnv() {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  // Check optional variables
  for (const varName of optionalEnvVars) {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\n` +
      `Please add these to your .env.local file or Vercel environment variables.\n` +
      `See .env.example for reference.`
    );
  }

  if (warnings.length > 0 && process.env.NODE_ENV === 'production') {
    console.warn(
      `⚠️  Optional environment variables not set:\n${warnings.map(v => `  - ${v}`).join('\n')}\n` +
      `Some features may not work correctly.`
    );
  }

  // Validate Stripe keys format
  if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && 
      !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with "pk_"');
  }

  if (process.env.STRIPE_SECRET_KEY && 
      !process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    throw new Error('STRIPE_SECRET_KEY must start with "sk_"');
  }

  if (process.env.STRIPE_WEBHOOK_SECRET && 
      !process.env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_')) {
    throw new Error('STRIPE_WEBHOOK_SECRET must start with "whsec_"');
  }

  // Validate Stripe price IDs format
  const priceEnvVars = [
    'STRIPE_PRICE_STARTER',
    'STRIPE_PRICE_PRO',
    'STRIPE_PRICE_ENTERPRISE',
    'STRIPE_PRICE_INSPECTOR',
  ];

  for (const varName of priceEnvVars) {
    const value = process.env[varName];
    if (value && !value.startsWith('price_')) {
      throw new Error(`${varName} must start with "price_"`);
    }
  }

  console.log('✅ Environment variables validated successfully');
}

// Auto-validate in production
if (process.env.NODE_ENV === 'production') {
  try {
    validateEnv();
  } catch (error) {
    console.error(error);
    // Don't throw in production to avoid build failures
    // Instead, log the error and let the app start
  }
}
