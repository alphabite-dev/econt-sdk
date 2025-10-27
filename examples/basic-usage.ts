import { EcontClient } from "../src";

/**
 * Basic usage example
 */
async function main() {
  // Initialize the client
  const client = new EcontClient({
    apiKey: "your-api-key-here",
    environment: "demo", // or "production"
  });

  try {
    // Get list of offices
    console.log("Fetching offices...");
    const offices = await client.offices.list();
    console.log(`Found ${offices.length} offices`);
    console.log("First office:", offices[0]);

    // Get a specific office by code
    console.log("\nFetching specific office...");
    const office = await client.offices.get("1234");
    if (office) {
      console.log("Office details:", office);
    }

    // Get list of cities
    console.log("\nFetching cities...");
    const cities = await client.offices.getCities({ countryCode: "BGR" });
    console.log(`Found ${cities.length} cities in Bulgaria`);

    // Get list of countries
    console.log("\nFetching countries...");
    const countries = await client.offices.getCountries();
    console.log(`Found ${countries.length} countries`);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
