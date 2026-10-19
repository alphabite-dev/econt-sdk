# @alphabite/econt-types

TypeScript type definitions for the Econt shipping API.

## Installation

```bash
npm install @alphabite/econt-types
```

## Usage

This package contains all TypeScript type definitions for the Econt shipping API. It can be used standalone or is automatically included when you install `@alphabite/econt-sdk`.

```typescript
import { Office, ShippingLabel, EcontConfig, City, Country } from "@alphabite/econt-types";

// Use the types in your application
const config: EcontConfig = {
  username: "your-username",
  password: "your-password",
  environment: "demo",
};
```

## Available Types

This package exports types for:

- **Common**: `EcontConfig`, `City`, `Country`, `Address`, etc.
- **Offices**: `Office`, `GetOfficesRequest`, `GetOfficesResponse`
- **Shipments**: `ShippingLabel`, `CreateLabelRequest`, `CreateLabelResponse`
- **Tracking**: `ShipmentStatus`, `GetShipmentStatusesRequest`
- **Address**: `ValidateAddressRequest`, `AddressServiceTimesRequest`
- **Profile**: `GetClientProfilesResponse`, `CreateCDAgreementRequest`
- **Nomenclatures**: `Street`, `Quarter`, nomenclature types
- **Errors**: `EcontApiError`
- **Payment Reports**: `PaymentReportRequest`, `PaymentReportResponse`
- **Three Way Logistics**: `ThreeWayLogisticsRequest`, `ThreeWayLogisticsResponse`

## Why Separate Package?

This types package is published separately to allow:

1. **Type-only dependencies**: Use types in your project without including the full SDK
2. **Smaller bundle size**: Only install types if you're implementing your own client
3. **Version flexibility**: Lock types independently from SDK implementation
4. **Shared types**: Use the same types across multiple projects

## Related Packages

- [@alphabite/econt-sdk](https://www.npmjs.com/package/@alphabite/econt-sdk) - Full SDK that includes these types

## License

MIT

## Repository

[GitHub](https://github.com/alphabite-dev/econt-sdk)
