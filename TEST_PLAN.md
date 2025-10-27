# Econt SDK - Complete Test Plan

## API Endpoint Coverage Checklist

### 1. Nomenclatures Service ✅ COMPLETED (5/5)

- [x] getCountries - List all countries
- [x] getCities - List cities (with filters)
- [x] getOffices - List offices (with filters)
- [x] getStreets - Search streets in a city
- [x] getQuarters - Get quarters/neighborhoods in a city

### 2. AddressService (0/3)

- [ ] validateAddress - Validate an address
- [ ] addressServiceTimes - Get service times for an address
- [ ] getNearestOffices - Find nearest offices to an address

### 3. LabelService (0/8)

- [ ] createLabel - Create a single shipping label
- [ ] createLabels - Create multiple shipping labels
- [ ] deleteLabels - Delete/cancel labels
- [ ] updateLabel - Update a label
- [ ] checkPossibleShipmentEditions - Check if shipment can be edited
- [ ] updateLabels - Update multiple labels
- [ ] grouping - Group shipments
- [ ] groupingCancelation - Cancel grouping

### 4. ShipmentService (0/6)

- [ ] requestCourier - Request courier pickup
- [ ] getShipmentStatuses - Track shipment status
- [ ] getRequestCourierStatus - Get courier request status
- [ ] getMyAWB - Get AWB (Air Waybill) number
- [ ] setTUCode - Set transport unit code
- [ ] calculateShipping - Calculate shipping cost

### 5. ProfileService (0/2)

- [ ] getClientProfiles - Get client profiles
- [ ] createCDAgreement - Create cash-on-delivery agreement

### 6. ThreeWayLogisticsService (0/1)

- [ ] threeWayLogistics - 3-way logistics operations

### 7. PaymentReportService (0/1)

- [ ] PaymentReport - Get payment reports

## Total Progress: 5/26 endpoints (19%)

## Implementation Strategy

1. **Phase 1: Nomenclatures** ✅ DONE
2. **Phase 2: AddressService** - NEXT
3. **Phase 3: LabelService** - Core functionality
4. **Phase 4: ShipmentService** - Tracking & management
5. **Phase 5: ProfileService** - User management
6. **Phase 6: Advanced Services** - ThreeWayLogistics, PaymentReport

## Data Types to Update

Based on documentation review:

- [ ] Address type - needs all fields from docs
- [ ] City type - ✅ already updated
- [ ] Country type - ✅ already updated
- [ ] Office type - ✅ already updated
- [ ] Label/Shipment types - need complete review
- [ ] Tracking types - need complete review
- [ ] Service time types - missing
- [ ] Payment types - missing
- [ ] Profile types - missing
