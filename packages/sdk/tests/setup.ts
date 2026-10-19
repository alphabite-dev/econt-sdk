import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env file in the root directory
config({ path: resolve(__dirname, "../../../.env") });
