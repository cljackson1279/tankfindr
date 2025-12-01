#!/bin/bash

# This script uses the Stripe MCP's authenticated session to create a webhook
# The MCP is already authenticated with your Stripe account

echo "🔧 Creating webhook endpoint via Stripe API..."
echo ""

# We'll use the fetch_stripe_resources tool to verify we're authenticated first
manus-mcp-cli tool call get_stripe_account_info --server stripe --input '{}' 2>&1 | grep -q "account_id"

if [ $? -eq 0 ]; then
    echo "✅ Stripe MCP is authenticated!"
    echo ""
    echo "⚠️  Note: The Stripe MCP doesn't have a webhook creation tool."
    echo "   But since the MCP is authenticated, you can create the webhook manually."
    echo ""
    echo "📋 Use these details:"
    echo "   URL: https://tankfindr.vercel.app/api/webhooks/stripe"
    echo "   Events: See STRIPE_WEBHOOK_SETUP.md for full list"
    echo ""
    echo "🔗 Direct link: https://dashboard.stripe.com/webhooks"
else
    echo "❌ Stripe MCP is not authenticated"
fi
