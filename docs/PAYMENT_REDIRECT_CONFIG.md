# Payment Redirect Configuration

## Solution

The payment redirect issue has been fixed by simplifying the `getBaseUrl()` function to use only the `NEXTAUTH_URL` environment variable, which is already configured in your Vercel project.

### Current Configuration

Your Vercel environment variable:
- **Name**: `NEXTAUTH_URL`
- **Value**: `https://gymratplus.com`
- **Environment**: Production

✅ **No additional configuration needed!** The fix will work immediately after deployment.

## How It Works

When a user completes a payment in Mercado Pago, they are redirected to:

```
{baseUrl}/dashboard/profile/billing?success=true&plan_type={planType}
```

**Before the fix:**
- `baseUrl` was using `VERCEL_URL` → `https://gymratplus.vercel.app`
- Users were redirected to: `https://gymratplus.vercel.app/dashboard/profile/billing?success=true&plan_type=pro`

**After the fix:**
- `baseUrl` uses `NEXTAUTH_URL` → `https://gymratplus.com`
- Users are redirected to: `https://gymratplus.com/dashboard/profile/billing?success=true&plan_type=pro`

## Code Changes

Updated [`src/lib/mercadopago/client.ts`](file:///home/manudev/vercel/gymratplus/src/lib/mercadopago/client.ts):

```typescript
// Get base URL for callbacks
export function getBaseUrl(): string {
  // Use NextAuth URL (set to custom domain in production: https://gymratplus.com)
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  
  // Local development fallback
  // Mercado Pago sandbox accepts http://localhost
  return "http://localhost:3000";
}
```

## Testing

After deploying this fix:

1. Initiate a test payment
2. Complete the payment in Mercado Pago
3. Verify you're redirected to `https://gymratplus.com/dashboard/profile/billing`
4. Confirm the payment activation works correctly

