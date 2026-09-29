---
title: "Container and dependency scanning for frontend teams with Trivy and GitHub Actions"
description: "A practical setup for scanning npm lockfiles, Docker images and secrets with Trivy in CI: what to block on, how to triage findings without drowning in them, and why a nightly scan matters more than the PR check."
date: 2026-10-13
tags: [Security, CI/CD, GitHub Actions, Docker, Node.js]
---

Frontend teams usually assume security scanning belongs to "the platform team". Then someone runs a scanner against the app's Docker image and finds four hundred vulnerabilities, most of them in a base image nobody has rebuilt in a year, and a few in npm packages that ship to every user's browser.

I own dependency and container scanning for the web apps I work on. The tool matters less than the process around it, but Trivy is a good default: one binary that reads npm, yarn and pnpm lockfiles, scans container images and filesystems, and finds committed secrets. This is the setup I'd start any frontend repo with.

## What to scan, and when

Three scans cover most of the risk, and they run at different times:

| Scan | What it catches | When |
|---|---|---|
| **Filesystem (`trivy fs`)** | Vulnerable npm packages in the lockfile, committed secrets, Dockerfile misconfigurations | Every pull request |
| **Image (`trivy image`)** | OS packages in the base image, plus everything copied into it | Every build of the image |
| **Scheduled rescan** | New CVEs published against code that hasn't changed | Nightly, on the default branch |

The last one is the scan people skip, and it's the one that matters most. Most vulnerabilities aren't introduced by your pull request. They're **disclosed** later, against a dependency you shipped months ago. A PR check can't see those; a nightly scan of `main` does.

## The pull request check

```yaml
name: Security scan

on:
  pull_request:
  push:
    branches: [main]
  schedule:
    - cron: "0 5 * * *" # nightly: catch newly disclosed CVEs

permissions:
  contents: read
  security-events: write # upload results to GitHub code scanning

jobs:
  trivy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Scan lockfile, secrets and IaC
        # Pin third-party actions to a full commit SHA, not a tag: tags can be moved.
        uses: aquasecurity/trivy-action@<full-commit-sha> # vX.Y.Z
        with:
          scan-type: fs
          scanners: vuln,secret,misconfig
          severity: HIGH,CRITICAL
          ignore-unfixed: true
          exit-code: "1"
          trivyignores: .trivyignore
```

A few choices in there are deliberate:

- **Block on HIGH and CRITICAL only.** A gate that fails on every LOW finding gets disabled within a month. Start strict on what matters, and report the rest.
- **`ignore-unfixed: true`.** If no fixed version exists, failing the build doesn't make anyone safer; it just teaches the team to ignore red builds. Unfixed findings still show up in the nightly report.
- **Pin actions to a commit SHA.** A security scanner running in CI with access to your repository is itself part of your supply chain. Tags are mutable; SHAs aren't. Dependabot or Renovate can keep the pins up to date.

For npm projects, Trivy scans production dependencies from the lockfile by default and skips `devDependencies`. That's usually the right call for what ships to users. If your build tooling runs in a sensitive environment, scan dev dependencies too with `--include-dev-deps` on the CLI.

## Scanning the image you actually ship

The lockfile scan misses the operating system: Node itself, OpenSSL, libc and everything else in the base image. Scan the built image, before you push it:

```yaml
      - name: Build image
        run: docker build -t web:${{ github.sha }} .

      - name: Scan image
        uses: aquasecurity/trivy-action@<full-commit-sha> # vX.Y.Z
        with:
          image-ref: web:${{ github.sha }}
          severity: HIGH,CRITICAL
          ignore-unfixed: true
          exit-code: "1"
          format: sarif
          output: trivy-image.sarif

      - name: Upload to GitHub code scanning
        if: always()
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: trivy-image.sarif
```

Uploading SARIF puts every finding in the repository's **Security** tab, with history, instead of buried in a CI log. It's also where a reviewer or auditor will look.

Most image findings are fixed the same boring way:

- **Use a small base image.** A frontend that's served as static files needs an nginx or distroless image, not a full `node` image with a compiler toolchain. Multi-stage builds keep the build tools out of the final image.
- **Rebuild regularly.** A base image tag like `node:22-alpine` gets patched upstream, but your image only picks that up when you rebuild it. Rebuilding on a schedule clears a surprising number of findings with no code change.

## Triage without drowning

The first scan of an existing codebase always produces a wall of findings. The trap is either ignoring all of it or trying to fix all of it in one sprint. The process I use:

1. **Fix what has a fix.** Most findings are a version bump away. `npm audit fix`, a lockfile refresh or a base-image rebuild usually clears the majority.
2. **Check reachability for the rest.** A vulnerable function in a package you only use at build time, or a server-side CVE in a package that only runs in the browser, is real but not urgent. Write down why.
3. **Accept explicitly, with an expiry.** When a finding is accepted, it goes into `.trivyignore` with a reason and a date, so it can't quietly become permanent:

```text
# some-xml-parser DoS on deeply nested input: only used at build time on our own files,
# never on user input. No fixed version yet; revisit on expiry. Owner: web team.
CVE-2026-12345 exp:2026-12-31
```

(The CVE id above is a placeholder; use the real one from the report.)

When the date passes, Trivy starts failing on it again, and someone has to look at it again. That one habit is what keeps an ignore file from turning into a graveyard.

## It's also your audit evidence

If your company works under a compliance framework such as SOC 2 or ISO 27001, this setup does double duty. The scan history in code scanning shows that vulnerabilities are detected continuously; the ignore file with reasons, owners and expiry dates shows that accepted risks were triaged by a person and are reviewed. That's much easier to show an auditor than a spreadsheet assembled the week before the audit.

## Where to start

You don't need all of this on day one:

1. Add the filesystem scan to pull requests, blocking on HIGH and CRITICAL with fixes available.
2. Add the nightly scheduled run on `main`.
3. Add the image scan with SARIF upload once you build containers in CI.
4. Triage the backlog once, and from then on accept findings only with a reason and an expiry.

The goal isn't zero findings. It's that every finding is either fixed, or known, explained and scheduled to be looked at again.
