# Issues

## Warning: middleware deprecation
Next.js 16.2.7 warns: "The middleware file convention is deprecated. Please use proxy instead."
The existing middleware.ts still functions correctly. Should be migrated to proxy.ts in a future PR.
Not blocking — existing behavior is preserved.

## Edge Runtime consideration
The `getAllowedModels()` server action imports `createAdminClient()` which creates a Supabase
client at call time. This is compatible with Edge Runtime since no file system or Node.js APIs
are used. Verified during build.
