# Tier 0 patches for jarvis-client-php and jarvis-client-node

These patches were generated in a sandbox that could not push directly to
the SDK repos (the session is hard-restricted to `jarvis-dashboard`).
Apply them locally and push from your machine.

## What they do

Both patches fix the same bug — `buildPayload()` never emitted the `'down'`
status, leaving the HTTP 503 mapping in the controllers as dead code. They
also add cross-cutting parity work:

- **PHP**: defensive `config()` reads (unblocks the existing test suite that
  uses raw `PHPUnit\Framework\TestCase` without Testbench)
- **Node**: parallelized alerts (parity with metrics/custom resolution)

Status priority after the fix (both SDKs):

| Condition | Status | HTTP |
|---|---|---|
| Metrics defined and ALL returned errors | `down` | 503 |
| At least one critical alert | `degraded` | 200 |
| Otherwise | `healthy` | 200 |

Tests: PHP 9/9, Node 11/11. TypeScript strict-mode clean.

## How to apply (Windows / Laragon)

```powershell
# 1. PHP SDK
cd E:\laragon\www\jarvis-client-php
git checkout -b claude/tier-0-fix-down-status
git am ..\jarvis-dashboard\tier-0-patches\tier-0-fix-php.patch
git push -u origin claude/tier-0-fix-down-status

# 2. Node SDK
cd E:\laragon\www\jarvis-client-node
git checkout -b claude/tier-0-fix-down-status
git am ..\jarvis-dashboard\tier-0-patches\tier-0-fix-node.patch
git push -u origin claude/tier-0-fix-down-status
```

`git am` preserves the original commit message and author.

If `git am` fails for any reason, fall back to:

```powershell
git apply ..\jarvis-dashboard\tier-0-patches\tier-0-fix-php.patch
git add .
git commit -m "fix: emit 'down' status when all metrics fail; defensive config() reads"
```

## Verification

After applying:

```powershell
# PHP
cd E:\laragon\www\jarvis-client-php
composer install
vendor/bin/phpunit tests/      # expect: OK (9 tests, 19 assertions)

# Node
cd E:\laragon\www\jarvis-client-node
npm install
npm test                       # expect: 11 passed
```

## Cleanup (optional, after both SDKs have the commits pushed)

This folder can be removed from `jarvis-dashboard`:

```bash
git rm -r tier-0-patches/
git commit -m "chore: remove tier-0 patch delivery artifacts (applied)"
git push
```
