# Branch protection: required security checks

The `Security` workflow (`.github/workflows/security.yml`) publishes three
status checks on every pull request. Branch protection on `main` MUST require
all three — by their **exact** names — so a PR cannot merge while any of them
is missing or failing.

## Required status check names (exact, case-sensitive)

These strings come from the `name:` field of each job in the workflow and are
what GitHub publishes as check-run names:

1. `Dependency audit (high/critical)`
2. `Static analysis (Semgrep)`
3. `CodeQL (JavaScript/TypeScript)`

If you rename a job in `security.yml`, you must update the branch protection
rule to match, or the check becomes optional again.

## Configure via the GitHub UI

1. Repository → **Settings** → **Branches** → **Branch protection rules** →
   **Add rule** (or edit the existing `main` rule).
2. **Branch name pattern**: `main`.
3. Enable **Require a pull request before merging**.
4. Enable **Require status checks to pass before merging**.
   - Enable **Require branches to be up to date before merging**.
   - In the search box, add each of the three names above. They must appear
     in the "Status checks that are required" list exactly as written.
5. Enable **Do not allow bypassing the above settings** so admins are also
   gated by the checks.
6. Save changes.

## Configure via the GitHub CLI

Run from a clone of the repo (requires `gh auth login` with admin scope):

```bash
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "repos/:owner/:repo/branches/main/protection" \
  -F required_status_checks.strict=true \
  -f 'required_status_checks.contexts[]=Dependency audit (high/critical)' \
  -f 'required_status_checks.contexts[]=Static analysis (Semgrep)' \
  -f 'required_status_checks.contexts[]=CodeQL (JavaScript/TypeScript)' \
  -F enforce_admins=true \
  -F required_pull_request_reviews.required_approving_review_count=1 \
  -F restrictions= \
  -F allow_force_pushes=false \
  -F allow_deletions=false
```

Replace `:owner/:repo` if `gh` does not resolve it automatically.

## Verify

```bash
gh api "repos/:owner/:repo/branches/main/protection/required_status_checks" \
  --jq '.contexts'
```

The output must be exactly:

```json
[
  "Dependency audit (high/critical)",
  "Static analysis (Semgrep)",
  "CodeQL (JavaScript/TypeScript)"
]
```

Any other set means the gate is misconfigured.
