import { EcontAPIError, EcontAuthenticationError, EcontNetworkError, EcontRateLimitError } from "./errors";
import { DEFAULT_TIMEOUT, SDK_VERSION } from "../constants";

export interface HttpClientConfig {
  baseURL: string;
  username: string;
  password: string;
  timeout?: number;
  maxRetries?: number;
}

type QueryValue = string | number | boolean | null | undefined;

export interface HttpRequestConfig {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  data?: object;
  params?: Record<string, QueryValue | QueryValue[]>;
  headers?: Record<string, string>;
  /** "json" (default) parses the body as JSON and falls back to the raw text; "text" returns the raw text. */
  responseType?: "json" | "text";
  timeout?: number;
}

export interface HttpResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

/** Joins the base URL and a path with exactly one slash; an absolute URL is used as is. */
function buildURL(baseURL: string, url: string, params?: HttpRequestConfig["params"]): string {
  const full = /^https?:\/\//i.test(url) ? url : `${baseURL.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`;

  if (!params) return full;

  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item !== undefined && item !== null) search.append(key, String(item));
    }
  }

  const query = search.toString();

  return query ? `${full}${full.includes("?") ? "&" : "?"}${query}` : full;
}

function parseBody(text: string, responseType: HttpRequestConfig["responseType"]): unknown {
  if (responseType === "text" || text === "") return text;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Thin HTTP client over the platform `fetch` (Node 18+). Every request carries HTTP Basic auth; failures are
 * mapped onto the SDK's error classes.
 */
export class HttpClient {
  private readonly baseURL: string;
  private readonly timeout: number;
  private readonly headers: Record<string, string>;

  constructor(config: HttpClientConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
    this.headers = {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
      "User-Agent": `econt-sdk/${SDK_VERSION}`,
      Authorization: `Basic ${Buffer.from(`${config.username}:${config.password}`).toString("base64")}`,
    };
  }

  async request<T>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
    let response: Response;

    try {
      response = await fetch(buildURL(this.baseURL, config.url, config.params), {
        method: config.method ?? "GET",
        headers: { ...this.headers, ...config.headers },
        body: config.data === undefined ? undefined : JSON.stringify(config.data),
        signal: AbortSignal.timeout(config.timeout ?? this.timeout),
      });
    } catch (error) {
      const name = (error as { name?: string } | null)?.name;

      if (name === "TimeoutError" || name === "AbortError") {
        throw new EcontNetworkError("Request timeout");
      }

      throw new EcontNetworkError("Network error - no response received");
    }

    let text: string;

    try {
      text = await response.text();
    } catch (error) {
      const name = (error as { name?: string } | null)?.name;

      throw new EcontNetworkError(
        name === "TimeoutError" || name === "AbortError" ? "Request timeout" : "Network error - response interrupted"
      );
    }

    const data = parseBody(text, config.responseType);

    if (!response.ok) {
      const { status } = response;

      if (status === 401 || status === 403) {
        throw new EcontAuthenticationError();
      }

      if (status === 429) {
        const retryAfter = response.headers.get("retry-after");

        throw new EcontRateLimitError("Rate limit exceeded", retryAfter ? parseInt(retryAfter) : undefined);
      }

      throw EcontAPIError.fromResponse(status, data, response.headers);
    }

    return { data: data as T, status: response.status, headers: response.headers };
  }

  async get<T>(url: string, config?: Omit<HttpRequestConfig, "url" | "method" | "data">): Promise<T> {
    return (await this.request<T>({ ...config, url, method: "GET" })).data;
  }

  async post<T>(url: string, data?: object, config?: Omit<HttpRequestConfig, "url" | "method" | "data">): Promise<T> {
    return (await this.request<T>({ ...config, url, method: "POST", data })).data;
  }

  async put<T>(url: string, data?: object, config?: Omit<HttpRequestConfig, "url" | "method" | "data">): Promise<T> {
    return (await this.request<T>({ ...config, url, method: "PUT", data })).data;
  }

  async delete<T>(url: string, config?: Omit<HttpRequestConfig, "url" | "method" | "data">): Promise<T> {
    return (await this.request<T>({ ...config, url, method: "DELETE" })).data;
  }

  async patch<T>(url: string, data?: object, config?: Omit<HttpRequestConfig, "url" | "method" | "data">): Promise<T> {
    return (await this.request<T>({ ...config, url, method: "PATCH", data })).data;
  }
}
