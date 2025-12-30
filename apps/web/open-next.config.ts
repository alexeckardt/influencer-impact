// Configuration for @opennextjs/cloudflare
import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";

export default defineCloudflareConfig({
	// Disable incremental cache to avoid compatibility issues
	incrementalCache: "dummy",
	tagCache: "dummy",
});
