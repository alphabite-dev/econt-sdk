import { EcontClient } from "../src";

/**
 * Track shipment example
 */
async function main() {
  const client = new EcontClient({
    apiKey: "your-api-key-here",
    environment: "demo",
  });

  try {
    // Track a single shipment
    console.log("Tracking shipment...");
    const tracking = await client.tracking.track("1234567890", "en");

    console.log("Shipment number:", tracking.shipmentNumber);
    console.log("Current status:", tracking.status);
    console.log("Estimated delivery:", tracking.estimatedDeliveryDate);

    console.log("\nTracking events:");
    tracking.trackingEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.eventDate} ${event.eventTime}`);
      console.log(`   Status: ${event.status}`);
      console.log(`   Location: ${event.location || "N/A"}`);
      console.log(`   Description: ${event.description}`);
    });

    // Track multiple shipments
    console.log("\n\nTracking multiple shipments...");
    const shipmentNumbers = ["1234567890", "0987654321", "1111222233"];
    const trackings = await client.tracking.trackMultiple(shipmentNumbers, "en");

    trackings.forEach((tracking) => {
      console.log(`\nShipment ${tracking.shipmentNumber}:`);
      console.log(`  Status: ${tracking.status}`);
      console.log(`  Events: ${tracking.trackingEvents.length}`);
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
