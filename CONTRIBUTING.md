# Contributing to Katingin Bikes

This repo uses `main` for production, `staging` for integration, and short-lived feature branches for new work. Ideas live in GitHub Issues on a Project board — not in markdown backlogs.

`WEBSITE_FEATURES.md` is the shipped product spec. Update it when a user-facing change reaches production. Do not use it as a todo list.

## Git workflow

```
Issue → feature/branch (cut from staging)
     → PR into staging → staging site
     → PR staging into main → production site
```

| Branch | Purpose | Deploys |
| --- | --- | --- |
| `main` | Production. Never push here directly. | Coolify production apps (`katinginbikes.com`) |
| `staging` | Integration branch. Merge feature PRs here first. | Coolify staging apps |
| `feature/short-name` | New work, cut from `staging`. | Nothing (test locally, then on staging after merge) |
| `fix/short-name` | Bug fixes, cut from `staging` (or `main` for a hotfix). | Nothing (test locally, then on staging after merge) |

One GitHub Issue per branch when practical. Link it from the PR with `Closes #N`.

### Day-to-day

1. File or pick a [GitHub Issue](https://github.com/Cyv0712/katingin-bikes/issues/new/choose). Move it to **In Progress** on the Project board.
2. Cut a branch from staging:

   ```bash
   git checkout staging
   git pull origin staging
   git checkout -b feature/short-name
   ```

3. Open a pull request **into `staging`**. After merge, check the change on the persistent staging URL.
4. When staging looks good, open a PR **`staging` → `main`** to ship production.
5. Close the issue (`Closes #N`). If customers or staff will see the change, update `WEBSITE_FEATURES.md` in that same production PR (or immediately after).

Never push straight to `main`.

### Hotfix

Urgent production bugs skip the feature queue:

1. Branch from `main`: `git checkout main && git pull && git checkout -b fix/short-name`
2. Open a PR **into `main`**.
3. After it ships, merge or cherry-pick the same commits into `staging` so staging does not drift.

## Feature tracking (the board)

Use **GitHub Issues** as tickets and one **GitHub Project** as the Jira-like board.

Columns:

- **Backlog** — ideas, not ready to start
- **Ready** — spec is clear, can be picked up
- **In Progress** — a branch exists
- **In Review** — PR is open
- **Done** — merged to `main` (or closed as not doing)

Create issues with the Feature or Bug templates. They ask for a short spec (problem, proposal, acceptance criteria) so the issue *is* the feature doc.

## Environments

Staging must have its **own Mongo database and API**. Sharing production Mongo would let staging admin actions create, edit, or delete live bikes.

| | Production | Staging |
| --- | --- | --- |
| Git branch | `main` | `staging` |
| Frontend | Coolify app on `main` (`katinginbikes.com`) | Second Coolify app on `staging` |
| Backend | Current production API (Coolify) | Second Coolify app on `staging` |
| Database | Current Atlas database | Same Atlas cluster, database name `katinginbikes-staging` |

The persistent staging URL is for post-merge checks.

Seed staging with a copy or a small fake inventory. Never by pointing `MONGO_URI` at production.

### Staging env vars (distinct from production)

Frontend (staging Coolify app, as a **build variable**, since Vite bakes it in at build time):

```env
VITE_API_URL=https://your-staging-api.example.com
```

Backend:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://.../katinginbikes-staging
CORS_ORIGIN=https://staging.katinginbikes.com
JWT_SECRET=a-different-secret-from-production
ADMIN_PASSWORD_HASH=a-different-hash-from-production
RESEND_API_KEY=...
INQUIRY_RECEIVER_EMAIL=...
```

`CORS_ORIGIN` must include the staging frontend origin. Use a different `JWT_SECRET` and admin hash than production.

Local development uses `backend/.env` and `frontend/.env` (gitignored). Copy from the `.env.example` files. Admin login is JWT + `ADMIN_PASSWORD_HASH` — there are no `VITE_ADMIN_*` variables.

## Remaining dashboard setup

These cannot be applied from the repo alone. Do them once in GitHub, Coolify, and Atlas.

### 1. Branch protection (`main` and `staging`)

Applied: [Protect main and staging](https://github.com/Cyv0712/katingin-bikes/rules/25714456). Direct pushes, force pushes, and branch deletion are blocked. A pull request is required; approvals are optional while this is a solo repo.

To change it later: GitHub → **Settings → Rules → Rulesets**.

### 2. Staging frontend app

Coolify → the project that holds the production frontend → duplicate the frontend application:

1. Keep the production app on branch `main`.
2. Set the duplicate's branch to `staging`.
3. Set build variable `VITE_API_URL` to the staging API URL (not production).
4. Attach a domain such as `staging.katinginbikes.com`.

Do not reuse the production `VITE_API_URL` on staging.

### 3. Atlas database `katinginbikes-staging`

MongoDB Atlas → the existing cluster → **Browse Collections** (or connection string):

1. Create database `katinginbikes-staging` (or point `MONGO_URI` at that DB name; Atlas creates it on first write).
2. Use the same cluster and a DB user that can access this database.
3. Seed a few test bikes, or restore a sanitized copy. Do not connect staging to the production database name.

### 4. Staging API process

In Coolify, duplicate the backend application, set the branch to `staging`, paste the staging env vars above, and keep `NIXPACKS_NODE_VERSION=22` as a build variable. Give it its own persistent storage for `uploads`.

Confirm `/health` responds, then put that URL into the staging frontend's `VITE_API_URL` and into `CORS_ORIGIN` on the API.

## Node version

Node 22 is pinned in `.nvmrc`, the `engines` field of `frontend/package.json` and `backend/package.json`, `frontend/nixpacks.toml`, and the `NIXPACKS_NODE_VERSION` variable on each Coolify backend app. When Node ships a security release, update all of them together, then redeploy with **Force rebuild without cache** and confirm with `node -v` in the Coolify terminal.

### 5. GitHub Project board

The stored GitHub token cannot create Projects (needs the `project` scope). Create it once in the browser:

1. Open [Create a new project](https://github.com/users/Cyv0712/projects/new).
2. Choose **Board**. Name it **Katingin Bikes**.
3. Set columns to **Backlog**, **Ready**, **In Progress**, **In Review**, **Done** (rename/add as needed; remove extras).
4. **Settings → Linked repositories** → add `Cyv0712/katingin-bikes`.
5. Add a workflow that auto-adds new issues and pull requests from this repo to **Backlog**.
6. Paste the project URL into this file under **Project board** below.

Issue templates already use `feature` / `bug` labels. The issue chooser also links to [the repo Projects tab](https://github.com/Cyv0712/katingin-bikes/projects).

**Project board:** _not created yet — add the URL here after step 5._
