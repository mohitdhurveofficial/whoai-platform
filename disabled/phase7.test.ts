import { test, expect } from '@playwright/test';

test.describe('Phase 7: Auth & Billing', () => {
  
  test('Middleware redirects unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Billing page displays current subscription', async ({ page }) => {
    // Mock auth session here if needed
    await page.goto('/billing');
    // Expect to see plan details once logged in
    const planHeader = page.locator('h2', { hasText: /Current Plan/i });
    await expect(planHeader).toBeVisible();
  });

  test('Subscription enforcement blocks agent creation', async () => {
    // Logic test for lib/subscription.ts
    const { canCreateAgent } = require('../lib/subscription');
    
    // Startup Plan (Limit 5)
    expect(canCreateAgent(4, 'STARTUP')).toBe(true);
    expect(canCreateAgent(5, 'STARTUP')).toBe(false);
    
    // Growth Plan (Limit 25)
    expect(canCreateAgent(24, 'GROWTH')).toBe(true);
    expect(canCreateAgent(25, 'GROWTH')).toBe(false);
  });

  test('Stripe API route accessibility', async ({ request }) => {
    // These should return 401 without session
    const checkout = await request.post('/api/billing/create-checkout', {
      data: { priceId: 'price_123' }
    });
    expect(checkout.status()).toBe(401);

    const portal = await request.post('/api/billing/create-portal');
    expect(portal.status()).toBe(401);
  });

  test('Webhook handler validation', async ({ request }) => {
    // Should fail without valid signature
    const response = await request.post('/api/webhooks/stripe', {
      data: {}
    });
    expect(response.status()).toBe(400);
  });
});