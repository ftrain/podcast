import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.test.ts",
    "!src/index.ts",
  ],
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
};

export default config;
