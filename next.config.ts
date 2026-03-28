import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  // Turbopack is used for production builds; webpack is used for dev
  // (workaround for Turbopack dev watcher panic on SQLite WAL file changes)
  turbopack: {},
  webpack: (config) => {
    // Ignore SQLite WAL/SHM files to prevent infinite HMR reload loop
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ["**/*.db", "**/*.db-wal", "**/*.db-shm"],
    };
    // Resolve .ts/.tsx when importing with .js extension (NodeNext moduleResolution compat)
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
      ".jsx": [".tsx", ".jsx"],
    };
    return config;
  },
};

export default nextConfig;
