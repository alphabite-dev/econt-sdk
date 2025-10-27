# Econt SDK - Caching Feature Documentation

## 📦 Overview

The Econt SDK includes a powerful caching system that allows you to download all nomenclature data (countries, cities, offices, streets, quarters) once and use it offline. This dramatically improves performance and reduces API calls.

## ✨ Features

- **One-command export** - Download all data with `exportAllData()`
- **Automatic fallback** - Uses cache when available, API when not
- **Smart filtering** - Filter cached data in-memory (no API calls)
- **TTL support** - Automatic cache expiration
- **Zero breaking changes** - Works exactly as before without cache config
- **TypeScript first** - Fully typed with no `any` types

## 🚀 Quick Start

### 1. Enable Caching

```typescript
import { EcontClient } from "econt";

const client = new EcontClient({
  username: "your-username",
  password: "your-password",
  environment: "demo",
  cache: {
    enabled: true,
    directory: "./econt-cache",
    ttl: 86400000, // 24 hours (optional)
  },
});
```

### 2. Export All Data (One Time)

```typescript
// This downloads and caches all data
// Takes ~30-60 seconds
await client.exportAllData();
```

### 3. Use Normally - Cache is Automatic!

```typescript
// These automatically use cache when available
const countries = await client.offices.getCountries();
const cities = await client.offices.getCities({ countryCode: "BGR" });
const offices = await client.offices.list({ countryCode: "BGR" });
const streets = await client.offices.getStreets(cityId);
const quarters = await client.offices.getQuarters(cityId);
```

## 📁 Cached Data Structure

After running `exportAllData()`, your cache directory contains:

```
econt-cache/
├── countries.json      (~20 KB - all 236 countries)
├── cities.json         (~500 KB - all 5,492 cities)
├── offices.json        (~800 KB - all 819 offices)
├── streets.json        (~5 MB - streets keyed by cityId)
├── quarters.json       (~100 KB - quarters keyed by cityId)
└── metadata.json       (export timestamp & version)
```

## 🔧 Configuration Options

### CacheConfig Interface

```typescript
interface CacheConfig {
  enabled: boolean; // Enable/disable caching
  directory: string; // Path to cache directory
  ttl?: number; // Time-to-live in milliseconds (default: 86400000 = 24h)
}
```

### Example Configurations

**Development (frequent updates):**

```typescript
cache: {
  enabled: true,
  directory: './cache',
  ttl: 3600000, // 1 hour
}
```

**Production (stable data):**

```typescript
cache: {
  enabled: true,
  directory: '/var/cache/econt',
  ttl: 604800000, // 7 days
}
```

**No caching:**

```typescript
// Simply omit the cache config
// or set enabled: false
cache: {
  enabled: false,
  directory: './cache',
}
```

## 📖 API Reference

### Client Methods

#### `exportAllData(): Promise<void>`

Downloads all nomenclature data from the API and saves to cache.

```typescript
await client.exportAllData();
```

**What it exports:**

- All countries (236)
- All cities (~5,492)
- All offices (~819)
- All streets (mapped by city ID)
- All quarters (mapped by city ID)

**Time:** ~30-60 seconds depending on network speed

#### `getCacheStatus(): object | null`

Returns status of all cached files.

```typescript
const status = client.getCacheStatus();
console.log(status);
// {
//   countries: { exists: true, age: 3600000, expired: false },
//   cities: { exists: true, age: 3600000, expired: false },
//   offices: { exists: true, age: 3600000, expired: false },
//   streets: { exists: true, age: 3600000, expired: false },
//   quarters: { exists: true, age: 3600000, expired: false },
//   metadata: { exists: true, age: 3600000, expired: false }
// }
```

Returns `null` if caching is not enabled.

#### `clearCache(): void`

Deletes all cached files.

```typescript
client.clearCache();
```

Throws error if caching is not enabled.

### Resource Methods with Cache Support

All nomenclature methods support an optional `forceRefresh` parameter:

#### `getCountries(params?: { forceRefresh?: boolean })`

```typescript
// From cache (if available)
const countries = await client.offices.getCountries();

// Force API call
const fresh = await client.offices.getCountries({ forceRefresh: true });
```

#### `getCities(params?: { countryCode?: string; cityId?: number; forceRefresh?: boolean })`

```typescript
// From cache, filtered in-memory
const cities = await client.offices.getCities({ countryCode: "BGR" });

// Force API call
const fresh = await client.offices.getCities({
  countryCode: "BGR",
  forceRefresh: true,
});
```

#### `list(params?: { countryCode?: string; cityId?: number; officeCode?: string; forceRefresh?: boolean })`

```typescript
// From cache, filtered in-memory
const offices = await client.offices.list({ countryCode: "BGR" });

// Force API call
const fresh = await client.offices.list({
  countryCode: "BGR",
  forceRefresh: true,
});
```

#### `getStreets(cityID: number, params?: { streetName?: string; forceRefresh?: boolean })`

```typescript
// From cache
const streets = await client.offices.getStreets(41); // Sofia

// Search in cache
const filtered = await client.offices.getStreets(41, {
  streetName: "Витоша",
});

// Force API call
const fresh = await client.offices.getStreets(41, { forceRefresh: true });
```

#### `getQuarters(cityID: number, params?: { forceRefresh?: boolean })`

```typescript
// From cache
const quarters = await client.offices.getQuarters(41);

// Force API call
const fresh = await client.offices.getQuarters(41, { forceRefresh: true });
```

## 🎯 Usage Patterns

### Pattern 1: E-commerce Application

```typescript
// On application startup (or via cron job)
const client = new EcontClient({
  username: process.env.ECONT_USERNAME,
  password: process.env.ECONT_PASSWORD,
  cache: { enabled: true, directory: "./cache" },
});

// One-time: Export data
await client.exportAllData();

// Throughout your app: Use cached data
app.get("/api/cities", async (req, res) => {
  // Instant response from cache
  const cities = await client.offices.getCities({
    countryCode: "BGR",
  });
  res.json(cities);
});

app.get("/api/offices/:cityId", async (req, res) => {
  // Instant response from cache
  const offices = await client.offices.list({
    cityId: parseInt(req.params.cityId),
  });
  res.json(offices);
});

// Weekly refresh via cron
cron.schedule("0 0 * * 0", async () => {
  await client.exportAllData();
});
```

### Pattern 2: CLI Tool

```typescript
#!/usr/bin/env node

const client = new EcontClient({
  username: process.env.ECONT_USERNAME,
  password: process.env.ECONT_PASSWORD,
  cache: { enabled: true, directory: "~/.econt-cache" },
});

// Check if cache exists
const status = client.getCacheStatus();
if (!status?.countries.exists) {
  console.log("Downloading Econt data...");
  await client.exportAllData();
}

// Use cached data
const offices = await client.offices.list();
console.log(`Found ${offices.length} offices`);
```

### Pattern 3: Serverless Function

```typescript
// Cache to /tmp (ephemeral but faster than repeated API calls)
const client = new EcontClient({
  username: process.env.ECONT_USERNAME,
  password: process.env.ECONT_PASSWORD,
  cache: {
    enabled: true,
    directory: "/tmp/econt-cache",
    ttl: 3600000, // 1 hour
  },
});

export const handler = async (event) => {
  // Will use cache if available, fetch if not
  const cities = await client.offices.getCities({ countryCode: "BGR" });

  return {
    statusCode: 200,
    body: JSON.stringify(cities),
  };
};
```

## ⚡ Performance Comparison

### Without Cache

```
getCountries():  ~500ms  (API call)
getCities():     ~2000ms (API call)
list():          ~1500ms (API call)
```

### With Cache

```
getCountries():  ~2ms    (from cache)
getCities():     ~5ms    (from cache + filter)
list():          ~3ms    (from cache + filter)
```

**Result: ~200-500x faster** 🚀

## 🔒 Best Practices

### 1. Cache Refresh Strategy

```typescript
// Option A: Periodic refresh (recommended for production)
setInterval(async () => {
  await client.exportAllData();
}, 7 * 24 * 60 * 60 * 1000); // Weekly

// Option B: On-demand refresh
app.post("/admin/refresh-cache", async (req, res) => {
  await client.exportAllData();
  res.json({ success: true });
});

// Option C: Check expiration before use
const status = client.getCacheStatus();
if (status?.countries.expired) {
  await client.exportAllData();
}
```

### 2. Error Handling

```typescript
try {
  await client.exportAllData();
} catch (error) {
  console.error("Cache export failed:", error);
  // App continues to work - will use API calls
}
```

### 3. Cache Directory Permissions

```typescript
// Ensure directory is writable
const cacheDir = "./econt-cache";
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true, mode: 0o755 });
}
```

### 4. Docker Volumes

```yaml
# docker-compose.yml
services:
  app:
    volumes:
      - ./econt-cache:/app/econt-cache
```

```typescript
// Use volume path
cache: {
  enabled: true,
  directory: '/app/econt-cache'
}
```

## ❓ FAQ

### Q: Does caching work for shipment operations?

**A:** No. Caching only applies to nomenclatures (countries, cities, offices, streets, quarters). Shipment operations always use the API.

### Q: What happens if cache is outdated?

**A:** The cache has a TTL (time-to-live). After expiration, the SDK automatically fetches fresh data from the API.

### Q: Can I use cache in read-only environments?

**A:** Yes, but you need to export the data elsewhere first and copy the cache directory to your read-only environment.

### Q: How much disk space does the cache use?

**A:** Approximately **6-7 MB** for all data.

### Q: Can I cache only certain data (e.g., only countries)?

**A:** Currently, `exportAllData()` exports everything. You can manually cache specific data if needed, but the complete export is recommended.

### Q: What if the API structure changes?

**A:** The SDK version is stored in `metadata.json`. Clear the cache after SDK upgrades: `client.clearCache()`

### Q: Can multiple processes share the same cache?

**A:** Yes! Multiple processes can read from the same cache directory. However, only one process should call `exportAllData()` at a time.

## 🐛 Troubleshooting

### Cache not working

```typescript
// Check if caching is enabled
const status = client.getCacheStatus();
if (status === null) {
  console.log("Caching is not enabled");
}
```

### Permission denied errors

```bash
# Fix cache directory permissions
chmod -R 755 ./econt-cache
```

### Stale data

```typescript
// Force refresh all data
await client.exportAllData();

// Or clear and re-export
client.clearCache();
await client.exportAllData();
```

### Out of disk space

```typescript
// Clear cache to free space
client.clearCache();
```

## 📝 Complete Example

See [`examples/cache-usage.ts`](./examples/cache-usage.ts) for a complete working example.

```bash
# Run the example
npm install
npm run build
node examples/cache-usage.ts
```

## 🎉 Summary

The caching feature provides:

✅ **Dramatic performance improvements** (~200-500x faster)  
✅ **Reduced API costs** (fewer calls = lower costs)  
✅ **Offline capability** (work without constant API access)  
✅ **Zero code changes** (transparent caching)  
✅ **Smart filtering** (in-memory operations)  
✅ **Automatic fallback** (uses API if cache unavailable)

Happy caching! 🚀
