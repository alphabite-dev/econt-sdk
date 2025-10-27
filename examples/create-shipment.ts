import { EcontClient, ShipmentType, ShipmentService, PaymentMethod } from "../src";

/**
 * Create shipment label example
 */
async function main() {
  const client = new EcontClient({
    apiKey: "your-api-key-here",
    environment: "demo",
  });

  try {
    // Create a shipment label
    console.log("Creating shipment label...");
    const label = await client.shipments.createLabel({
      senderClient: {
        name: "John Doe",
        phones: [{ number: "+359888123456" }],
        email: "john@example.com",
      },
      senderAddress: {
        city: {
          id: 1,
          name: "Sofia",
          countryCode: "BGR",
        },
        postCode: "1000",
        street: "Main Street",
        streetNumber: "1",
      },
      receiverClient: {
        name: "Jane Smith",
        phones: [{ number: "+359888654321" }],
        email: "jane@example.com",
      },
      receiverAddress: {
        officeCode: "1234", // Delivery to Econt office
      },
      packCount: 1,
      shipmentType: ShipmentType.PACK,
      weight: 2.5, // kg
      services: [ShipmentService.CASH_ON_DELIVERY, ShipmentService.SMS],
      paymentSenderMethod: PaymentMethod.CASH,
      cdPaymentAmount: 100.0,
      cdType: "GET",
      cdCurrency: "BGN",
      orderNumber: "ORD-12345",
      shipmentDescription: "Sample package",
    });

    console.log("Label created successfully!");
    console.log("Shipment number:", label.shipmentNumber);
    console.log("Label URL:", label.labelUrl);
    console.log("Barcode URL:", label.barcodeUrl);

    // Calculate shipping cost
    console.log("\nCalculating shipping cost...");
    const cost = await client.shipments.calculate({
      senderAddress: {
        city: {
          id: 1,
          name: "Sofia",
          countryCode: "BGR",
        },
      },
      receiverAddress: {
        city: {
          id: 2,
          name: "Plovdiv",
          countryCode: "BGR",
        },
      },
      packCount: 1,
      weight: 2.5,
      shipmentType: ShipmentType.PACK,
      services: [ShipmentService.CASH_ON_DELIVERY],
    });

    console.log("Shipping cost:", cost.price.total, cost.price.currency);
    console.log("Price breakdown:", cost.price.breakdown);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
