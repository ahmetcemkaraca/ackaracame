# Firebase backend operations

Unless a section says otherwise, commands below are written for the repository
root; Functions package scripts therefore use `--prefix functions`.

The callable functions and client write rules require a verified Firebase user
whose ID token contains the custom claim `admin: true`, records a completed TOTP
second factor for the current sign-in, **and** exactly matches the configured
`ACKARACA_ADMIN_EMAIL`. Firestore and Storage Rules additionally require the
token UID/e-mail to match the Admin-SDK-owned
`systemPolicies/owner-access` binding. There is deliberately no web endpoint
that can grant or edit this privilege. A stale or accidentally copied admin
claim on another account therefore remains denied.

## Runtime and production prerequisites

- Deploy with the Node.js 22 runtime.
- Enable App Check for the web app and Cloud Functions. Configure a debug token
  only for local development; never ship it in the production bundle.
- Replay-protected callables use limited-use App Check tokens. Grant the
  **Firebase App Check Token Verifier** IAM role to the 2nd-gen Functions default
  compute service account, and keep `{ limitedUseAppCheckTokens: true }` on every
  matching web callable. Follow Firebase's
  [Cloud Functions App Check guide](https://firebase.google.com/docs/app-check/cloud-functions)
  when changing the runtime identity.
- Upgrade Firebase Authentication with Identity Platform. The sole-user
  creation gate and TOTP MFA both depend on Identity Platform.
- Set the non-secret Functions parameter `ACKARACA_STORAGE_BUCKET` to the exact
  Firebase Storage bucket name when the deployment prompt asks for it.
- Set `ACKARACA_ADMIN_EMAIL` to the owner's exact normalized email address. An
  empty or malformed value makes account creation and sign-in fail closed.
- The Application Default Credentials used by a manual deploy and the GitHub
  WIF deploy service account both run the owner preflight. Grant the least
  privileged `roles/firebaseauth.viewer` role (it supplies
  `firebaseauth.users.get`) plus the already-required scoped Firestore read of
  `systemPolicies/owner-access`; normal media/rebuild operations retain their
  separately documented Firestore writes. Do not replace these with a broad
  Firebase Admin/basic Owner role. See Firebase's
  [Authentication role table](https://firebase.google.com/docs/projects/iam/roles-predefined-product#firebase_authentication_roles).
- Create `RATE_LIMIT_SALT` as a Functions secret with at least 32 random
  characters and grant the Functions runtime access to it.
- Cloud Storage Rules read the default Firestore database for owner and active
  publication manifests. Enable that cross-service connection and verify that
  `service-<PROJECT_NUMBER>@gcp-sa-firebasestorage.iam.gserviceaccount.com` has
  the **Firebase Rules Firestore Service Agent** role. Without it, those Storage
  evaluations fail closed. These reads consume Firestore quota/billing and only
  the default database is supported. See Firebase's
  [cross-service Rules permission guide](https://firebase.google.com/docs/rules/manage-deploy#manage_permissions_for_cross-service_cloud_storage_security_rules).
- Routine releases deploy Functions, Firestore rules/indexes, Storage rules,
  and Hosting from one validated snapshot. The one-time legacy bootstrap uses
  the stricter Hosting-first sequence documented below.

The production wrapper validates these four non-secret parameters against the
web project/bucket, writes a temporary mode-`0600`
`functions/.env.<firebase-project-id>` for Firebase CLI parameter resolution,
and removes only the file it created. If an operator-owned file already exists,
it must be a regular private file containing the exact same values; the wrapper
never overwrites it.
It resolves only the exact lockfile-bound root `firebase-tools` package; neither
the wrapper nor legacy retirement accepts a CLI path override. Run
`npm run audit:policy` after both `npm ci` commands. Runtime dependency trees
must be clean; the exact time-bounded deploy-tool advisory exception is recorded
in `scripts/dependency-audit-policy.json` and fails on any drift.

Example secret setup:

Run `firebase functions:secrets:set RATE_LIMIT_SALT` and enter a cryptographically
random value of at least 32 characters when prompted.

## One-time migration from the legacy production surface

The original repository deployed `adminLoginGuard` and an insecure HTTP
`seedContent` export in the default `us-central1` region. The rebuilt seed
surface is a different callable trigger in `europe-west1`; Firebase does not
support changing a deployed trigger type in place. Before the first rebuilt
production deploy, use authenticated Firebase CLI credentials to retire only
those two exact legacy exports:

```sh
FIREBASE_PROJECT_ID='firebase-project-id' \
CONFIRM_LEGACY_FUNCTION_MIGRATION='retire:adminLoginGuard,seedContent:firebase-project-id' \
npm run legacy:retire --prefix functions
```

The command scopes both inventory and deletion to the explicit project ID,
obtains a read-only `functions:list --json` inventory, selects only
`adminLoginGuard` and `seedContent` in `us-central1`, and then deletes that
resolved set. It also rejects a conflicting project field if the CLI supplies
one. It is idempotent and
will never target the rebuilt `europe-west1` callable. Do not replace this with
a broad `firebase deploy --force`; unknown production Functions must never be
implicitly deleted. This follows Firebase's documented
[trigger-type migration procedure](https://firebase.google.com/docs/functions/manage-functions#modify).

The old seed function may also have overwritten new document IDs with its
incompatible schema. Do **not** migrate Firestore before the rebuilt triggers and
private-backup rules exist. Before deploying the new blocking Functions, first
complete sole-administrator steps 1–2 below: enable Identity Platform +
email/password, create the exact normalized owner account, and verify its email.
The wrapper's bootstrap owner preflight refuses to continue without that account.
Then install both locked dependency trees, verify the dependency policy and
bundled public fallback, and create its immutable revision-0 deployment plan:

```sh
npm ci
npm ci --prefix functions
npm run audit:policy
node scripts/verify-public-content.mjs

FIREBASE_PROJECT_ID='firebase-project-id' \
npm run bootstrap:plan
```

Review the printed bundle counts, bytes, and SHA-256. With the complete
production environment documented below, deploy that exact fallback without a
Firestore export. Both confirmations are required, and bootstrap mode is fenced
to revision `0` before the server queue has started:

```sh
FIREBASE_PROJECT_ID='firebase-project-id' \
ACKARACA_STORAGE_BUCKET='firebase-project-id.firebasestorage.app' \
ACKARACA_CONTENT_REVISION='0' \
ACKARACA_BOOTSTRAP_FROM_BUNDLED_CONTENT='true' \
CONFIRM_BUNDLED_BOOTSTRAP='bootstrap-bundled:firebase-project-id:<sha256-from-plan>' \
CONFIRM_PRODUCTION_DEPLOY='deploy:firebase-project-id' \
npm run deploy:production
```

The wrapper temporarily installs only the validated public fallback in
`generated-content.json`, prepares the union media manifest, and deploys the
Firestore-independent static Hosting release **before** any restrictive backend
resource. Only after Hosting succeeds does it deploy Firestore rules/indexes,
Storage Rules, and Functions. It finalizes media only after both phases and then
restores the checkout's prior file with hash-fenced atomic writes. The bundle is
also rejected if it references Firebase Storage media. Thus a partial first
release can leave the new static site with bounded backend degradation, but can
never leave the old Firestore-dependent SPA behind the new deny-by-default
rules.

Once revision `0` is verified live, stop and complete sole-administrator steps
4–7 below: enable TOTP, enroll it at `/studio/setup`, grant the claim/owner
policy, sign in again, and verify `/studio`. Run the normal owner preflight before
allowing migration writes to enqueue revision `>0`:

```sh
FIREBASE_PROJECT_ID='firebase-project-id' \
ACKARACA_ADMIN_EMAIL='owner@example.com' \
ACKARACA_OWNER_PREFLIGHT_MODE='normal' \
npm run owner:verify --prefix functions
```

Only then inspect the controlled canonical Firestore bootstrap. The migration
defaults to dry-run:

```sh
FIREBASE_PROJECT_ID='firebase-project-id' \
npm run legacy:migrate-content --prefix functions
```

The command performs direct reads of only the canonical bundle's exact paths:
`siteSettings/main`, its eight `projects/{slug}` documents, and its two
`journal/{slug}` documents. It never runs a collection query or visits unrelated
legacy auto-ID documents. Each target is classified as `absent`,
`already-valid-v2`, `recognized-legacy`, or `unexpected`. Missing canonical
documents are planned as create-only, valid-v2 documents are preserved, the
three known legacy collisions (`siteSettings/main`, `draw-or-die`, and
`hocapuanla`) receive the reviewed canonical replacement, and any other invalid
existing shape blocks the entire apply.
The replacement comes from the checked-in `functions/data/canonical-content.json`
artifact, which is schema-validated, byte-for-byte pinned to a reviewed SHA-256,
and required by the root build to exactly match the bundled public fallback used
by the site. Any unreviewed byte drift stops Functions seed and migration loading;
the migration never imports or inherits `generated-content.json`. The exact old
seed fixture is independently parsed by the shared Functions validator only
before either colliding project is recognized; it is never the recovery payload.

Dry-run writes a mode-`0600`, gitignored canonical plan under
`.legacy-migration/`. The writer rejects symlinked directories/files, hard links,
non-regular files, path escape, and paths owned by another local user. Its SHA-256
summary binds the project-independent source data, Firestore read versions, every
exact canonical path, replacement payloads, and replacement source. The private
plan contains a bounded, human-readable
`sourceData` / `replacementData` pair for every exact target; Firestore
timestamps include an explicit type, ISO value, seconds, and nanoseconds.
Values above the fixed review budget are represented by size and hash (and
cannot be a recognized legacy mutation). No document values are printed to the
console. Inspect every pair, then copy both exact confirmation tokens into a
second invocation:

```sh
FIREBASE_PROJECT_ID='firebase-project-id' \
CONFIRM_LEGACY_CONTENT_MIGRATION='replace:firebase-project-id:<sha256>:<exact-comma-separated-path-list-from-dry-run>' \
CONFIRM_LEGACY_CONTENT_REVIEWED='reviewed:firebase-project-id:<sha256>' \
npm run legacy:migrate-content --prefix functions -- --apply
```

The second token acknowledges review of the private source-versus-replacement
data, not merely the shape label or hash. Apply re-reads all eleven exact paths in one
Firestore transaction and refuses a stale
hash, changed read version, unknown field, malformed legacy edit, or pre-existing
backup identity. Before overwriting any recognized legacy target, the same
transaction creates the private durable backup
`migrationBackups/canonical-content-bootstrap-v2-<sha256>` with one source
document per exact canonical path, including an explicit absent record before a
create. Client rules explicitly deny the manifest and its subcollection. The
transaction creates only missing canonical documents, overwrites only reviewed
recognized legacy collisions, preserves an old valid `createdAt` when present,
writes v2 server timestamps, and then verifies the committed documents with the
root Zod schemas. Application Default
Credentials or `FIREBASE_SERVICE_ACCOUNT_JSON` /
`FIREBASE_SERVICE_ACCOUNT_PATH` are accepted; a service-account/project mismatch
fails closed. Because rebuilt Firestore triggers are now live, the committed
create/replace writes enter the durable outbox and coalesce into a normal
server-issued revision greater than zero. Let that rebuild complete (or use the
documented manual recovery callable); never repeat bundled bootstrap mode after
the queue starts.

After the new deny-by-default Firestore rules are live, review and then remove
the exact legacy `adminLoginSecurity/default` document: the retired function may
have stored raw IP/user-agent data there, and the rebuilt authentication path
does not use it. This data deletion is intentionally not bundled into the
Functions command so an operator must make that retention decision explicitly.

## Bootstrap the sole administrator safely

The order matters because `restrictUserCreation` and `restrictUserSignIn` are
Identity Platform blocking functions. They reject every new account and every
existing-user sign-in except the exact configured owner email; an empty or
invalid configuration rejects all creation and sign-in attempts.

1. Upgrade Firebase Authentication with Identity Platform and enable a
   first-factor provider that supports MFA (for this site, email/password).
   Keep anonymous auth and every unused federated provider disabled. Firebase
   documents that anonymous and custom authentication do not invoke blocking
   functions; this repository intentionally exposes no custom-token issuer.
2. Before deploying the blocking functions, create the single owner account in
   the Firebase console and verify its email. Record its UID. Review and disable
   any legacy non-owner Auth users; the sign-in gate will deny them regardless.
   Do not enable any public sign-up UI.
3. Put the same exact normalized owner address in
   `functions/.env.<firebase-project-id>` as `ACKARACA_ADMIN_EMAIL`, then deploy
   Functions. Confirm that a throwaway address cannot create an account or sign
   in, while the owner can reach `/studio/setup`. This initial setup sign-in is
   allowed by exact email and does not require the admin claim yet.
4. Enable the project-level TOTP provider with the command below. It is
   deliberately locked to an explicit project ID and confirmation phrase.

```sh
FIREBASE_PROJECT_ID='firebase-project-id' \
CONFIRM_TOTP_ENABLE='enable-totp:firebase-project-id' \
npm run auth:enable-totp --prefix functions
```

5. The command preserves existing MFA factor/provider configuration, enables the
   project-level MFA state, and enables TOTP with one adjacent 30-second
   interval. It uses
   Application Default Credentials or
   `FIREBASE_SERVICE_ACCOUNT_JSON` / `FIREBASE_SERVICE_ACCOUNT_PATH`, rejects a
   service-account/project mismatch, and does nothing unless run with the exact
   confirmation. After it succeeds, sign in as the verified owner at
   `/studio/setup` and enroll the TOTP factor.

6. Only after enrollment, grant the admin claim with the exact same owner email
   and the recorded UID:

   Use Application Default Credentials or one of
   `FIREBASE_SERVICE_ACCOUNT_JSON` / `FIREBASE_SERVICE_ACCOUNT_PATH`. The script
   checks the UID, exact email, verified-email state, an enrolled TOTP factor,
   and an explicit confirmation before granting access. It also revokes existing
   sessions so the next sign-in receives a fresh ID token. Enroll TOTP before
   running it.

   Keep this one-time setup identity separate from the read-only deploy
   preflight identity. TOTP configuration and claim mutation require
   `roles/firebaseauth.admin` (including `firebaseauth.configs.update` and
   `firebaseauth.users.update`) plus the exact Firestore write needed for
   `systemPolicies/owner-access`. Remove those elevated setup permissions after
   verification; routine deploys need only `roles/firebaseauth.viewer` for Auth.

```sh
FIREBASE_PROJECT_ID='firebase-project-id' \
FIREBASE_ADMIN_UID='firebase-uid' \
FIREBASE_ADMIN_EMAIL='owner@example.com' \
ACKARACA_ADMIN_EMAIL='owner@example.com' \
CONFIRM_ADMIN_CLAIM='grant:firebase-uid' \
npm run admin:claim --prefix functions -- grant
```

The claim command also rejects a service-account/project mismatch and refuses to
grant access to a disabled user. `FIREBASE_ADMIN_EMAIL` must be the same owner
address configured in `ACKARACA_ADMIN_EMAIL`. Grant first adds the claim, then
atomically replaces the Admin-SDK-only `systemPolicies/owner-access` document
with its exact UID/lowercase-email binding, and finally revokes existing sessions.
Until the policy write succeeds the new claim is unusable; a matching revoke
deletes the binding first so interruption fails closed. Clients cannot read,
write, or delete the policy document. Grant requires both email values so an
operator cannot accidentally claim a differently configured account. Recovery
revocation deliberately needs only the target `FIREBASE_ADMIN_EMAIL` (plus the
project, UID, and exact `revoke:<uid>` confirmation), so a wrongly claimed
non-owner can still be stripped after the configured owner value changes:

```sh
FIREBASE_PROJECT_ID='firebase-project-id' \
FIREBASE_ADMIN_UID='firebase-uid' \
FIREBASE_ADMIN_EMAIL='wrongly-claimed@example.com' \
CONFIRM_ADMIN_CLAIM='revoke:firebase-uid' \
npm run admin:claim --prefix functions -- revoke
```

7. Sign out and sign back in with the password and TOTP. Verify `/studio` access
   and run `ACKARACA_OWNER_PREFLIGHT_MODE=normal npm run owner:verify --prefix
   functions` before deleting any temporary bootstrap credentials.

Do not delete or rename either deployed blocking function without also
unregistering its Identity Platform trigger; an orphaned trigger can prevent
authentication.
See Firebase's current
[auth blocking trigger documentation](https://firebase.google.com/docs/functions/auth-blocking-events)
before changing this boundary.

To revoke access, use `revoke` in both places. Do not commit credentials, UID,
email, App Check debug tokens, or secret values.

## Seed complete fallback content safely

The deployed `seedContent` callable and local CLI read the same checked-in,
bounded `functions/data/canonical-content.json` artifact. Root build verification
parses it with the domain schema and requires exact equality with the bundled
fallback. It currently contains site settings, eight projects, and two journal
entries. Both seed surfaces are create-only: existing documents are preserved
even when fallback content changes. The old `content-seeds.json` file is retained
only as a legacy-collision recognition fixture and is never a seed payload. The
production CLI also requires an explicit acknowledgement:

```sh
FIREBASE_PROJECT_ID='firebase-project-id' \
CONFIRM_CREATE_ONLY_SEED='ACKARACA_CREATE_ONLY' \
npm run seed:content --prefix functions
```

Prefer the callable from the authenticated admin panel. The CLI is intended for
controlled recovery using local Admin SDK credentials. It requires an explicit
project ID and rejects a service-account/project mismatch. Run
`npm run content:sync-functions` after an intentional fallback edit; CI/build
fails until the checked-in Functions artifact is schema-valid and exactly equal.

## Publish media safely

Browser uploads are staging-only under `admin-media/{uid}/{uuid.ext}` and cannot
be read anonymously. The browser requests `private,max-age=0,no-store` caching
and never creates a tokenized download URL; cache control itself is not exposed
to Storage Rules, so privacy is enforced by authentication, the owner-scoped
immutable path, and the absence of download tokens. After the editor has a
stable project or journal slug, call
`promoteMedia` with `{ stagingPath, entity: 'project' | 'journal', slug }`. The
callable verifies ownership, MIME metadata, size, extension, and file signature;
then it copies that exact object generation to an immutable scoped path and
returns:

```json
{
  "ok": true,
  "url": "https://firebasestorage.googleapis.com/v0/b/.../o/...?alt=media",
  "storagePath": "media/projects/example/uuid.webp",
  "contentType": "image/webp",
  "size": 123456,
  "promotedNow": true,
  "deletionCapability": "43-character-one-time-session-secret"
}
```

The returned token-free URL becomes anonymously readable only when its filename
appears in the server-owned **active deployment** document at
`mediaPublications/{entity--slug}`. Live Firestore status is deliberately not an
authorization input: the public HTML is a static snapshot, so a draft/archive
save or a failed rebuild must not cut media from the still-deployed site. No
content-write trigger narrows this manifest. A promoted-but-unsaved object stays
private even when its slug belongs to a currently deployed page. Clients cannot
read or write deployment manifests. The client promotion wrapper is
`promoteAdminImage(stagingPath, entity, slug)`.

Before either prepare or finalize can claim the publication lease, the
publisher performs bounded-concurrency metadata HEAD requests for every unique
desired public media path. Missing objects or drift in path/entity/slug,
uploader/staging source, MIME/extension, size, source generation, or current
generation aborts the release before any manifest mutation. The sorted verified
path/generation/metadata set is hashed into the deployment snapshot identity, so
prepare and finalize must observe the exact same object generations. After the
publication state and shared media-mutation leases are claimed, each phase HEADs
the complete desired set a second time and requires the exact same bound hash
before its first manifest write. A missing/replaced object or metadata drift in
that pre-claim/claimed gap therefore fails the phase while manifests are still
untouched; every later manifest transaction also verifies both live lease
owners. The same validator protects idempotent `promoteMedia` destination reads;
a pre-existing path with partial or drifted metadata is never returned as a
successful image.

`deletePromotedMedia` accepts exact
`{ storagePath, entity, slug, deletionCapability }`, consumes a
limited-use App Check token, requires the TOTP owner, verifies server-written
ownership/MIME/generation metadata, the hash and two-hour lifetime of the
unrecoverable session capability, and uses a generation precondition. A
capability is returned only by the request that physically creates the promoted
object; idempotent promotion reads never recover it. The callable checks both
the active deployment and every saved draft/published/archived content
reference while holding the shared media-mutation lease. Consequently, only an
object promoted during the current unsaved editor session can be physically
removed. Every attempted physical delete is first journaled durably by exact
Storage path and generation. Browser rules deny create/update/delete on every
promoted and site-media path, including for the administrator. Missing objects
are idempotent success; ownership, capability, reference, manifest, or
generation ambiguity fails closed.

`collectOrphanedMedia` runs daily at 03:17 Europe/Berlin. It removes staging
objects older than 48 hours and promoted objects older than 30 days only when
all of the following remain true immediately before a generation-preconditioned
delete: the object has valid server promotion metadata, no active deployment
manifest contains it, and no draft/published/archived Firestore content record
references it. Invalid manifests, malformed references, inspection errors, and
deployment overlap all preserve the object. The final content/publication scan
and physical delete run under the same server-owned mutation lease used by the
publisher, while client content saves are rules-fenced. Per-prefix lexicographic
cursors are checkpointed every 25 inspected objects and at page boundaries, so
a hard-killed run resumes without repeatedly starving later objects. Each
generation delete is journaled before Storage is mutated; bounded result
counters are separately audited.

Direct browser reads of `projects`, `journal`, and `siteSettings` are denied even
for published documents. The public site receives those collections only through
the validated build-time snapshot below; the narrowly projected pafta callable
is the sole runtime public content lookup.

Public contact submissions use `submitInquiry`. Its Firestore transaction reads
`siteSettings/main` before consuming any IP/email/global rate-limit counters or
creating the inquiry. Only the exact `open-to-inquiries` and `limited` values
permit intake; `unavailable`, a missing settings document/field, or any malformed
value rejects fail-closed with `failed-precondition`. A concurrent availability
change retries the transaction, so closing inquiries cannot consume a quota
slot or leave a new record behind.

## Resolve legacy physical-board QR links

`getPublishedPafta` is the only public data path for `/pafta/{code}`. Direct
client reads and queries against `paftas` remain denied. The callable requires
App Check, consumes the token, and allows at most 30 lookups per IP in each
10-minute window. Input must match the historical generator exactly:

```json
{ "code": "pafta-1700000000000-a1b2c3d4e" }
```

The function queries only `status == 'published'` plus the exact `qrCodeData`,
with a one-document limit. Missing, unpublished, or corrupt documents all return
`{ "ok": true, "pafta": null }`. A successful `pafta` contains only sanitized
`title`, optional `description`/`semester`/`year`/`course`/`professor`, bounded
`technologies`, and CSP-compatible Firebase/Google/self image URLs. Internal IDs,
the QR code, project links, AI prompts, blocks, and unknown fields are never
projected. Deploy the `paftas(status, qrCodeData)` composite index with the
function.

## Verify Security Rules

Run `npm run test:rules` from the repository root. Firebase emulators require a
Java runtime on `PATH`; the suite covers the snapshot-only public Firestore
boundary, exact owner UID/e-mail + MFA integrity, client denial of the owner
policy, function-owned collections, staging upload constraints, legacy-media
quarantine, and active-deployment media manifests. The matrix proves that a
valid-looking wrong admin claim is denied and that referenced old-site media
survives live draft/delete changes while promoted-but-unsaved and
finalized-retired files stay private. Emulator coverage does not prove the
production cross-service IAM grant; verify that role and an owner/wrong-admin
Storage smoke test after the first backend phase.

## Durable static-site rebuild outbox

Writes that can change the public snapshot no longer depend on the browser
calling a second endpoint. Retrying Firestore triggers enqueue project/journal
writes whose before or after state is published, plus every `siteSettings/main`
write. The hashed Firestore event ID identifies a private `rebuildOutbox`
document and deterministic rebuild request ID. Creating that document and
incrementing `systemOperations/site-rebuild.requestedRevision` happen in one
transaction. Redelivery therefore resumes the same revision; it cannot allocate
a duplicate. Concurrent events retain the queue's monotonic revisions and path
coalescing. A failed hook remains enqueued and the trigger retry reclaims an
expired dispatcher lease.

HTTP delivery and its Firestore acknowledgement cannot be made one atomic
exactly-once operation. An ambiguous retry therefore sends the same deterministic
request ID and revision. The production workflow must run the server-side build
claim before any build/deploy command:

```sh
REBUILD_EXECUTION_ID="github-${GITHUB_RUN_ID}" \
CONFIRM_REBUILD_EXECUTION="claim:${ACKARACA_CONTENT_REVISION}:${FIREBASE_PROJECT_ID}" \
npm run rebuild:claim --prefix functions
```

The script emits `should_run` and `claim_outcome` through `GITHUB_OUTPUT`.
Only `should_run=true` may execute `npm run deploy:production`. The claim is
bound to the exact server-accepted revision/request tuple, has a 40-minute
recovery lease, skips stale or already-active revisions, and fences concurrent
duplicate GitHub runs. Keep `REBUILD_EXECUTION_ID` in the deploy environment so
`report-rebuild-result.mjs` atomically closes the claim as `active` or `failed`.
The deploy wrapper reports its own stage-specific failure (`build`, media
prepare, Firebase deploy, or media finalize) and writes the workflow
`result_reported=true` marker only after that report succeeds. The workflow's
ordinary `github-workflow-failed` fallback runs only when the marker is absent;
an exact duplicate failure report preserves the first, more specific failure
code. Runner cancellation or a platform hard timeout cannot guarantee a final
shell step. Such an interrupted claim remains fenced until its 40-minute lease
expires, after which a new execution owner can recover it; using the same stable
`github-${GITHUB_RUN_ID}` owner also permits an immediate rerun recovery.
The media prepare authorization remains an independent final fence. Generic
webhook receivers must implement equivalent idempotency using the deterministic
request ID and revision.

Automatic events only update a server-owned dispatch signal and return; a
single-instance signal worker waits for a ten-second quiet window before it
drains the latest queue revision. Large seed/batch write bursts therefore
produce one trailing deployment even when per-document trigger deliveries are
backlogged. Earlier outbox events are acknowledged with the coalesced accepted
revision. A new GitHub run ID cannot enter an active execution lease, while a
GitHub rerun keeps the same `github-${GITHUB_RUN_ID}` owner and may immediately
renew/recover its prior attempt.

Live `enqueued` outbox records have no TTL. Terminal outbox (`hook-accepted`)
records receive a 90-day `expiresAt`. A running execution claim also receives a
conservative 90-day TTL—far beyond its 40-minute recovery lease—so an overtaken
claim cannot become permanent operational debris; terminal `active`/`failed`
reports refresh that TTL. Firestore TTL is enabled for both collections. A
theoretical event redelivery after its terminal outbox record has already been
TTL-deleted can allocate a new revision and therefore schedule a conservative
redundant deployment. It cannot reuse or corrupt an earlier revision, but this
is the explicit bounded-retention tradeoff.

## Queue a manual static-site rebuild without exposing deploy credentials

`requestSiteRebuild` remains a TOTP-admin/App-Check callable for explicit manual
or recovery requests; normal editor saves use the durable outbox. It never
returns or accepts a deploy token. Manual and automatic requests drain through
the same fenced dispatcher, accepted revision/request tuple, bounded retry path,
audit projection, and terminal outbox acknowledgement. Configure the full HTTPS target and bearer credential as
Functions secrets and separately select/allowlist the provider:

```sh
firebase functions:secrets:set SITE_REBUILD_WEBHOOK_URL
firebase functions:secrets:set SITE_REBUILD_WEBHOOK_TOKEN
# Put this non-secret parameter in functions/.env.<project-id> or answer the
# Firebase CLI deploy prompt.
SITE_REBUILD_WEBHOOK_HOST='build-provider.example'
SITE_REBUILD_PROVIDER='generic'
```

For the repository's GitHub Actions path use
`SITE_REBUILD_PROVIDER='github'`, host `api.github.com`, and the exact URL
`https://api.github.com/repos/{owner}/{repo}/dispatches`. The fine-grained token
must be able to create repository dispatches for only this repository. GitHub
receives `event_type: "site-rebuild"` and the canonical payload under
`client_payload`; generic providers receive `event: "site.rebuild.requested"`
plus the same top-level payload. Both modes use `Authorization: Bearer ...`.
The production workflow intentionally has no free-form manual revision input.
For every non-zero deploy, the runner revalidates both the revision and the
server-issued request ID against the accepted Firestore queue before media
preparation; a forged or future revision therefore cannot poison the monotonic
publication fence. Bootstrap revision `0` is accepted only before that queue has
ever started and must be run from the controlled operator command below.

The callable accepts:

```json
{
  "reason": "content-published",
  "paths": ["projects/example-project"]
}
```

Allowed reasons are `content-published`, `content-updated`, `settings-updated`,
and `manual`. Content-driven requests require canonical `projects/{slug}`,
`journal/{slug}`, or `siteSettings/main` paths. Dispatch uses an exact-host HTTPS
allowlist, refuses redirects, times out after 15 seconds, consumes the App Check
token, and assigns every request a monotonic `revision`. A server-owned queue at
`systemOperations/site-rebuild` coalesces paths arriving during an active
dispatch; the current dispatcher automatically sends the trailing revision
after the in-flight webhook returns. Every coalesced callable waits for its own
revision to be accepted; if the active dispatcher fails or its lease expires, a
waiting caller atomically takes ownership. Dispatch has three bounded automatic
attempts and preserves all failed paths. A call reports success only as
`{ status: "hook-accepted", revision, acceptedRevision, coalesced }`; it never
labels webhook acceptance as a completed deployment.

The Studio polls the TOTP/App-Check `getSiteRebuildStatus` callable. This joins
the hook-accepted revision, the deploy wrapper's explicit failure result, and
`media-publication.activeContentRevision`. Only the last value produces the
green “live deployment verified” state. Hook failure, build/prepare/deploy/
finalize failure, and a 15-minute confirmation timeout remain visible with a
retry action.

The no-input `getLatestSiteRebuildStatus` callable exposes the same bounded
admin-only projection for dashboard monitoring. Before the queue exists it
returns `targetRevision: 0` and `state: "idle"`; afterward it targets the latest
requested revision, including the automatic outbox's `queueStatus: "queued"`
during its quiet window. It never returns request IDs, credentials, raw queue
documents, or unbounded failure text.

The webhook body contains the same `revision`. The build provider must serialize
jobs for this site, reject/cancel stale revisions, and pass the accepted value as
`ACKARACA_CONTENT_REVISION` to the production deploy command. This is a fencing
token: an older job cannot prepare or finalize media after a newer content
revision.

### Required build-time Firestore export contract

A deploy hook alone does **not** refresh static SEO. Every normal revision
greater than zero must replace the bundled fallback with a validated Firestore
snapshot before prerendering. The sole exception is the explicitly confirmed
revision-0 bundled bootstrap described above, which exists so invalid legacy
Firestore cannot block installation of the rebuilt rules/functions. The
repository build script runs the normal export first when explicitly enabled:

```sh
ACKARACA_EXPORT_FIRESTORE=true \
CONFIRM_CONTENT_EXPORT=ACKARACA_PUBLIC_CONTENT \
npm run build
```

The export step must:

1. Install both locked dependency trees (`npm ci` and
   `npm ci --prefix functions`) in the build environment.
2. Resolve `FIREBASE_PROJECT_ID` and authenticate with
   `FIREBASE_SERVICE_ACCOUNT_JSON`, `FIREBASE_SERVICE_ACCOUNT_PATH`, or
   Application Default Credentials. Credentials stay in the build provider's
   secret store and must never be written to the artifact or logs.
3. Read `projects` where `status == 'published'`, `journal` where
   `status == 'published'`, and exactly `siteSettings/main`.
4. Strip Firestore-owned timestamp fields, validate every record with the same
   root domain parsers used by the application, and fail the build on any invalid
   or duplicate slug. Never silently reuse a previous generated snapshot.
5. Sort projects by `order` then slug and journal entries by publication date
   then slug, serialize with stable key ordering, and atomically write the agreed
   generated snapshot used by this repository:
   `src/data/generated-content.json`.
6. Make `entry-server`, static path discovery, sitemap generation, and the client
   bootstrap consume that same snapshot for the entire build. A build that still
   imports only `src/data/portfolio.ts` must not report the rebuild as SEO-fresh.

### Atomic Hosting and media deployment

The hook target must run the repository's two-phase deploy wrapper, not a bare
`firebase deploy`. `prepare` validates the generated snapshot and activates the
union of old and new filenames. Only after Firebase reports a successful Hosting
deploy does `finalize` narrow manifests to the exact new snapshot. If build or
deploy fails, old files remain active. A monotonic content revision, an internal
deployment revision, and a single prepared-release fence reject overlapping,
stale, or conflicting activation. An expired/failed attempt may restart only
the identical snapshot and content revision under a fresh deployment ID;
successful or mutated duplicate revisions remain fenced.

For the initial deployment use the exact planned bundled revision `0`;
subsequent runs must disable bootstrap mode and use the revision received in the
rebuild webhook:

Export every production web value from the root `.env.example` and every
non-secret Functions parameter from `functions/.env.example` before invoking
the wrapper. Production validation rejects missing, placeholder, cross-project,
or cross-bucket configuration before a build can begin.

```sh
FIREBASE_PROJECT_ID='firebase-project-id' \
ACKARACA_STORAGE_BUCKET='firebase-project-id.firebasestorage.app' \
ACKARACA_CONTENT_REVISION='0' \
ACKARACA_BOOTSTRAP_FROM_BUNDLED_CONTENT='true' \
CONFIRM_BUNDLED_BOOTSTRAP='bootstrap-bundled:firebase-project-id:<sha256-from-bootstrap-plan>' \
CONFIRM_PRODUCTION_DEPLOY='deploy:firebase-project-id' \
npm run deploy:production
```

In normal mode the wrapper exports and validates Firestore content. In the
one-time bootstrap mode it atomically installs the planned validated fallback
for the build and restores the prior generated file afterward. Both modes
prepare union manifests. Normal releases deploy the full target set; bootstrap
deploys static Hosting first and Firestore rules/indexes, Storage Rules, and
Functions second. Only a fully successful resource sequence can finalize exact
manifests. Separate Hosting/backend failure codes preserve the recovery point.
The wrapper records each stage failure and the verified
active result in `systemOperations/site-rebuild`, using the same deployment ID
and content revision consumed by Studio status polling. It requires an
authenticated Firebase CLI plus Application Default Credentials or the
documented service-account variables.
When a claimed GitHub workflow is running, a successfully persisted
stage-specific failure also writes `result_reported=true` to `GITHUB_OUTPUT`;
the workflow fallback reports only when that marker is missing. This avoids
downgrading a useful failure code to a generic one. Cancellation and hard runner
timeouts remain inherently unable to guarantee terminal reporting, so the
40-minute execution lease is the recovery boundary.
If Hosting succeeds but finalization fails, the union remains safe and the log
prints the deployment ID for an exact finalize retry. If deploy is not confirmed,
the state is marked aborted without narrowing old files.

Operators may run the phases manually with the fixed snapshot and the same
`MEDIA_DEPLOYMENT_ID`, project, bucket, and content revision:

```sh
CONFIRM_MEDIA_PUBLICATION='prepare:deployment-id:firebase-project-id' \
npm run media:publication --prefix functions -- prepare

# Deploy the exact dist/ produced from that same generated-content.json.

CONFIRM_MEDIA_PUBLICATION='finalize:deployment-id:all-resources-deployed:firebase-project-id' \
npm run media:publication --prefix functions -- finalize
```

Do not finalize unless every intended Firebase resource phase is confirmed.
Use the `abort` action with
`abort:deployment-id:release-not-fully-deployed:firebase-project-id`; it leaves
the union manifest intact. A bootstrap backend failure intentionally leaves the
already-safe static Hosting release live, records failure, and is retried with
the same revision/snapshot under a fresh deployment ID. The export identity may
be read-only, but the deploy
identity additionally needs narrowly scoped writes to `mediaPublications` and
`systemOperations/media-publication` plus deployment-result writes to
`systemOperations/site-rebuild`. The scheduled Functions identity also owns
`systemOperations/media-gc` and orphan deletion. None of these credentials or
operational documents reaches the browser or callable response.
