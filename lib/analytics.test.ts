import { expect, test } from "bun:test";
import { sanitizeAnalyticsEvent } from "./analytics";

test("analytics includes only the page URL without query strings or fragments", () => {
	expect(
		sanitizeAnalyticsEvent({
			type: "pageview",
			url: "https://no-spy.example/?link=https%3A%2F%2Fprivate.example%2F#secret",
		}),
	).toEqual({ type: "pageview", url: "https://no-spy.example/" });
});

test("analytics ignores custom events and malformed URLs", () => {
	expect(sanitizeAnalyticsEvent({ type: "event", url: "https://no-spy.example/" })).toBeNull();
	expect(sanitizeAnalyticsEvent({ type: "pageview", url: "not-a-url" })).toBeNull();
});
