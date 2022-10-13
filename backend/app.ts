import {
    Application,
    Router,
    send,
    Context,
} from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { parse } from "https://deno.land/std@0.159.0/flags/mod.ts";
import type { WoL } from "./types.ts";

const getDirname = () => {
    let path = new URL(import.meta.url).pathname;
    path = path.replace(/^[/]([A-Z]:)/, "$1");
    path = path.replace(/[/][^/]+$/, "");
    return path;
};

const setJsonHeader = (ctx: Context) =>
    ctx.response.headers.set("Content-Type", "application/json");

const args = parse(Deno.args);

const port = args.port ?? args.p ?? 8080;
const dirname = getDirname();

const router = new Router({ prefix: "/api" });

router.get("/", async (ctx) => {
    setJsonHeader(ctx);

    const data = await Deno.readTextFile(`${dirname}/data.json`);

    ctx.response.body = JSON.parse(data);
});

router.post("/", async (ctx) => {
    setJsonHeader(ctx);

    const wol: WoL = await ctx.request.body().value;
    console.info(`Waking up "${wol.name}"`);

    Deno.run({
        cmd: ["wake", "em0", wol.mac],
    });
});

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

app.use(async (ctx, next) => {
    await send(ctx, ctx.request.url.pathname, {
        root: `${dirname}/../frontend`,
        index: "index.html",
    });
    await next();
});

app.addEventListener("listen", ({ secure, hostname, port }) => {
    const protocol = secure ? "https" : "http";
    const host = hostname === "0.0.0.0" ? "localhost" : hostname ?? "localhost";
    console.info(`Listening on ${protocol}://${host}:${port}`);
});

await app.listen({ port });
