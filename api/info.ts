import ytdl from "@distube/ytdl-core";
import type { IncomingMessage, ServerResponse } from "node:http";

export const config = { runtime: "nodejs" };

export default async function handler(
	req: IncomingMessage & { query?: Record<string, string> },
	res: ServerResponse,
) {
	const rawUrl =
		req.query?.url ??
		new URL(req.url ?? "", "http://localhost").searchParams.get("url") ??
		"";

	if (!rawUrl || !ytdl.validateURL(rawUrl)) {
		res.writeHead(400, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ error: "invalid url" }));
		return;
	}

	try {
		const info = await ytdl.getInfo(rawUrl);
		const title = info.videoDetails.title.replace(/[^\w\s-]/g, "").trim();
		const artist = info.videoDetails.author.name;
		const duration = Number(info.videoDetails.lengthSeconds);

		res.writeHead(200, {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
		});
		res.end(JSON.stringify({ title, artist, duration }));
	} catch {
		res.writeHead(500, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ error: "failed" }));
	}
}
