# Fix: The application explicitly throws a 'SeededDemoFai...

## Root Cause
The application explicitly throws a 'SeededDemoFailure' when the action 'cause_error' is received. This appears to be a test artifact left in production code.

## Changes
- Applied patch to `apps/sample-app/src/index.ts`
- Removed faulty logic causing deterministic failure.

## Verification
A reproduction test has been generated.

1. Run the test to confirm failure (repro):
   `bun run app/test/generated/repro.test.ts`

2. Apply the patch:
   `patch -p0 < autopsy/patches/patch-1.diff`

3. Run the test again to confirm fix.
