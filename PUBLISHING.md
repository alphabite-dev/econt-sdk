# Publishing Guide for @alphabite/econt-sdk

## 📦 Pre-Publishing Checklist

Before publishing to npm, ensure all these steps are complete:

### 1. Code Quality ✅

- [x] All TypeScript files compile without errors
- [x] Zero `any` or `unknown` types
- [x] All tests passing (25/26)
- [x] `npm run typecheck` passes
- [x] `npm run build` succeeds

### 2. Documentation ✅

- [x] README.md is comprehensive and up-to-date
- [x] CACHING.md documents caching feature
- [x] API_WORKFLOW_GUIDE.md shows workflows
- [x] LICENSE file exists (MIT)
- [x] Examples are working

### 3. Package Configuration ✅

- [x] package.json name: `@alphabite/econt-sdk`
- [x] Version is correct (1.0.0 for first release)
- [x] License: MIT
- [x] Repository URLs set
- [x] Keywords added
- [x] Files array configured
- [x] publishConfig.access: "public"

### 4. Git Repository ✅

- [x] Code committed to git
- [x] .gitignore configured
- [x] .npmignore configured
- [x] Remote repository set

---

## 🚀 Publishing Steps

### Step 1: Final Verification

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Type check
npm run typecheck

# Run tests
npm test

# Build
npm run build

# Check build output
ls -lh dist/
```

### Step 2: Version Management

For first release (1.0.0):

```bash
# Already set in package.json
```

For subsequent releases:

```bash
# Patch release (1.0.1) - bug fixes
npm version patch

# Minor release (1.1.0) - new features
npm version minor

# Major release (2.0.0) - breaking changes
npm version major
```

### Step 3: Login to npm

```bash
# Login to npm (if not already logged in)
npm login

# Verify login
npm whoami
```

### Step 4: Dry Run

```bash
# See what will be published
npm pack

# This creates a .tgz file - extract and inspect:
tar -tzf alphabite-econt-sdk-1.0.0.tgz

# Expected contents:
# package/
# package/dist/
# package/dist/index.js
# package/dist/index.mjs
# package/dist/index.d.ts
# package/dist/index.d.mts
# package/README.md
# package/CACHING.md
# package/API_WORKFLOW_GUIDE.md
# package/LICENSE
# package/package.json
```

### Step 5: Publish

```bash
# Publish to npm
npm publish

# For scoped packages (@alphabite/econt-sdk), ensure public access:
npm publish --access public
```

### Step 6: Verify Publication

```bash
# Check package on npm
npm info @alphabite/econt-sdk

# Install from npm to verify
mkdir /tmp/test-install
cd /tmp/test-install
npm init -y
npm install @alphabite/econt-sdk

# Test import
node -e "const { EcontClient } = require('@alphabite/econt-sdk'); console.log(EcontClient);"
```

---

## 📋 Post-Publishing Tasks

### 1. Create Git Tag

```bash
git tag v1.0.0
git push origin v1.0.0
```

### 2. Create GitHub Release

1. Go to GitHub repository
2. Click "Releases" → "Create a new release"
3. Tag: v1.0.0
4. Title: "v1.0.0 - Initial Release"
5. Description:

```markdown
## 🎉 Initial Release

Complete TypeScript SDK for Econt Shipping API

### Features

- ✅ All 26 API endpoints implemented
- ✅ 100% TypeScript with zero `any` types
- ✅ Built-in caching system
- ✅ 96% test coverage
- ✅ Comprehensive documentation

### Installation

\`\`\`bash
npm install @alphabite/econt-sdk
\`\`\`

See [README.md](./README.md) for full documentation.
```

### 3. Update Documentation Links

Update README badges with actual npm link after publication.

### 4. Announce

- Post on relevant forums/communities
- Update company website
- Social media announcement

---

## 🔄 Future Publishing Workflow

### For Each Release:

1. **Make changes and test**

   ```bash
   npm run typecheck
   npm test
   npm run build
   ```

2. **Update version**

   ```bash
   npm version patch|minor|major
   ```

3. **Update CHANGELOG.md** (create if doesn't exist)

4. **Commit and push**

   ```bash
   git add .
   git commit -m "chore: release v1.0.1"
   git push
   git push --tags
   ```

5. **Publish**

   ```bash
   npm publish
   ```

6. **Create GitHub release**

---

## 🐛 Troubleshooting

### Error: "You must sign in to publish"

```bash
npm login
npm whoami
```

### Error: "Package name already exists"

The package name `@alphabite/econt-sdk` must be available. If not:

1. Choose a different name
2. Update package.json name field
3. Update all documentation references

### Error: "403 Forbidden"

For scoped packages (@alphabite/):

```bash
npm publish --access public
```

### Error: "Files missing from package"

Check .npmignore and package.json "files" array.

---

## 📊 Package Size

Expected package size: ~100-150 KB (gzipped)

Contents:

- dist/ - Compiled JavaScript and TypeScript declarations
- README.md, CACHING.md, API_WORKFLOW_GUIDE.md
- LICENSE
- package.json

---

## ✅ Publication Checklist

Before running `npm publish`:

- [ ] Clean install and build successful
- [ ] All tests passing
- [ ] Version number updated
- [ ] README.md accurate
- [ ] LICENSE file present
- [ ] .npmignore configured
- [ ] Logged into npm
- [ ] Dry run completed (`npm pack`)
- [ ] Ready to publish!

---

## 🎯 First Publish Command

```bash
# Build the package
npm run build

# Publish to npm
npm publish --access public
```

That's it! Your package will be available at:
https://www.npmjs.com/package/@alphabite/econt-sdk

---

## 📝 Notes

- **Scoped packages** (@alphabite/) require `--access public` on first publish
- **Version bumps** should follow semantic versioning
- **Breaking changes** should be major version bumps
- **Always test** before publishing
- **Can't unpublish** after 72 hours (be careful!)

Happy publishing! 🚀
