# supabase

Use this skill when a task involves Supabase database changes, auth, storage, edge functions, Row Level Security (RLS), local Supabase setup, or debugging integration issues in an app that uses Supabase.

This repository already appears to follow a structured Supabase layout. When working here, anchor discovery around:

- `supabase/` for schema, migrations, and local project config
- `scripts/` for operational helpers
- `src/lib/supabase.ts` for the browser/shared client
- `src/lib/supabase-server.ts` for server-side access
- `src/lib/admin.ts` for privileged admin or service-role operations

## What This Skill Does

This skill helps Codex work safely and efficiently on Supabase-backed projects by:

- identifying the app's Supabase integration points
- tracing how environment variables, client setup, and server access are wired
- making database changes through migrations instead of ad hoc SQL when possible
- checking auth, RLS, and storage side effects before changing application code
- validating changes with the project's existing scripts and local conventions

## Trigger This Skill When

Use this skill if the user asks for things like:

- "set up Supabase in this app"
- "fix this Supabase auth bug"
- "add a new table / policy / bucket"
- "create a migration"
- "debug RLS"
- "wire this page to Supabase"
- "make this work with Supabase storage"
- "review our Supabase implementation"

## Working Style

Keep progress visible and move from discovery to implementation:

1. Find the current Supabase setup before proposing changes.
2. Prefer project-native patterns over generic examples.
3. Treat database, auth, and policy changes as high-risk.
4. Make reversible, explicit changes with migrations and clear naming.
5. Verify both code paths and data-access assumptions.

## Discovery Checklist

Start by locating the project's Supabase footprint. In this repository, check these first:

- `src/lib/supabase.ts`
- `src/lib/supabase-server.ts`
- `src/lib/admin.ts`
- `supabase/`
- `scripts/`

Then expand only if needed. Also look for:

- `supabase/` directory
- migration files
- seed files
- edge functions
- generated types
- client helpers such as `src/lib/supabase.*`
- auth helpers and middleware
- environment variable usage such as `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- calls to `createClient`, server clients, admin clients, and session helpers

Prefer fast file search tools. Read only the files needed to understand the current architecture.

## Implementation Rules

### Database

- Prefer migrations over one-off manual SQL.
- Keep migration names descriptive and tightly scoped.
- If changing an existing table, inspect downstream queries first.
- Update generated types if the project already keeps them in source control.

### Auth

- Check whether the app uses client-side auth, SSR auth, middleware, or service-role access.
- Never expose service-role credentials to the browser.
- Treat `src/lib/admin.ts` as privileged by default and verify it is never imported into client-side code.
- Preserve redirect, session, and cookie behavior already used by the app.

### RLS

- Assume RLS changes can break live behavior even when SQL succeeds.
- Review `select`, `insert`, `update`, and `delete` separately.
- Consider both authenticated and anonymous users where relevant.
- If adding policies, state clearly which actor is being granted which access.

### Storage

- Confirm whether uploads happen from the browser, server, or admin context.
- Check bucket policies together with code changes.
- Preserve file path conventions and public/private access expectations.
- If storage helpers already exist under `src/lib/`, extend those patterns instead of creating a parallel upload path.

### Edge Functions

- Match the repository's existing function structure and runtime assumptions.
- Keep secrets in environment configuration, not source files.

## Validation

After changes, validate in the narrowest reliable way available:

- run the project's tests if relevant
- run build or typecheck if code paths changed
- review migrations for destructive or lock-heavy operations
- verify app queries still match schema and policy assumptions
- if `scripts/` contains Supabase-specific workflows, prefer those over inventing new commands

If live Supabase access is unavailable, say what was validated locally and what still needs confirmation.

## Review Mode

When the user asks for a review, prioritize findings such as:

- unsafe service-role usage
- client imports of `src/lib/admin.ts` or other privileged helpers
- missing or overly broad RLS policies
- browser/server client mixups
- schema drift between SQL and application types
- auth flows that break SSR or session refresh
- storage access that contradicts bucket privacy

List findings first with file references and concrete risk.

## Output Expectations

When using this skill, Codex should usually provide:

- a short summary of the current Supabase architecture
- the specific change made
- any migration or policy implications
- what was verified
- any remaining risks or follow-up checks

## If Blocked

If the repository does not contain enough Supabase context:

- say what is missing
- avoid inventing project structure
- fall back to a minimal, conventional implementation
- clearly label assumptions
