---
name: security-review
description: Load for any PR or task touching authentication, authorization, roles, user input, file or URL submissions, Forge content, leaderboard/profile data, secrets, or API exposure in Code212 Quest. Trace the full trust boundary and report concrete risks before merge.
---

# Security Review

Read [DECISIONS-FOR-SKILLS.md](../DECISIONS-FOR-SKILLS.md). Review the changed flow end to end: route → middleware → policy/FormRequest → service/model → resource/response → frontend rendering. A hidden button or TypeScript type is not a security control.

## 1. Authorization, IDOR, and field exposure

- Require authentication on private API routes and an explicit policy/role check for each protected resource and action. Check ownership and role for the specific record, not only that the caller is logged in.
- Test unauthenticated, wrong-role, cross-user, and allowed-user cases. Do not rely on an ID being hard to guess.
- Return only fields required by the caller. Review Resources and nested relations for email, matricule, role, internal notes, moderation data, token values, or other private fields.
- Use validated, allowlisted input. The current `User::$fillable` includes `roles`, `xp_total`, and `germes_balance`; never mass-assign request data to `User`. Privileged and balance changes belong to trusted domain services with audit/invariant checks.

Wrong:

```php
$submission = Submission::findOrFail($id);
return ApiResponse::resource(new SubmissionResource($submission));
```

Right:

```php
$submission = Submission::findOrFail($id);
$this->authorize('view', $submission);

return ApiResponse::resource(new SubmissionResource($submission));
```

Use the actual policy and resource for the action; the example is not a substitute for checking ownership and fields.

## 2. Authentication and session handling

- The approved target is Sanctum cookie/session authentication for the first-party React SPA. Before enabling it, verify the web/API domain relationship and configure Sanctum stateful domains, session cookie attributes, CSRF, and credentialed CORS for that deployment. Do not combine cookie and Bearer modes accidentally.
- The current app still returns a Sanctum Bearer token and stores it in `sessionStorage`; logout currently clears browser storage without calling the API's token-revocation route. Treat these as gaps to resolve during the auth migration. Do not move tokens to `localStorage`.
- With native `fetch`, ensure the cookie flow obtains the CSRF cookie and sends credentials and the corresponding CSRF header for state-changing requests. Test login, session restore, logout/revocation, CSRF rejection, and expiry.
- Never log passwords, access/refresh tokens, authorization headers, full OIDC responses, or raw login secrets.

## 3. Treat OIDC as a protocol, not a code exchange

Before enabling UCA SSO, require an authorization-code flow with:

- A server-generated, high-entropy `state` bound to the initiating browser session and verified once at callback.
- PKCE with `S256`; a nonce and ID-token validation when using OpenID Connect.
- Issuer, audience, signature, expiry, nonce, redirect URI, and allowed algorithm validation against trusted provider metadata/keys.
- A fixed, trusted token/userinfo endpoint from server configuration; never accept token URLs or redirect targets from the request.
- Safe handling of provider errors, replay, account linking, and identity collisions.

**Current-code warning:** `UcaCallbackRequest` allows `state` to be absent, and `AuthController::ucaCallback()` exchanges the code and fetches userinfo without a state/PKCE/nonce or ID-token validation flow. The UI also initiates `/auth/uca`, while the API only declares the callback route. Do not describe this integration as production-ready; keep it disabled until the flow is completed and tested.

## 4. Validate untrusted content and uploads

- Validate type, size, shape, and ownership server-side with FormRequests. Reject unknown fields where practical and keep limits bounded.
- Forge titles, replies, tags, and code snippets are untrusted. React's normal text rendering escapes content; preserve that behavior. If Markdown or HTML rendering is added, use a maintained allowlist sanitizer and test script/event-handler payloads. Never pass user content to `dangerouslySetInnerHTML` unsanitized.
- No server-side file-upload path was found in the inspected app; current deliverables include URL/string fields. Before adding uploads, validate extension and server-detected MIME, enforce a size limit, generate storage names, store outside the public web root, authorize downloads, and avoid executing or serving active content inline.
- If the server fetches a submitted URL, defend against SSRF: allow only required schemes/hosts, reject private/link-local addresses, and re-check redirects and DNS results.

## 5. Rate limits, CORS, and browser protections

- Apply rate limits to login/SSO, writes, report creation, uploads, and expensive reads. Existing limiters include `api-auth` (10/min), `api` (120/min), and a registered `api-write` (30/min); confirm the intended limiter is attached to each route—do not assume registration alone applies it. Test 429 behavior.
- Allow only approved origins. Never combine wildcard origins with credentialed cookies. Keep CSRF enabled for cookie-authenticated writes.
- Verify HTTPS, secure cookie flags, and security headers (including CSP, frame restrictions, MIME sniffing protection, and referrer policy) at the app/reverse-proxy boundary. Source search did not surface an application CORS/security-header configuration; confirm the actual deployment configuration before release.

## 6. Privacy, audit, and dependencies

- The leaderboard has an opt-in gate and tests that omit email, name, and matricule. Preserve those guarantees; test both opted-in and opted-out users and anonymized aliases.
- `AuthController::login()` currently records the raw identifier on failed login. Remove or mask it; keep logs minimal, access-controlled, and retained only as long as needed.
- `AuditLogger` records IP address and user-agent. Treat these as potentially personal data: restrict access, document purpose/retention, and avoid copying them into general application logs.
- Confirm with the university's privacy/legal owner whether Morocco's Law 09-08/CNDP requirements apply and what lawful purpose, notices, consent, retention, and data-subject workflows are required. Do not claim legal compliance from a code review.
- Run dependency checks using available lockfiles: `composer audit` in `apps/api` and `npm audit` in `apps/web`. Triage findings; do not suppress a result without recording the reason and owner.
- The current CI repository-hygiene job checks tracked filenames; it is not a secret-content scanner. If a credential is committed, revoke/rotate it immediately and follow incident handling; deleting it from the latest commit is not enough.

## Per-PR checklist for auth, input, or data exposure

- [ ] Every route has appropriate authentication, role/ability middleware, and resource policy checks.
- [ ] Cross-user/IDOR cases and field-level response exposure are tested.
- [ ] Input is validated and allowlisted; mass assignment cannot modify privileged fields.
- [ ] Session, CSRF, token revocation, and CORS behavior match the approved auth mode.
- [ ] OIDC state/PKCE/nonce and token validation are complete before SSO is enabled.
- [ ] Forge content is rendered as text or safely sanitized; uploads/URLs are bounded and non-executable.
- [ ] Rate limits and 429 behavior are checked; headers and HTTPS are verified in the target deployment.
- [ ] Logs, leaderboard output, and audit metadata protect personal data and secrets.
- [ ] Relevant tests and dependency checks are reported honestly; legal assumptions are marked unconfirmed.
