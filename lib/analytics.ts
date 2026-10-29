import type { BeforeSendEvent } from "@vercel/analytics/next";

/** Only count page views; don't include query strings, fragments, or form state. */
export function sanitizeAnalyticsEvent(event: BeforeSendEvent): BeforeSendEvent | null {
	if (event.type !== "pageview") return null;
	try {
		const url = new URL(event.url);
		return { ...event, url: url.origin + url.pathname };
	} catch {
		return null;
	}
}
