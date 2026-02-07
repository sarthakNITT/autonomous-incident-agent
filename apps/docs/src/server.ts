import { loadConfig } from "../../../shared/config_loader";
import { GettingStarted } from "./pages/GettingStarted";
import { ConfigReference } from "./pages/Config";
import { Architecture } from "./pages/Architecture";

const config = loadConfig();
const PORT = config.services.docs.port;

const server = Bun.serve({
    port: PORT,
    fetch(req) {
        const url = new URL(req.url);

        if (url.pathname === "/") {
            return new Response(GettingStarted, { headers: { "Content-Type": "text/html" } });
        }

        if (url.pathname === "/config") {
            return new Response(ConfigReference, { headers: { "Content-Type": "text/html" } });
        }

        if (url.pathname === "/architecture") {
            return new Response(Architecture, { headers: { "Content-Type": "text/html" } });
        }

        return new Response("Not Found", { status: 404 });
    }
});

console.log(`Docs Site listening on http://localhost:${PORT}`);
