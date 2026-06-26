<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Notable change already in play: **Middleware is now `proxy.ts`** (project root, exports a `proxy` function + `config.matcher`). See `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`.
<!-- END:nextjs-agent-rules -->

# Git workflow

Work directly on `master`. Do **not** create feature branches — commit (and merge, when asked) straight to `master`.

# Backend API

The frontend talks to the Laravel backend at **`https://hamrah.test`** (override with `NEXT_PUBLIC_API_BASE_URL`).

- **Interactive docs (Swagger UI):** https://hamrah.test/api/documentation
- **Raw OpenAPI spec:** `https://hamrah.test/docs?api-docs.json`
- **Committed snapshot:** [`docs/backend-openapi.json`](docs/backend-openapi.json) — a cached copy for offline reference. **It goes stale; refresh it before relying on it.**

## Pull the docs at the start of every backend/API task

The backend evolves independently. At the **start of any task touching the API**, re-pull the spec so you're working against the live contract:

```bash
curl -sk "https://hamrah.test/docs?api-docs.json" -o docs/backend-openapi.json
jq '.paths | keys' docs/backend-openapi.json   # sanity-check it parsed
```

Treat the freshly pulled `docs/backend-openapi.json` as the source of truth for endpoints, request/response shapes, and error formats. (`-k` is needed because `hamrah.test` uses a local self-signed cert.)

## Conventions

- **Response envelope:** success → `{ success, message, data }`; failure → `{ success, message, errors }`. The client (`lib/api.ts#apiFetch`) unwraps `data` and throws `ApiError` (carrying `message`, `status`, and field `errors`) otherwise.
- **Auth:** Sanctum bearer token. Send `Authorization: Bearer {token}`. The token from `POST /api/v1/auth/otp/verify` is stored in the `hamrah_token` cookie; `lib/auth.ts` holds the cookie + endpoint helpers and `proxy.ts` guards `/dashboard` by its presence.
- **CORS:** the browser calls `hamrah.test` cross-origin, so the backend must allow the dev origin (`http://localhost:3000`) and the `Authorization` header.

# Design system

Use the existing tokens — never hardcode colors. Defined in [`app/globals.css`](app/globals.css):

- Brand scales `brand-50…900` (eco green) and `accent-300…700` (sky), e.g. `bg-brand-500`, `text-brand-700`, `border-brand-100`.
- Semantic shadcn tokens: `primary`, `muted`, `foreground`, `card`, `border`, `ring`, `destructive`, etc.

Reuse the primitives in `components/ui/` (Base UI / shadcn **base-nova**), `lib/utils.ts#cn`, and `lucide-react` icons. The UI is **Persian / RTL** (Vazirmatn font via the root layout; RTL via `components/Providers.tsx`) — write copy in Persian and set `dir="ltr"` on phone/email/code inputs.

**Numbers:** always render numbers shown to users with [`lib/format.ts`](lib/format.ts)`#toPersianDigits` (Persian digits), and normalize digits a user types back to Latin with `toLatinDigits`. Don't print raw Latin digits in the UI.
