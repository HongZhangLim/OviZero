# OviZero Risk Intelligence

A judge-facing prototype for OviZero's block-level Aedes risk intelligence workflow. The interface is designed for rapid scanning: one dominant risk score, one plain-language conclusion, clear reason codes, and one next action.

## Run locally

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy to GitHub Pages

1. Create a GitHub repository and push this project to its `main` branch.
2. In the repository, open **Settings → Pages**.
3. Set **Source** to **GitHub Actions**.
4. Open the **Actions** tab and run **Deploy OviZero to GitHub Pages**, or push another commit to `main`.

The included workflow installs dependencies, creates the static export, and publishes it automatically. It also configures the correct base path for project repositories such as `username.github.io/ovizero`.

## Important prototype note

Displayed risk values and weightings are illustrative. The interface does not represent a validated public-health alert or a deployed OviZero model.
