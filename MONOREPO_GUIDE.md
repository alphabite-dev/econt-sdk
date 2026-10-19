# Econt SDK Monorepo Guide

This repository has been restructured as a monorepo containing two publishable packages:

1. **@alphabite/econt-types** - TypeScript type definitions only
2. **@alphabite/econt-sdk** - Full SDK implementation (depends on types)

## Repository Structure

```
econt/
├── packages/
│   ├── types/                    # @alphabite/econt-types
│   │   ├── src/                 # Type definitions
│   │   ├── dist/                # Built types (after build)
│   │   ├── package.json         # Types package config
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   └── sdk/                     # @alphabite/econt-sdk
│       ├── src/                 # SDK implementation
│       ├── dist/                # Built SDK (after build)
│       ├── tests/               # Tests
│       ├── package.json         # SDK package config
│       ├── tsconfig.json
│       └── vitest.config.ts
│
├── package.json                 # Root workspace config
└── node_modules/                # Shared dependencies
```

## Key Benefits

### For @alphabite/econt-types

- **Zero runtime dependencies** - Only TypeScript types
- **Lightweight** - Minimal package size
- **Reusable** - Use in any TypeScript project
- **Version independently** - Types can be updated separately

### For @alphabite/econt-sdk

- **Includes all types** - Re-exports all types from @alphabite/econt-types
- **Type safety** - Strongly typed using the types package
- **Single source of truth** - Types are maintained in one place

## Development Workflow

### Installing Dependencies

```bash
# Install all dependencies for monorepo
npm install
```

This will install dependencies for the root and all packages.

### Building Packages

```bash
# Build both packages
npm run build

# Build only types
npm run build:types

# Build only SDK
npm run build:sdk
```

**Important**: Always build types first before building SDK, or use `npm run build` which handles the order automatically.

### Running Tests

```bash
# Run SDK tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### Type Checking

```bash
# Check types in all packages
npm run typecheck
```

### Development Mode

```bash
# Run SDK in watch mode (rebuilds on changes)
npm run dev
```

## Publishing Workflow

### 1. Update Version Numbers

Update version in both package.json files:

- `packages/types/package.json`
- `packages/sdk/package.json`
- Root `package.json` (for reference)

**Important**: If you update types, ensure SDK's dependency on types is updated:

```json
// In packages/sdk/package.json
{
  "dependencies": {
    "@alphabite/econt-types": "^1.2.0" // Update this
  }
}
```

### 2. Build Packages

```bash
npm run build
```

### 3. Publish Types Package

```bash
cd packages/types
npm publish
cd ../..
```

### 4. Publish SDK Package

Wait for types package to be available on npm (usually takes a few minutes), then:

```bash
cd packages/sdk
npm publish
cd ../..
```

### 5. Create Git Tag

```bash
git tag v1.1.0
git push origin v1.1.0
```

## Version Management Strategy

### Semantic Versioning

Both packages should generally be versioned together:

- **Major version** (x.0.0): Breaking changes in either package
- **Minor version** (1.x.0): New features, additions
- **Patch version** (1.1.x): Bug fixes, documentation

### When to Version Independently

**Types package can be versioned independently when:**

- Adding new optional types that don't affect SDK
- Improving type documentation
- Adding utility types

**SDK must be versioned when:**

- Any functional changes
- Any API changes
- Any types changes (and types package must be updated first)

## Using the Packages

### For End Users (Using SDK)

```bash
npm install @alphabite/econt-sdk
```

This automatically includes types - users get both!

```typescript
import { EcontClient, Office, ShippingLabel } from "@alphabite/econt-sdk";

// All types are available from SDK package
const client = new EcontClient(config);
```

### For Type-Only Usage

```bash
npm install @alphabite/econt-types
```

For projects that only need types (e.g., building custom implementations):

```typescript
import { Office, ShippingLabel, EcontConfig } from "@alphabite/econt-types";

// Use types without SDK implementation
```

## Maintenance Tips

### Adding New Types

1. Add types to appropriate file in `packages/types/src/`
2. Export from `packages/types/src/index.ts`
3. Build types package: `npm run build:types`
4. Update SDK imports if needed
5. Build SDK: `npm run build:sdk`

### Adding New SDK Features

1. Add feature to `packages/sdk/src/`
2. Import types from `@alphabite/econt-types`
3. Export from `packages/sdk/src/index.ts`
4. Add tests in `packages/sdk/tests/`
5. Build and test

### Troubleshooting

**Issue**: SDK can't find types

```bash
# Rebuild types package
npm run build:types
# Then rebuild SDK
npm run build:sdk
```

**Issue**: Changes not reflected

```bash
# Clean and rebuild everything
rm -rf packages/*/dist packages/*/node_modules
npm install
npm run build
```

**Issue**: Tests failing

```bash
# Ensure packages are built
npm run build
# Then run tests
npm test
```

## CI/CD Considerations

For automated publishing, your CI pipeline should:

1. Install dependencies: `npm install`
2. Run tests: `npm test`
3. Build packages: `npm run build`
4. Publish types first: `cd packages/types && npm publish`
5. Wait for types to be available
6. Publish SDK: `cd packages/sdk && npm publish`

## Migration Notes

### From Old Structure

The old structure had:

- Types in `src/types/` folder
- Everything published as single package

New structure:

- Types in separate `packages/types/` package
- SDK in `packages/sdk/` package
- SDK depends on and re-exports types

### For Users

No breaking changes! Users can continue using:

```typescript
import { EcontClient, Office } from "@alphabite/econt-sdk";
```

Everything works the same way.

## Questions?

For issues or questions:

- Open an issue: https://github.com/alphabite-dev/econt-sdk/issues
- Check documentation: packages/types/README.md and packages/sdk/README.md
