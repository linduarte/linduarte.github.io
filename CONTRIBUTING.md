Contributing guidelines

Thanks for contributing! A few project-specific guidelines that help keep CI stable and maintainable.

Avoid inline JavaScript with `actions/github-script`

- Do NOT add or use `actions/github-script` inline in workflow YAML. This action sometimes runs user-provided JavaScript inside a generated wrapper where certain helper variables (for example `core`) may already be declared by the runtime. That can cause runtime errors such as:

  SyntaxError: Identifier 'core' has already been declared

- If you need to run logic in the CI to post comments or summarize artifacts, prefer adding a checked-in Node script under `scripts/` and calling it from the workflow. Example:

  # Good: call a checked-in script
  - name: Post audit comment
    run: node scripts/post_audit_comment.js --reports-dir=reports

  # Avoid: inline github-script
  - name: Post audit comment
    uses: actions/github-script@v6
    with:
      script: |
        const fs = require('fs')
        const core = require('@actions/core')  # <-- avoid this; core may already be present in the wrapper
        // ... rest of inline JS

Why this is preferred
- Scripts in `scripts/` are versioned with the repo, easier to test locally, and produce clearer CI logs.
- They avoid subtle behaviors caused by the github-script wrapper or duplicated declarations.
- They can use the built-in `GITHUB_TOKEN` and environment variables safely when run from a workflow step.

If you must use `actions/github-script`
- Keep scripts extremely small and do not `require('@actions/core')` or re-declare variables that may already be present in the execution environment.
- Test the workflow on a branch in the main repo (not a fork) since CI behavior differs for forked PRs (and we auto-block such PRs introducing github-script usage).

If you find CI is failing due to `Identifier 'core' has already been declared`
- Remove the `const core = require('@actions/core')` line from the inline script (or better — move the logic to a checked-in script).
- Open a PR with the fix; the repository hosts a guard workflow that will flag any further attempts to introduce `actions/github-script`.

Thanks — and happy hacking!

Quick example (full replacement)

1) Workflow step (replace inline github-script):

```yaml
- name: Post audit comment
  run: node scripts/post_audit_comment.js --reports-dir=reports_download
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

2) scripts/post_audit_comment.js (simple checked-in pattern):

```js
// read reports and post comment using a small https request or octokit
// avoids requiring '@actions/core' inside an inline github-script wrapper
```
