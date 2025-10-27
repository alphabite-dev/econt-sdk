# Econt SDK - API Workflow Guide

## 📖 Complete Usage Documentation

This guide explains the proper sequence and workflow for using the Econt Shipping API through the SDK.

---

## 🔄 Common Workflows

### Workflow 1: Creating a Shipment (Door-to-Office)

This is the most common workflow for sending a package from a sender's address to an Econt office for pickup.

#### Step 1: Get Nomenclatures (One-time setup)

```typescript
import { EcontClient } from "econt";

const client = new EcontClient({
  username: "your-username",
  password: "your-password",
  environment: "demo",
});

// Get all countries (usually done once and cached)
const countries = await client.offices.getCountries();

// Get cities in Bulgaria
const cities = await client.offices.getCities({ countryCode: "BGR" });

// Find Sofia
const sofia = cities.find((c) => c.name === "София");

// Get streets in Sofia (if sending from/to an address)
const streets = await client.offices.getStreets(sofia.id);

// Get quarters in Sofia (optional, for more precise addressing)
const quarters = await client.offices.getQuarters(sofia.id);
```

#### Step 2: Find Receiver Office

```typescript
// Get all Econt offices
const offices = await client.offices.list({ countryCode: "BGR" });

// Filter offices by city
const sofiaOffices = offices.filter((o) => o.address.city.name === "София");

// Or get nearest offices to an address
const nearestOffices = await client.address.getNearestOffices({
  address: {
    city: sofia,
    street: "бул. Витоша",
    num: "100",
  },
  shipmentType: ShipmentType.PACK,
});

// Choose the receiver office
const receiverOffice = sofiaOffices[0];
```

#### Step 3: Validate Sender Address (Optional but Recommended)

```typescript
const validationResult = await client.address.validateAddress({
  address: {
    city: {
      id: 1,
      country: {
        id: 1033,
        code2: "BG",
        code3: "BGR",
        name: "България",
        nameEn: "Bulgaria",
        isEU: true,
      },
      postCode: "1000",
      name: "София",
      nameEn: "Sofia",
      // ... other city fields
    },
    street: "бул. Витоша",
    num: "100",
  },
});

// Check if address is valid
if (validationResult.validationStatus === "valid") {
  console.log("Address is valid!");
}
```

#### Step 4: Calculate Shipping Cost

```typescript
import { ShipmentType } from "econt";

const calculation = await client.shipments.calculate({
  senderClient: {
    name: "John Doe",
    phones: ["+359888123456"],
    email: "john@example.com",
  },
  senderAddress: {
    city: sofia,
    street: "бул. Витоша",
    num: "100",
  },
  receiverClient: {
    name: "Jane Smith",
    phones: ["+359888654321"],
  },
  receiverOfficeCode: receiverOffice.code,
  packCount: 1,
  shipmentType: ShipmentType.PACK,
  weight: 2.5,
  shipmentDescription: "Books",
});

console.log("Shipping cost:", calculation.label.totalPrice);
console.log("Currency:", calculation.label.currency);
```

#### Step 5: Create the Shipment

```typescript
const shipment = await client.shipments.createLabel(
  {
    senderClient: {
      name: "John Doe",
      phones: ["+359888123456"],
      email: "john@example.com",
    },
    senderAddress: {
      city: sofia,
      street: "бул. Витоша",
      num: "100",
    },
    receiverClient: {
      name: "Jane Smith",
      phones: ["+359888654321"],
    },
    receiverOfficeCode: receiverOffice.code,
    packCount: 1,
    shipmentType: ShipmentType.PACK,
    weight: 2.5,
    shipmentDescription: "Books",
    services: {
      declaredValueAmount: 50,
      declaredValueCurrency: "BGN",
    },
  },
  { mode: "create" }
);

console.log("Shipment created:", shipment.label.shipmentNumber);
console.log("PDF Label:", shipment.label.pdfURL);
```

#### Step 6: Request Courier Pickup (Optional)

```typescript
const courierRequest = await client.shipments.requestCourier({
  requestTimeFrom: "09:00",
  requestTimeTo: "17:00",
  shipmentType: ShipmentType.PACK,
  shipmentPackCount: 1,
  shipmentWeight: 2.5,
  senderClient: {
    name: "John Doe",
    phones: ["+359888123456"],
  },
  senderAddress: {
    city: sofia,
    street: "бул. Витоша",
    num: "100",
  },
  attachShipments: [shipment.label.shipmentNumber],
});

console.log("Courier request ID:", courierRequest.courierRequestID);
```

#### Step 7: Track the Shipment

```typescript
// Track by shipment number
const status = await client.tracking.trackOne(shipment.label.shipmentNumber);

console.log("Current status:", status?.shortDeliveryStatus);
console.log("Tracking events:", status?.trackingEvents);
```

---

### Workflow 2: Creating Multiple Shipments

For bulk shipment creation (e.g., e-commerce fulfillment).

```typescript
const shipments = await client.shipments.createLabels([
  {
    senderClient: { name: "Store", phones: ["+359888111111"] },
    senderOfficeCode: "1000",
    receiverClient: { name: "Customer 1", phones: ["+359888222222"] },
    receiverOfficeCode: "2000",
    packCount: 1,
    shipmentType: ShipmentType.PACK,
    weight: 1.5,
  },
  {
    senderClient: { name: "Store", phones: ["+359888111111"] },
    senderOfficeCode: "1000",
    receiverClient: { name: "Customer 2", phones: ["+359888333333"] },
    receiverOfficeCode: "3000",
    packCount: 1,
    shipmentType: ShipmentType.PACK,
    weight: 2.0,
  },
]);

console.log("Created shipments:", shipments.results.length);
```

---

### Workflow 3: Managing Existing Shipments

#### Check If Shipment Can Be Edited

```typescript
const canEdit = await client.shipments.checkPossibleShipmentEditions([
  123456, // shipment number as integer
]);

console.log("Possible editions:", canEdit.possibleShipmentEditions);
```

#### Update a Shipment

```typescript
const updated = await client.shipments.updateLabel({
  label: {
    shipmentNumber: "123456",
    weight: 3.0, // Changed weight
    shipmentDescription: "Updated description",
    // ... include all required fields
  },
  requestCourierTimeFrom: "09:00",
  requestCourierTimeTo: "17:00",
  destroy: false,
  paymentAdditionPrice: {
    side: "sender",
    shareAmount: 0,
    method: "cash",
    otherClientNumber: "",
  },
  paymentInstruction: {
    method: "cash",
  },
});
```

#### Cancel/Delete Shipments

```typescript
const deleted = await client.shipments.deleteLabels(["123456", "123457"]);

console.log("Deletion results:", deleted.results);
```

---

### Workflow 4: Profile Management

#### Get Your Profile Information

```typescript
const profiles = await client.profile.getClientProfiles();

console.log("Your profiles:", profiles.profiles);
console.log("Addresses:", profiles.profiles[0].addresses);
```

#### Create Cash-on-Delivery Agreement

```typescript
const agreement = await client.profile.createCDAgreement({
  clientProfile: {
    name: "My Company",
    phones: ["+359888123456"],
  },
  agreementDetails: "COD agreement terms",
});
```

---

### Workflow 5: Address Services

#### Get Service Times for an Address

```typescript
const serviceTimes = await client.address.addressServiceTimes({
  city: 41, // Sofia ID
  address: "бул. Витоша 100",
  date: "2025-10-26", // YYYY-MM-DD
  shipmentType: ShipmentType.PACK,
});

console.log("Service office:", serviceTimes.serviceOffice.name);
console.log("Office work times:", serviceTimes.serviceOfficeClientsWorkTimes);
console.log("Courier work times:", serviceTimes.serviceOfficeCourierWorkTimes);
```

---

## 📋 Complete API Reference by Service

### 1. Nomenclatures Service

**Purpose:** Get reference data (countries, cities, offices, streets)

```typescript
// Get all countries
const countries = await client.offices.getCountries();

// Get cities with filters
const cities = await client.offices.getCities({
  countryCode: "BGR",
});

// Get all offices
const offices = await client.offices.list();

// Get offices by country
const bulgarianOffices = await client.offices.list({
  countryCode: "BGR",
});

// Get streets in a city
const streets = await client.offices.getStreets(cityId);

// Get quarters/neighborhoods in a city
const quarters = await client.offices.getQuarters(cityId);
```

**When to use:** At application startup or when user needs to select locations.

---

### 2. Address Service

**Purpose:** Validate addresses and find service information

```typescript
// Validate an address
const validation = await client.address.validateAddress({
  address: {
    city: {...},
    street: "Street name",
    num: "123",
  },
});

// Get service times for an address
const times = await client.address.addressServiceTimes({
  city: cityId,
  address: "Full address string",
  date: "2025-10-26",
  shipmentType: ShipmentType.PACK,
});

// Find nearest offices to an address
const nearest = await client.address.getNearestOffices({
  address: {...},
  shipmentType: ShipmentType.PACK,
});
```

**When to use:** Before creating shipments to ensure address validity and find appropriate offices.

---

### 3. Label Service (Shipments)

**Purpose:** Create, update, and manage shipping labels

```typescript
// Calculate shipping cost (doesn't create shipment)
const cost = await client.shipments.calculate(labelData);

// Validate label data (doesn't create shipment)
const validation = await client.shipments.validate(labelData);

// Create a single shipment
const shipment = await client.shipments.createLabel(labelData, { mode: "create" });

// Create multiple shipments
const shipments = await client.shipments.createLabels([labelData1, labelData2]);

// Update a shipment
const updated = await client.shipments.updateLabel(updateData);

// Update multiple shipments
const updatedMultiple = await client.shipments.updateLabels({
  labels: [updateData1, updateData2],
});

// Delete/cancel shipments
const deleted = await client.shipments.deleteLabels(["shipmentNumber1", "shipmentNumber2"]);

// Check if shipment can be edited
const canEdit = await client.shipments.checkPossibleShipmentEditions([123456]);

// Group shipments together
const group = await client.shipments.grouping([123456, 123457]);

// Cancel grouping
const cancelGroup = await client.shipments.groupingCancelation(groupId);
```

**When to use:** Main operations for creating and managing shipments.

---

### 4. Shipment Service

**Purpose:** Manage courier requests and track shipments

```typescript
// Request courier pickup
const courier = await client.shipments.requestCourier({
  requestTimeFrom: "09:00",
  requestTimeTo: "17:00",
  senderClient: {...},
  senderAddress: {...},
  attachShipments: ["shipmentNumber"],
});

// Get courier request status
const courierStatus = await client.shipments.getRequestCourierStatus([
  "requestId",
]);

// Get shipment tracking status
const status = await client.shipments.getShipmentStatuses([
  "shipmentNumber",
]);

// Get AWB (Air Waybill) information
const awb = await client.shipments.getMyAWB({
  dateFrom: "2025-10-01",
  dateTo: "2025-10-31",
  side: "all",
  page: 1,
});

// Set ITU code for international shipments
const itu = await client.shipments.setITUCode(
  "awbBarcode",
  "truckRegNum",
  "ITU_code"
);
```

**When to use:** After creating shipments, for tracking and logistics management.

---

### 5. Tracking Service

**Purpose:** Simplified tracking interface

```typescript
// Track multiple shipments
const statuses = await client.tracking.track(["shipmentNumber1", "shipmentNumber2"]);

// Track single shipment (convenience method)
const status = await client.tracking.trackOne("shipmentNumber");
```

**When to use:** To get current status and history of shipments.

---

### 6. Profile Service

**Purpose:** Manage client profiles and agreements

```typescript
// Get your profile information
const profiles = await client.profile.getClientProfiles();

// Create Cash-on-Delivery agreement
const agreement = await client.profile.createCDAgreement({
  clientProfile: {...},
  agreementDetails: "Agreement terms",
});
```

**When to use:** During setup or when managing account information.

---

## 🎯 Recommended Sequence for Different Scenarios

### Scenario A: First-Time E-commerce Integration

```
1. getCountries() - Load country data
2. getCities() - Load cities for your country
3. list() - Load all offices
4. getClientProfiles() - Get your business profile
5. calculate() - Test shipment calculations
6. validate() - Test shipment validation
7. createLabel() - Create test shipment
8. trackOne() - Track test shipment
```

### Scenario B: Daily Order Fulfillment

```
1. createLabels() - Bulk create shipments for orders
2. requestCourier() - Request pickup for all shipments
3. getRequestCourierStatus() - Confirm courier request
4. Track shipments throughout the day
5. Update/cancel as needed
```

### Scenario C: Customer Shipping Quote

```
1. getCities() - Let customer select cities
2. list() - Show available offices
3. calculate() - Show shipping cost
4. (Customer confirms) → createLabel()
5. Return tracking number to customer
```

### Scenario D: Shipment Management Dashboard

```
1. getMyAWB() - Get all recent shipments
2. getShipmentStatuses() - Get detailed status
3. checkPossibleShipmentEditions() - Check which can be modified
4. updateLabel() / deleteLabels() - Make changes as needed
```

---

## ⚠️ Important Notes

### Caching Strategy

**Cache these (rarely change):**

- Countries
- Cities (refresh daily)
- Offices (refresh daily)

**Don't cache these (dynamic):**

- Shipment statuses
- Courier request statuses
- Service times (date-specific)

### Error Handling

```typescript
try {
  const shipment = await client.shipments.createLabel(data);
} catch (error) {
  if (error instanceof EcontAPIError) {
    console.error("API Error:", error.message);
    console.error("Status:", error.statusCode);
    console.error("Details:", error.response);
  }
}
```

### Rate Limiting

The demo API may have rate limits. In production:

- Batch operations when possible (createLabels vs createLabel)
- Cache reference data
- Implement retry logic with exponential backoff

### Testing

Always use the demo environment for testing:

```typescript
const client = new EcontClient({
  username: "iasp-dev",
  password: "1Asp-dev",
  environment: "demo",
});
```

Switch to production only when ready:

```typescript
const client = new EcontClient({
  username: "your-prod-username",
  password: "your-prod-password",
  environment: "production",
});
```

---

## 📚 Additional Resources

- **Type Definitions:** All types are exported from `src/types/`
- **Examples:** See `examples/` directory for working code
- **Tests:** See `tests/` directory for comprehensive usage examples
- **API Documentation:** Original HTML documentation in project root

---

## 🔗 Quick Links

- [README.md](./README.md) - Getting started guide
- [ENDPOINT_COVERAGE.md](./ENDPOINT_COVERAGE.md) - All 26 endpoints documented
- [FINAL_STATUS.md](./FINAL_STATUS.md) - Project completion status
- [examples/](./examples/) - Working code examples
