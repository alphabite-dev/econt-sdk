import { HttpClient } from "./utils/http";
import { API_BASE_URLS } from "./constants";
import { EcontConfig } from "@alphabite/econt-types";
import { Offices } from "./resources/offices";
import { AddressService } from "./resources/address";
import { Shipments } from "./resources/shipments";
import { Tracking } from "./resources/tracking";
import { ProfileService } from "./resources/profile";
import { ThreeWayLogisticsService } from "./resources/threewaylogistics";
import { PaymentReportService } from "./resources/paymentreport";

/**
 * Main Econt SDK client
 */
export class EcontClient {
  private http: HttpClient;

  public readonly offices: Offices;
  public readonly address: AddressService;
  public readonly shipments: Shipments;
  public readonly tracking: Tracking;
  public readonly profile: ProfileService;
  public readonly threeWayLogistics: ThreeWayLogisticsService;
  public readonly paymentReport: PaymentReportService;

  constructor(config: EcontConfig) {
    // Validate credentials
    if (!config.username || config.username.trim() === "") {
      throw new Error("Username is required");
    }
    if (!config.password || config.password.trim() === "") {
      throw new Error("Password is required");
    }

    // Determine base URL
    const baseURL = config.environment === "demo" ? API_BASE_URLS.demo : API_BASE_URLS.production;

    // Initialize HTTP client
    this.http = new HttpClient({
      baseURL,
      username: config.username,
      password: config.password,
      timeout: config.timeout,
      maxRetries: config.maxRetries,
    });

    // Initialize resources
    this.offices = new Offices(this.http);
    this.address = new AddressService(this.http);
    this.shipments = new Shipments(this.http);
    this.tracking = new Tracking(this.http);
    this.profile = new ProfileService(this.http);
    this.threeWayLogistics = new ThreeWayLogisticsService(this.http);
    this.paymentReport = new PaymentReportService(this.http);
  }
}
