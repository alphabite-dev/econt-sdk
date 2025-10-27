import { EcontClient } from "../src";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Example demonstrating the caching feature
 *
 * This example shows how to:
 * 1. Enable caching in the client
 * 2. Export all nomenclature data
 * 3. Use cached data automatically
 * 4. Check cache status
 * 5. Clear cache
 */

async function main() {
  // Step 1: Initialize client with caching enabled
  const client = new EcontClient({
    username: process.env.ECONT_USERNAME!,
    password: process.env.ECONT_PASSWORD!,
    environment: "demo",
    // Enable caching
    cache: {
      enabled: true,
      directory: "./econt-cache", // Directory to store cached data
      ttl: 86400000, // 24 hours in milliseconds (optional, default is 24 hours)
    },
  });

  console.log("=== Econt SDK Cache Example ===\n");

  // Step 2: Export all data (one-time operation)
  console.log("Step 1: Exporting all nomenclature data...");
  console.log("(This will take ~30-60 seconds)\n");

  try {
    await client.exportAllData();
    console.log("\n✓ All data exported successfully!\n");
  } catch (error) {
    console.error("Error exporting data:", error);
    return;
  }

  // Step 3: Check cache status
  console.log("Step 2: Checking cache status...");
  const cacheStatus = client.getCacheStatus();
  console.log(JSON.stringify(cacheStatus, null, 2));
  console.log();

  // Step 4: Use the data - cache is automatic!
  console.log("Step 3: Using cached data (instant responses)...\n");

  // Get countries - from cache
  console.time("Get countries (cached)");
  const countries = await client.offices.getCountries();
  console.timeEnd("Get countries (cached)");
  console.log(`Found ${countries.length} countries\n`);

  // Get cities in Bulgaria - filtered from cache
  console.time("Get Bulgarian cities (cached)");
  const cities = await client.offices.getCities({ countryCode: "BGR" });
  console.timeEnd("Get Bulgarian cities (cached)");
  console.log(`Found ${cities.length} cities in Bulgaria\n`);

  // Get offices in Bulgaria - filtered from cache
  console.time("Get Bulgarian offices (cached)");
  const offices = await client.offices.list({ countryCode: "BGR" });
  console.timeEnd("Get Bulgarian offices (cached)");
  console.log(`Found ${offices.length} offices in Bulgaria\n`);

  // Get streets in Sofia
  const sofia = cities.find((c) => c.name === "София");
  if (sofia) {
    console.time("Get Sofia streets (cached)");
    const streets = await client.offices.getStreets(sofia.id);
    console.timeEnd("Get Sofia streets (cached)");
    console.log(`Found ${streets.length} streets in Sofia\n`);
  }

  // Step 5: Force refresh (bypass cache)
  console.log("Step 4: Force refresh from API...\n");
  console.time("Get countries (API)");
  const freshCountries = await client.offices.getCountries({ forceRefresh: true });
  console.timeEnd("Get countries (API)");
  console.log(`Found ${freshCountries.length} countries (from API)\n`);

  // Step 6: Example of cache clearing (optional)
  console.log("Step 5: Cache management...");
  console.log("Cache can be cleared with: client.clearCache()");
  console.log("(Not clearing in this example to preserve the exported data)\n");

  console.log("=== Example Complete ===");
  console.log("\nKey Points:");
  console.log("✓ Cache is transparent - no code changes needed");
  console.log("✓ Instant responses for nomenclatures");
  console.log("✓ Filtering happens in-memory");
  console.log("✓ Falls back to API if cache missing");
  console.log("✓ Use forceRefresh: true to bypass cache");
  console.log("\nCached files are in: ./econt-cache/");
}

// Run the example
main().catch(console.error);
