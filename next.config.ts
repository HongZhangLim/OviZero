import type { NextConfig } from "next";

const repository = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isProjectPage = process.env.GITHUB_ACTIONS === "true" && !repository.endsWith(".github.io");

const config: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isProjectPage ? `/${repository}` : "",
  images: { unoptimized: true },
};

export default config;
