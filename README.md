# OviZero Risk Intelligence

A responsive operations dashboard for OviZero's block-level Aedes risk intelligence workflow. The interface combines rapid scanning with an interactive risk map, dense node diagnostics, priority zones, and targeted fogging operations.

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
