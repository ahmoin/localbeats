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

	if (!rawUrl) {
		res.writeHead(400, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ error: "url param required" }));
		return;
	}

	if (!ytdl.validateURL(rawUrl)) {
		res.writeHead(400, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ error: "invalid YouTube URL" }));
		return;
	}

	try {
		const info = await ytdl.getInfo(rawUrl);
		const title = info.videoDetails.title.replace(/[^\w\s-]/g, "").trim();
		const artist = info.videoDetails.author.name;
		const duration = Number(info.videoDetails.lengthSeconds);

		let format = ytdl.chooseFormat(info.formats, {
			quality: "highestaudio",
			filter: (f) =>
				f.container === "mp4" &&
				!!f.audioBitrate &&
				!f.videoCodec,
		});

		if (!format) {
			format = ytdl.chooseFormat(info.formats, {
				quality: "highestaudio",
				filter: "audioonly",
			});
		}

		const ext = format.container ?? "m4a";

		res.writeHead(200, {
			"Content-Type": format.mimeType ?? "audio/mp4",
			"Content-Disposition": `attachment; filename="${title}.${ext}"`,
			"X-Track-Title": encodeURIComponent(title),
			"X-Track-Artist": encodeURIComponent(artist),
			"X-Track-Duration": String(duration),
			"X-Track-Ext": ext,
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Expose-Headers":
				"X-Track-Title,X-Track-Artist,X-Track-Duration,X-Track-Ext",
		});

		ytdl
			.downloadFromInfo(info, { format })
			.on("error", () => res.end())
			.pipe(res as unknown as NodeJS.WritableStream);
	} catch (err) {
		if (!res.headersSent) {
			res.writeHead(500, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ error: "download failed" }));
		}
	}
}
