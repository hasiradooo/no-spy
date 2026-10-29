export type RemovedParameter = { name: string; value: string };
export type CleanResult = {
	original: string;
	cleaned: string;
	removed: RemovedParameter[];
	kept: number;
};

const TRACKERS = new Set([
	"fbclid",
	"gclid",
	"dclid",
	"gbraid",
	"wbraid",
	"msclkid",
	"ttclid",
	"twclid",
	"yclid",
	"igshid",
	"igsh",
	"srsltid",
	"mc_cid",
	"mc_eid",
	"_ga",
	"_gl",
	"_hsenc",
	"_hsmi",
	"mkt_tok",
	"oly_anon_id",
	"oly_enc_id",
	"vero_id",
	"vero_conv",
	"rb_clickid",
	"wickedid",
	"epik",
	"sc_cid",
	"trk",
	"trkinfo",
	"ref_src",
	"ref_url",
	"icid",
	"irclickid",
	"irgwc",
	"fb_action_ids",
	"fb_action_types",
	"fb_source",
	"ncid",
	"s_cid",
]);

function isTracking(name: string, hostname: string, pathname: string): boolean {
	const key = name.toLowerCase();
	if (key.startsWith("utm_") || TRACKERS.has(key)) return true;
	const host = hostname.toLowerCase().replace(/^www\./, "");
	// Share tokens are site-specific: t is a useful timestamp on other sites.
	// Twitter's redirect endpoint can need t to resolve its destination.
	if (
		/(?:^|\.)(?:x|twitter)\.com$/.test(host) &&
		!/^\/i\/redirect\/?$/i.test(pathname) &&
		["a", "s", "t"].includes(key)
	)
		return true;
	if (
		(host === "youtu.be" ||
			host === "youtube.com" ||
			host.endsWith(".youtube.com") ||
			host === "open.spotify.com") &&
		key === "si"
	)
		return true;
	if (
		/^(?:[a-z0-9-]+\.)*amazon\.(?:com|co\.uk|de|fr|it|es|pl|nl|ca|co\.jp|com\.au|in)$/.test(
			host,
		)
	) {
		return [
			"tag",
			"linkcode",
			"camp",
			"creative",
			"creativeasin",
			"ascsubtag",
			"ref_",
		].includes(key);
	}
	return false;
}

/** Never fetch the link. Preserve the raw encoding of parameters we keep. */
export function cleanUrl(input: string, removeAll = false): CleanResult {
	const trimmed = input.trim();
	if (!trimmed) throw new Error("Paste a link to get started.");
	if (trimmed.length > 20000)
		throw new Error("This link is a little too long. Try one under 20,000 characters.");
	if (/[\r\n\t]/.test(trimmed)) throw new Error("Please paste one link at a time.");

	const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(trimmed);
	let url: URL;
	try {
		url = new URL(
			hasScheme
				? trimmed
				: trimmed.startsWith("//")
					? `https:${trimmed}`
					: `https://${trimmed}`,
		);
	} catch {
		throw new Error("That link doesn’t look quite right. Try a full website address.");
	}
	if (!["http:", "https:"].includes(url.protocol))
		throw new Error("Use a link that starts with https:// or http://.");
	if (
		!hasScheme &&
		!url.hostname.includes(".") &&
		url.hostname !== "localhost" &&
		!url.hostname.startsWith("[")
	) {
		throw new Error("Add a website address, like example.com.");
	}

	const removed: RemovedParameter[] = [];
	const retained: string[] = [];
	let kept = 0;
	const rawQuery = url.search.slice(1);
	if (rawQuery) {
		for (const part of rawQuery.split("&")) {
			if (!part) {
				retained.push(part);
				continue;
			}
			const pair = [...new URLSearchParams(part).entries()][0];
			const [name, value] = pair ?? ["", ""];
			if (removeAll || isTracking(name, url.hostname, url.pathname))
				removed.push({ name, value });
			else {
				retained.push(part);
				kept++;
			}
		}
	}

	const original = url.href;
	const hashAt = original.indexOf("#");
	const withoutHash = hashAt === -1 ? original : original.slice(0, hashAt);
	const hash = hashAt === -1 ? "" : original.slice(hashAt);
	const questionAt = withoutHash.indexOf("?");
	const base = questionAt === -1 ? withoutHash : withoutHash.slice(0, questionAt);
	const query = retained.join("&");
	return {
		original,
		cleaned: removed.length === 0 ? original : `${base}${query ? `?${query}` : ""}${hash}`,
		removed,
		kept,
	};
}
