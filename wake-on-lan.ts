// deno run --allow-net=0.0.0.0 --allow-read=/data/config --allow-run=wakeonlan wake-on-lan.ts -p 8080 -c /data/config/wake-on-lan.json

import { serve } from "https://deno.land/std@0.126.0/http/server.ts";
import { parse } from "https://deno.land/std@0.129.0/flags/mod.ts";

const args = parse(Deno.args);

const config = new URL(args.config ?? args.c ?? null, import.meta.url);
const port = args.port ?? args.p ?? 8080;

const getRequestPath = (request: Request): string =>
    request.url.split(/^https?:[/][/]+[^/]+/)[1].split(/[?#]/)[0];

const getData = async (key: string): Promise<string> => {
    const text = await Deno.readTextFile(config);
    const json = JSON.parse(text);
    return json[key];
};

const wake = async (json): Promise<boolean> => {
    const wol = Deno.run({
        cmd: ["wakeonlan", "-i", json.ip, "-p", json.port, json.mac],
    });
    const status = await wol.status();
    return status.success;
};

const handler = async (request: Request): Promise<Response> => {
    const path = getRequestPath(request);
    if (path !== "/") return new Response(null, { status: 404 });

    const key = "test";
    const data = getData(key);

    let response: Response;
    if (await wake(data)) {
        response = new Response(
            "Sending the Wake on LAN magic packet was successful!"
        );
    } else {
        response = new Response(
            "Failed to send the Wake on LAN magic packet!",
            { status: 500 }
        );
    }
    return response;
};

serve(handler, { port });
console.log(`Listening on http://localhost:${port}`);
