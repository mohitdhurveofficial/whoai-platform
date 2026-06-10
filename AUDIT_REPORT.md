# WHOAI Platform - Operational Loop Readiness Audit

## Executive Summary
**Overall Readiness**: ⚠️ **LAUNCH-READY WITH CRITICAL GAPS**

The platform has a working implementation of the 5-step operational loop, but **SEVERAL CRITICAL ISSUES MUST BE RESOLVED** before production launch:

1. **NO PASSWORD HASHING** - User passwords are stored in Supabase (delegated), but WHOAI's User model has NO password field
2. **Session JWT missing httpOnly safeguard in client-side login** - Cookie set via document.cookie (XSS vector)
3. **Agent API key lookup not implemented** - Route handler missing for gateway auth (blocking step 7)
4. **API Key UI incomplete** - Stub page with no backend integration
5. **No test coverage for auth flows** - Zero tests for signup/login/agent-creation
6. **Org auto-creation untested** - Works but undocumented

---

## STEP 1: USER SIGNUP ✅ (80% Ready)

### Execution Path
```
GET /auth/signup (page.tsx:45)
  → POST /api/auth/signup (route.ts)
    → supabase.auth.signUp() [password hashing delegated to Supabase]
    → prisma.organization.create()
    → prisma.user.create()
    → createSessionToken() [JWT sign]
    → Set cookie: whoai_auth
    → Return token + redirect to /dashboard
```

### Files Involved
- **UI**: `/app/auth/signup/page.tsx` (lines 1-210)
- **API**: `/app/api/auth/signup/route.ts` (lines 20-167)
- **Session**: `/lib/auth/session.ts` (lines 10-24)
- **Schema**: `/prisma/schema.prisma` (lines 11-54: Organization, User models)

### Implementation Status
**✅ IMPLEMENTED** - Fully functional signup flow with:
- Email validation (trim/lowercase)
- Password validation (8+ chars minimum)
- Org creation with auto-generated slug
- User created as OWNER role in transaction

### Code Evidence
```typescript
// signup/route.ts:51-61
const signup = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      fullName,
      organizationName,
      role: "OWNER",
    },
  },
});

// Atomic transaction: signup/route.ts:103-121
const user = await prisma.$transaction(async (tx) => {
  const organization = await tx.organization.create({
    data: {
      name: organizationName,
      slug: slugify(organizationName),
      tier: OrgTier.STARTUP,
    },
  });
  return tx.user.create({
    data: {
      id: supabaseUserId,
      fullName,
      email,
      role: "OWNER",
      organizationId: organization.id,
    },
  });
});
```

### Critical Issues
❌ **CRITICAL**: User model has NO password field
- Passwords are delegated entirely to Supabase Auth
- WHOAI's User table (schema.prisma:46-54) has: id, email, role, organizationId, createdAt, fullName
- **Risk**: Cannot implement password reset, password policy enforcement, or local password changes without schema migration
- **Mitigation Required**: Either add password field OR document Supabase-only password management

❌ **HIGH**: Signup doesn't validate organizationName is present
- signup/route.ts:35 checks `!organizationName` but form submits empty string as fallback
- No frontend validation preventing empty org names

❌ **MEDIUM**: Duplicate org slug not handled gracefully
- Slug race condition could occur if two users sign up with same company name simultaneously
- Code catches P2002 error (line 151) and returns 409, but user experience unclear

### Tests
**❌ NO TESTS FOUND** - Zero coverage for signup flow

---

## STEP 2: USER LOGIN ✅ (75% Ready)

### Execution Path
```
GET /auth/login (page.tsx:42-97)
  → POST /api/auth/login (route.ts:10-86)
    → supabase.auth.signInWithPassword()
    → prisma.user.findFirst() [by id OR email]
    → createSessionToken() [JWT sign]
    → Set cookie: whoai_auth (httpOnly server-side)
    → Set cookie: whoai_auth (document.cookie client-side!) ⚠️
    → Return token + redirect to /dashboard
```

### Files Involved
- **UI**: `/app/auth/login/page.tsx` (lines 35-97)
- **API**: `/app/api/auth/login/route.ts` (lines 10-86)
- **Session**: `/lib/auth/session.ts` (lines 26-32: sessionCookieOptions)

### Implementation Status
**✅ IMPLEMENTED** - Login works with Supabase password verification

### Code Evidence
```typescript
// login/route.ts:24-30
const authResult = await supabase.auth.signInWithPassword({ email, password });

if (authResult.error || !authResult.data.user) {
  const raw = authResult.error?.message ?? "";
  const needsConfirmation = /confirm/i.test(raw);
  return NextResponse.json({ ... }, { status: needsConfirmation ? 403 : 401 });
}

// Session token created:
const token = createSessionToken(user); // lines 63
response.cookies.set("whoai_auth", token, sessionCookieOptions); // line 78
```

### Session Configuration
**✅ SECURE SERVER-SIDE** - sessionCookieOptions (session.ts:26-32):
```typescript
{
  httpOnly: true,      // ✅ Prevents JS access
  sameSite: "lax",     // ✅ CSRF protection
  secure: process.env.NODE_ENV === "production", // ✅ HTTPS only in prod
  path: "/",
  maxAge: 604800,      // 7 days
}
```

### Critical Issues
❌ **CRITICAL XSS VECTOR**: Client overwrites secure cookie with document.cookie
- `/app/auth/login/page.tsx:84` **SETS THE COOKIE AGAIN CLIENT-SIDE**:
  ```typescript
  document.cookie = `whoai_auth=${data.token}; path=/; max-age=86400; SameSite=Lax`;
  ```
- **Problem**: Sets INSECURE cookie (no httpOnly) that JavaScript can read
- **Risk**: ANY XSS attack can steal the token
- **Mitigation**: Remove client-side cookie setting; rely only on server Set-Cookie header

❌ **MEDIUM**: localStorage stores user data client-side (line 85-86)
- localStorage.setItem("user", ...) exposes organizationId, role to any script
- Attacker can spoof identity via localStorage injection

❌ **HIGH**: Signup also sets cookie client-side (signup/page.tsx:84)
- **Same XSS issue** in signup flow

### Tests
**❌ NO TESTS FOUND** - Zero coverage for login flow

---

## STEP 3: ORGANIZATION CREATED ✅ (85% Ready)

### Execution Path
```
POST /api/auth/signup
  → prisma.organization.create()
    → id (uuid)
    → name (from request)
    → slug (auto-generated from name + random suffix)
    → tier: STARTUP (hardcoded default)
    → subscriptionStatus: "FREE"
    → subscriptionTier: "FREE"
    → status: "ACTIVE"
    → timestamps: createdAt, updatedAt
```

### Files Involved
- **Schema**: `/prisma/schema.prisma` (lines 11-44)
- **Route**: `/app/api/auth/signup/route.ts` (lines 104-110)

### Implementation Status
**✅ IMPLEMENTED** - Organization auto-created on signup

### Code Evidence
```typescript
// signup/route.ts:104-110 (inside transaction)
const organization = await tx.organization.create({
  data: {
    name: organizationName,
    slug: slugify(organizationName), // line 107
    tier: OrgTier.STARTUP,
  },
});

// User linked immediately:
return tx.user.create({
  data: {
    id: supabaseUserId,
    fullName,
    email,
    role: "OWNER",
    organizationId: organization.id, // ✅ Linked
  },
});
```

### Slug Generation (lines 7-14)
```typescript
function slugify(value: string) {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
  return `${base || "workspace"}-${crypto.randomUUID().slice(0, 8)}`;
}
```
✅ **GOOD**: Adds random suffix to prevent slug collisions

### Org Model Fields
```prisma
model Organization {
  id                   String     @id @default(uuid())
  name                 String
  slug                 String     @unique        // ✅ Enforced
  tier                 OrgTier    @default(STARTUP)
  subscriptionStatus   String     @default("FREE")
  subscriptionTier     String     @default("FREE")
  status               String     @default("ACTIVE")
  stripeCustomerId     String?    @unique
  ...
}
```

### Critical Issues
⚠️ **MEDIUM**: `tier` field vs `subscriptionTier` field duplication
- Schema has both `tier: OrgTier` and `subscriptionTier: String`
- Inconsistent - should use one enum
- Migration needed to clean up

⚠️ **LOW**: Slug uniqueness constraint not tested
- Race condition on simultaneously-created orgs with same name

### Tests
**❌ NO TESTS FOUND** - Zero coverage for org creation

---

## STEP 4: AGENT CREATED ✅ (70% Ready)

### Execution Path
```
POST /api/agents (agents/route.ts:42-123)
  ├─ Auth check: getServerAuthContext() ✅
  ├─ Plan limit check: canCreateAgent() ✅
  ├─ Generate agent API key:
  │  ├─ rawKey = `whoai_sk_` + 32 random hex bytes (line 78)
  │  └─ hashedKey = SHA256(rawKey) (line 79)
  ├─ Generate OAuth credentials:
  │  ├─ clientId = randomUUID() (line 81)
  │  └─ clientSecret = bcrypt.hash(32 random bytes, rounds=12) (line 82)
  ├─ Create agent in DB (lines 84-94)
  │  └─ Stores hashedKey, NOT rawKey ✅
  ├─ Log activity (lines 110-117)
  └─ Return { agent, generatedApiKey: rawKey } (line 119)
      ✅ rawKey returned ONCE to client, never again
```

### Files Involved
- **API**: `/app/api/agents/route.ts` (lines 42-123)
- **UI**: `/app/(dashboard)/agents/new/page.tsx` (lines 1-190)
- **Schema**: `/prisma/schema.prisma` (lines 56-83: Agent model)

### Implementation Status
**✅ IMPLEMENTED** - Agent creation with secure API key generation

### Code Evidence
```typescript
// agents/route.ts:77-94
const rawKey = `whoai_sk_${crypto.randomBytes(32).toString("hex")}`;
const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");

const clientId = crypto.randomUUID();
const clientSecret = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 12);

const agent = await prisma.agent.create({
  data: {
    name,
    status: status || "ACTIVE",
    dailyBudget,
    monthlyBudget,
    apiKey: hashedKey,        // ✅ Store hash only
    clientId,
    clientSecret,             // ✅ Bcrypt hashed
    organizationId: orgId,
  },
  // ...
});

return NextResponse.json({ success: true, agent, generatedApiKey: rawKey }); // ✅ One-time
```

### Agent Model
```prisma
model Agent {
  id                  String @id @default(uuid())
  name                String
  organizationId      String
  clientId            String @unique
  clientSecret        String                     // ✅ Bcrypt hashed
  apiKey              String @unique             // ✅ SHA256 hashed
  scopes              String[] @default(["llm:read", "llm:write"])
  status              AgentStatus @default(ACTIVE)
  dailyBudget         Decimal
  monthlyBudget       Decimal
  currentDailySpend   Decimal @default(0)
  currentMonthlySpend Decimal @default(0)
  createdAt           DateTime @default(now())
  ...
}
```

### UI (agents/new/page.tsx)
**✅ EXCELLENT** - Success modal with:
- Warning: "Copy this API key now. It cannot be viewed again"
- Copy button with visual feedback
- Modal closes → redirects to /agents

### Critical Issues
⚠️ **MEDIUM**: clientSecret bcrypt hashing rounds = 12
- agents/route.ts:82: `bcrypt.hash(..., 12)` is fine but consider documenting
- No clientSecret lookup implemented; unclear how clientSecret is used (OAuth flow not audited)

⚠️ **HIGH**: Agent fields NOT all returned in response
- Agent creation response (lines 95-106) excludes `clientSecret` and `apiKey` ✅ Good for security
- But `clientSecret` is never returned to user anywhere
- **Risk**: If user loses clientSecret, no recovery mechanism visible

⚠️ **MEDIUM**: No rate limiting on agent creation
- Org can spam-create unlimited agents if plan limit is not enforced
- canCreateAgent() is called, but code path should verify

### Tests
**❌ NO TESTS FOUND** - Zero coverage for agent creation

---

## STEP 5: API KEY GENERATED ❌ (30% Ready)

### Execution Path
```
POST /api/api-keys (api-keys/route.ts:7-44)
  ├─ Auth check: getServerAuthContext() ✅
  ├─ Generate key pair:
  │  ├─ plainText = `wk_live_` + 32 random hex bytes (security/api-keys.ts:4-11)
  │  └─ hash = SHA256(plainText)
  ├─ Create ApiKey record (lines 22-29)
  │  └─ Stores keyHash, NOT plainText ✅
  └─ Return { success: true, apiKey: plainText, id, name }
      ✅ plainText returned once
```

### Files Involved
- **API**: `/app/api/api-keys/route.ts` (lines 7-44)
- **Utility**: `/lib/security/api-keys.ts` (lines 3-13)
- **Lookup**: `/lib/security/validate-api-key.ts` (lines 4-15)
- **UI**: `/app/(dashboard)/settings/api-keys/page.tsx` (stub with hardcoded data)
- **Schema**: `/prisma/schema.prisma` (lines 207-218: ApiKey model)

### Implementation Status
**⚠️ PARTIALLY IMPLEMENTED** - Route works, but UI is a stub and no lookup route exists

### Code Evidence
```typescript
// lib/security/api-keys.ts:3-12
export function generateApiKey() {
  const secret = crypto.randomBytes(32).toString("hex");
  return {
    plainText: `wk_live_${secret}`,
    hash: crypto
      .createHash("sha256")
      .update(`wk_live_${secret}`)
      .digest("hex"),
  };
}

// api-keys/route.ts:20-29
const { plainText, hash } = generateApiKey();
const apiKey = await prisma["apiKey"].create({
  data: {
    id: crypto.randomUUID(),
    organizationId: auth.organizationId,
    name: body.name || "Default Key",
    keyHash: hash,
  },
});
return NextResponse.json({
  success: true,
  apiKey: plainText,  // ✅ One-time return
  id: apiKey.id,
  name: apiKey.name,
});
```

### ApiKey Model
```prisma
model ApiKey {
  id             String @id @default(cuid())
  organizationId String
  name           String
  keyHash        String @unique        // ✅ SHA256 hash stored
  lastUsedAt     DateTime?
  revoked        Boolean @default(false)
  createdAt      DateTime @default(now())
  Organization   Organization @relation(...)
}
```

### Validation Utility
**✅ CORRECT** - validate-api-key.ts hashes incoming key and looks up by hash:
```typescript
export async function validateApiKey(key: string) {
  const hash = crypto
    .createHash("sha256")
    .update(key)
    .digest("hex");
  return prisma.apiKey.findFirst({
    where: {
      keyHash: hash,
      revoked: false,
    },
  });
}
```

### Critical Issues
❌ **CRITICAL**: API Key UI is a STUB with hardcoded mock data
- `/app/(dashboard)/settings/api-keys/page.tsx` has NO backend calls
- No "Create API Key" button functionality
- Table shows hardcoded keys (wh_prod_8x92..., wh_test_2b4z...) - not real org keys
- No list, copy, or revoke functionality implemented
- **Risk**: Users cannot actually create/manage API keys from UI

❌ **CRITICAL**: No API key lookup/validation route for gateway auth
- **Step 7 (gateway auth) CANNOT WORK** - there's no route for gateway to validate `wk_live_*` keys
- Must implement: `GET /api/api-keys/validate` or similar to support gateway authentication
- validateApiKey() utility exists but is unused

❌ **HIGH**: Agency of `lastUsedAt` unclear
- ApiKey schema has `lastUsedAt` field but it's never updated
- Gateway auth should update this on each request

⚠️ **MEDIUM**: No soft-delete mechanism for API keys
- Keys can be `revoked: true` but cannot be hard-deleted (good for audit trail)
- But UI shows "Revoke" action that doesn't exist

### Tests
**❌ NO TESTS FOUND** - Zero coverage for API key generation/validation

---

## CROSS-CUTTING CONCERNS

### Password Hashing
**🔒 DELEGATED TO SUPABASE** - NOT IN WHOAI codebase
- WHOAI User model has NO password field
- All password hashing happens in Supabase Auth
- **Questions**:
  - What is Supabase's password hashing? (likely bcrypt, but undocumented in codebase)
  - Can WHOAI enforce password policies?
  - Can users change passwords without Supabase?
- **Recommendation**: Document password policy and Supabase Auth setup in CLAUDE.md

### Session/JWT Handling
**JWT Configuration** (/lib/auth/session.ts:10-24):
```typescript
const JWT_SECRET = process.env.NEXTAUTH_SECRET;
return jwt.sign(
  {
    userId: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
  },
  secret,
  { expiresIn: "7d" },  // ✅ 7-day expiry
);
```
✅ **GOOD**: 7-day expiry, includes all needed claims

**Cookie Security** (/lib/auth/session.ts:26-32):
✅ **GOOD**: httpOnly, SameSite=Lax, Secure in production

**BUT BROKEN CLIENT-SIDE** (see Step 2 issue)

### API Key Prefix & Storage
✅ **Agent API Keys**:
- Prefix: `whoai_sk_` ✅
- Storage: SHA256 hash ✅
- Returned once only ✅

✅ **Organization API Keys**:
- Prefix: `wk_live_` ✅
- Storage: SHA256 hash ✅
- Returned once only ✅

⚠️ **Both prefixes are documented in code** but no shared constant

### Organization Auto-Creation
✅ **WORKS**:
- User auto-created as OWNER
- Org created in same transaction
- Slug generation handles collisions

⚠️ **NOT TESTED** - No test coverage

### Error Handling
✅ **GOOD**: Generic error messages prevent info leakage
- "Signup failed. Please try again." (not specifics)
- "Invalid credentials" (not email-not-found vs wrong-password)

⚠️ **PROBLEM**: Too generic for debugging
- No error codes/IDs in logs
- signup/route.ts logs to console but no structured logging

### Gateway Auth (Step 7 - BLOCKING)
**❌ CRITICAL MISSING**: Gateway cannot authenticate agent API keys
- `/lib/security/validate-api-key.ts` exists but is never called
- No route handler for gateway to hit
- Agent.apiKey field exists and is hashed, but lookup is missing
- **Required for launch**: Implement route like:
  ```
  POST /api/gateway/auth
    body: { apiKey: "whoai_sk_..." }
    returns: { agentId, organizationId } or 401
  ```

---

## TEST COVERAGE

**Current**: 3 test files, ZERO for operational loop
- `__tests__/gateway-adapters.test.ts` - gateway HTTP adapters only
- `__tests__/stripe-sync.test.ts` - billing sync
- `__tests__/subscription.test.ts` - plan limits

**Missing**:
- ❌ Signup flow (validation, org creation, token generation)
- ❌ Login flow (auth, session, redirect)
- ❌ Agent creation (plan limits, API key generation)
- ❌ API key generation (hashing, uniqueness)
- ❌ API key validation (lookup, hashing)
- ❌ Session verification (JWT decode, expiry)

---

## LAUNCH READINESS SUMMARY

| Step | Status | Blocker? | Evidence |
|------|--------|----------|----------|
| 1. Signup | 80% | NO | Working but no password field, XSS on client-side cookie |
| 2. Login | 75% | NO | Working but XSS on client-side cookie |
| 3. Org Created | 85% | NO | Working, untested |
| 4. Agent Created | 70% | NO | Working but clientSecret recovery unclear |
| 5. API Key Generated | 30% | **YES** | UI is stub, no gateway lookup route |
| 7. Gateway Auth | 0% | **YES** | No validation route implemented |

---

## PRIORITY FIX LIST (Before Launch)

### CRITICAL (Launch Blocker)
1. **Remove client-side cookie setting** in login/signup (XSS)
   - Delete line 84 in /app/auth/login/page.tsx
   - Delete localStorage lines 85-86
   - Rely only on server Set-Cookie header
   
2. **Implement API key validation route** for gateway
   - Create `POST /api/gateway/validate-api-key`
   - Use existing validateApiKey() utility
   - Return { agentId, organizationId } or 401

3. **Complete API Key UI** 
   - Implement "Create API Key" form
   - Implement list endpoint to fetch user's keys
   - Implement delete/revoke endpoint
   - Replace stub page with real implementation

4. **Add password field to User model** (or document Supabase-only)
   - Schema migration required
   - OR document that password management is Supabase-only

### HIGH (Pre-Launch)
5. Write integration tests for all 5 steps
6. Document Supabase Auth integration (password policy, setup)
7. Implement clientSecret recovery mechanism or disable OAuth flow

### MEDIUM (Post-Launch)
8. Add structured logging (error codes, tracing)
9. Consolidate API key prefix constants
10. Clean up tier vs subscriptionTier duplication

---

## EVIDENCE CHECKLIST

- ✅ Signup route: /app/api/auth/signup/route.ts
- ✅ Login route: /app/api/auth/login/route.ts
- ✅ Agent creation: /app/api/agents/route.ts
- ✅ API key generation: /app/api/api-keys/route.ts
- ✅ Session handling: /lib/auth/session.ts
- ✅ Schema: /prisma/schema.prisma
- ✅ Supabase integration: /utils/supabase/server.ts
- ✅ Server auth context: /lib/server/auth.ts
- ✅ API key validation: /lib/security/validate-api-key.ts
- ❌ Gateway validation route: NOT FOUND
- ❌ API Key UI logic: NOT FOUND (stub only)
- ❌ Test files: 0 for operational loop

