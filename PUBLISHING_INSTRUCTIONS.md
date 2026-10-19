# Quick Publishing Guide

## Pre-Publishing Checklist

- [ ] All tests pass: `npm test`
- [ ] All types check: `npm run typecheck`
- [ ] Build succeeds: `npm run build`
- [ ] Version numbers updated in both packages
- [ ] CHANGELOG.md updated
- [ ] Committed all changes

## Publishing Steps

### 1. Build Everything

```bash
npm run build
```

### 2. Publish Types Package First

```bash
cd packages/types
npm publish
cd ../..
```

### 3. Wait & Verify

Wait 2-3 minutes, then verify types are published:

```bash
npm view @alphabite/econt-types
```

### 4. Publish SDK Package

```bash
cd packages/sdk
npm publish
cd ../..
```

### 5. Tag Release

```bash
git tag v1.1.0
git push origin v1.1.0
```

## Testing Locally Before Publishing

Test the types package locally:

```bash
cd packages/types
npm pack
# This creates alphabite-econt-types-1.1.0.tgz
```

Test the SDK package locally:

```bash
cd packages/sdk
npm pack
# This creates alphabite-econt-sdk-1.1.0.tgz
```

## Common Issues

**Problem**: SDK build fails with "Cannot find module '@alphabite/econt-types'"

**Solution**: Build types first

```bash
npm run build:types
npm run build:sdk
```

**Problem**: npm publish fails with authentication error

**Solution**: Login to npm

```bash
npm login
```

**Problem**: Version already exists

**Solution**: Update version numbers in package.json files

## Rollback

If you need to unpublish (within 72 hours):

```bash
npm unpublish @alphabite/econt-types@1.1.0
npm unpublish @alphabite/econt-sdk@1.1.0
```

## More Details

See MONOREPO_GUIDE.md for comprehensive documentation.
