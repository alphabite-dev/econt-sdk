import { createServer, IncomingMessage, Server, ServerResponse } from "node:http";
import { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { HttpClient } from "../../src/utils/http";
import {
  EcontAPIError,
  EcontAuthenticationError,
  EcontNetworkError,
  EcontRateLimitError,
} from "../../src/utils/errors";

interface Seen {
  method?: string;
  url?: string;
  headers: IncomingMessage["headers"];
  body: string;
}

type Handler = (req: IncomingMessage, res: ServerResponse) => void;

const routes: Record<string, Handler> = {
  "/api/ok": (_req, res) => res.writeHead(200, { "Content-Type": "application/json" }).end('{"cities":[1,2]}'),
  "/api/text": (_req, res) => res.writeHead(200, { "Content-Type": "text/csv" }).end("id,name\n1,Sofia"),
  "/api/not-json": (_req, res) => res.writeHead(200).end("plain words"),
  "/api/empty": (_req, res) => res.writeHead(200).end(),
  "/api/401": (_req, res) => res.writeHead(401).end(),
  "/api/403": (_req, res) => res.writeHead(403).end(),
  "/api/429": (_req, res) => res.writeHead(429, { "Retry-After": "7" }).end(),
  "/api/500-json": (_req, res) =>
    res
      .writeHead(500, { "Content-Type": "application/json", "X-Request-Id": "req-42" })
      .end('{"type":"ExInvalidParam","message":"City not found"}'),
  "/api/502-html": (_req, res) => res.writeHead(502).end("<html>Bad gateway</html>"),
  "/api/slow": () => {
    /* never answers */
  },
};

let server: Server;
let baseURL: string;
let seen: Seen;

beforeAll(async () => {
  server = createServer((req, res) => {
    let body = "";

    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      seen = { method: req.method, url: req.url, headers: req.headers, body };
      const route = routes[(req.url ?? "").split("?")[0]];

      if (route) route(req, res);
      else res.writeHead(404).end();
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseURL = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/`;
});

afterAll(() => {
  server.closeAllConnections();
  server.close();
});

const client = (timeout?: number) => new HttpClient({ baseURL, username: "iasp-dev", password: "1Asp-dev", timeout });

describe("HttpClient (fetch)", () => {
  it("POSTs JSON with Basic auth and returns the parsed body", async () => {
    await expect(client().post("/ok", { countryCode: "BGR" })).resolves.toEqual({ cities: [1, 2] });
    expect(seen.method).toBe("POST");
    expect(seen.url).toBe("/api/ok");
    expect(JSON.parse(seen.body)).toEqual({ countryCode: "BGR" });
    expect(seen.headers["content-type"]).toBe("application/json");
    expect(seen.headers["user-agent"]).toMatch(/^econt-sdk\//);
    expect(seen.headers.authorization).toBe(`Basic ${Buffer.from("iasp-dev:1Asp-dev").toString("base64")}`);
  });

  it("sends no body when there is no data", async () => {
    await client().post("ok");
    expect(seen.body).toBe("");
  });

  it("serializes query params and skips empty ones", async () => {
    await client().get("ok", { params: { a: 1, b: undefined, c: ["x", "y"], d: null } });
    expect(seen.url).toBe("/api/ok?a=1&c=x&c=y");
  });

  it("returns raw text for responseType text, and for a body that is not JSON", async () => {
    await expect(client().post("text", {}, { responseType: "text" })).resolves.toBe("id,name\n1,Sofia");
    await expect(client().post("not-json")).resolves.toBe("plain words");
    await expect(client().post("empty")).resolves.toBe("");
  });

  it("exposes status and headers through request()", async () => {
    const response = await client().request<{ cities: number[] }>({ method: "POST", url: "ok" });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/json");
    expect(response.data.cities).toEqual([1, 2]);
  });

  it.each(["401", "403"])("maps %s to EcontAuthenticationError", async (code) => {
    await expect(client().post(code)).rejects.toBeInstanceOf(EcontAuthenticationError);
  });

  it("maps 429 to EcontRateLimitError with retryAfter", async () => {
    const error = await client().post("429").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(EcontRateLimitError);
    expect((error as EcontRateLimitError).retryAfter).toBe(7);
  });

  it("maps any other non-2xx to EcontAPIError carrying the API's message, body and request id", async () => {
    const error = await client().post("500-json").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(EcontAPIError);
    expect(error).toMatchObject({
      message: "City not found",
      statusCode: 500,
      response: { type: "ExInvalidParam", message: "City not found" },
      requestId: "req-42",
    });
  });

  it("falls back to the status text when the error body is not JSON", async () => {
    const error = await client().post("502-html").catch((e: unknown) => e);

    expect(error).toMatchObject({ message: "Request failed with status code 502", statusCode: 502, response: undefined });
  });

  it("maps a timeout to EcontNetworkError('Request timeout')", async () => {
    const error = await client(150).post("slow").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(EcontNetworkError);
    expect((error as Error).message).toBe("Request timeout");
  });

  it("maps a refused connection to EcontNetworkError", async () => {
    const dead = new HttpClient({ baseURL: "http://127.0.0.1:1/", username: "u", password: "p" });
    const error = await dead.post("x").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(EcontNetworkError);
    expect((error as Error).message).toBe("Network error - no response received");
  });
});
