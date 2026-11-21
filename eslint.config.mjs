import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".next-review-backup-*/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "*/lib/db",
                "@/lib/db",
                "**/lib/db",
                "@prisma/client",
                "@prisma/*",
                "**/generated/prisma/**",
              ],
              message:
                "No importes lib/db ni Prisma directamente desde páginas o componentes. Usa funciones de consultas (BD) o server actions (BK) en su lugar.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
