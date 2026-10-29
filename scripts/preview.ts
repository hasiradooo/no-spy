import { stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

const root = resolve(import.meta.dir, "../out");
const port = Number(process.env.PORT ?? 3000);
const server = Bun.serve({
	hostname: "127.0.0.1",
	port,
	async fetch(request) {
		if (request.method !== "GET" && request.method !== "HEAD")
			return new Response("Method not allowed", { status: 405 });
		let path: string;
		try {
			path = resolve(root, `.${decodeURIComponent(new URL(request.url).pathname)}`);
		} catch {
			return new Response("Bad request", { status: 400 });
		}
		if (path !== root && !path.startsWith(root + sep))
			return new Response("Not found", { status: 404 });
		try {
			if ((await stat(path)).isDirectory()) path = resolve(path, "index.html");
		} catch {
			if (!extname(path)) path = resolve(path, "index.html");
		}
		const file = Bun.file(path);
		if (!(await file.exists()))
			return new Response(Bun.file(resolve(root, "404.html")), { status: 404 });
		return new Response(request.method === "HEAD" ? null : file, {
			headers: { "Content-Type": file.type, "Cache-Control": "no-store" },
		});
	},
});
console.log(`no spy is ready at http://127.0.0.1:${server.port}`);
