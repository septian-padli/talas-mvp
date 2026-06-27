import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const moduleInput = process.argv[2];

if (!moduleInput) {
  console.error("\x1b[31m%s\x1b[0m", "Error: Module name is required.");
  console.log("Usage: npm run generate:module <module_name>");
  console.log("Example: npm run generate:module artifact");
  process.exit(1);
}

// Normalize names
const rawName = moduleInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
const moduleName = rawName.replace(/-/g, "_"); // e.g. user_profile
const camelName = moduleName.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()); // e.g. userProfile
const pascalName = camelName.charAt(0).toUpperCase() + camelName.slice(1); // e.g. UserProfile

const targetDir = path.resolve(__dirname, "../src/modules", moduleName);

if (fs.existsSync(targetDir)) {
  console.error("\x1b[31m%s\x1b[0m", `Error: Module "${moduleName}" already exists at ${targetDir}`);
  process.exit(1);
}

// Create directory structure
const servicesDir = path.join(targetDir, "services");
const utilsDir = path.join(targetDir, "utils");
const typesDir = path.join(targetDir, "types");

fs.mkdirSync(targetDir, { recursive: true });
fs.mkdirSync(servicesDir, { recursive: true });
fs.mkdirSync(utilsDir, { recursive: true });
fs.mkdirSync(typesDir, { recursive: true });

// 1. [module_name].interface.ts
const interfaceContent = `/**
 * Data contracts, type definitions, DTOs, and cross-module facades for ${pascalName} module.
 * External modules MUST communicate with ${pascalName} domain exclusively through this interface.
 */

export interface I${pascalName}Service {
  getById(id: string): Promise<any>;
}

export const ${pascalName}Service: I${pascalName}Service = {
  async getById(id: string) {
    const { ${camelName}Service } = await import("./services/${moduleName}.service");
    return ${camelName}Service.getById(id);
  },
};
`;

// 2. [module_name].service.ts
const rootServiceContent = `export * from "./services/${moduleName}.service";
`;

// 3. services/[module_name].service.ts
const internalServiceContent = `import { prisma } from "@/lib/prisma";

/**
 * Core domain business logic & strictly isolated WRITE operations for ${pascalName} domain.
 */
export const ${camelName}Service = {
  async getById(id: string) {
    // TODO: Implement core mutation/write logic
    return null;
  },
};
`;

// 4. [module_name].aggregator.ts
const aggregatorContent = `import { prisma } from "@/lib/prisma";

/**
 * Complex READ operations involving cross-module JOIN queries for ${pascalName} domain.
 */
export const ${camelName}Aggregator = {
  async getFeed(params?: any) {
    // TODO: Implement relational read aggregations
    return [];
  },
};
`;

// Write files
fs.writeFileSync(path.join(targetDir, `${moduleName}.interface.ts`), interfaceContent, "utf8");
fs.writeFileSync(path.join(targetDir, `${moduleName}.service.ts`), rootServiceContent, "utf8");
fs.writeFileSync(path.join(servicesDir, `${moduleName}.service.ts`), internalServiceContent, "utf8");
fs.writeFileSync(path.join(targetDir, `${moduleName}.aggregator.ts`), aggregatorContent, "utf8");
fs.writeFileSync(path.join(utilsDir, ".gitkeep"), "", "utf8");
fs.writeFileSync(path.join(typesDir, ".gitkeep"), "", "utf8");

console.log("\x1b[32m%s\x1b[0m", `✔ Successfully generated module "${moduleName}" in src/modules/${moduleName}`);
console.log(`  ├── ${moduleName}.interface.ts`);
console.log(`  ├── ${moduleName}.service.ts`);
console.log(`  ├── ${moduleName}.aggregator.ts`);
console.log(`  ├── services/`);
console.log(`  ├── types/`);
console.log(`  └── utils/`);
