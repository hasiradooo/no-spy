import { describe, expect, test } from "bun:test";
import { cleanUrl } from "./clean-url";

describe("cleanUrl", () => {
	test("removes repeated and encoded tracking keys without changing useful parameters", () => {
		const result = cleanUrl(
			"https://example.com/find?q=green%20tea&%75tm_source=a&fbclid=b&utm_source=c&sort=new#results",
		);
		expect(result.cleaned).toBe("https://example.com/find?q=green%20tea&sort=new#results");
		expect(result.removed).toHaveLength(3);
		expect(result.kept).toBe(2);
	});
	test("keeps resource IDs, blank values, duplicates, timestamps and fragments", () => {
		const link = "https://youtube.com/watch?v=abc&t=30&list=xyz&x=&x=two#chapter";
		expect(cleanUrl(link).cleaned).toBe(link);
	});
	test("handles platform-specific share IDs without removing arbitrary si parameters", () => {
		expect(cleanUrl("https://youtu.be/abc?si=tracking&t=42").cleaned).toBe(
			"https://youtu.be/abc?t=42",
		);
		expect(cleanUrl("https://example.com/?si=useful").kept).toBe(1);
	});
	test("handles Amazon affiliate tags without changing product IDs", () => {
		expect(cleanUrl("https://www.amazon.com/dp/B123?tag=affiliate&th=1").cleaned).toBe(
			"https://www.amazon.com/dp/B123?th=1",
		);
		expect(cleanUrl("https://example.com/?tag=books").kept).toBe(1);
	});
	test("removes a and s from the reported X share-link format", () => {
		const result = cleanUrl(
			"https://x.com/example/status/2115497330082504960?a=share-token&s=20",
		);
		expect(result.cleaned).toBe("https://x.com/example/status/2115497330082504960");
		expect(result.removed.map((parameter) => parameter.name)).toEqual(["a", "s"]);
	});
	test("cleans old and new share tokens across Twitter/X host variants", () => {
		for (const host of [
			"x.com",
			"www.x.com",
			"mobile.x.com",
			"twitter.com",
			"www.twitter.com",
			"mobile.twitter.com",
		]) {
			expect(
				cleanUrl(`https://${host}/example/status/123?a=new&s=20&t=old#replies`).cleaned,
			).toBe(`https://${host}/example/status/123#replies`);
		}
	});
	test("preserves useful Twitter search parameters and exact encoding", () => {
		expect(
			cleanUrl("https://x.com/search?q=green%20tea&f=live&a=share-token&s=20").cleaned,
		).toBe("https://x.com/search?q=green%20tea&f=live");
	});
	test("preserves Twitter redirect tokens while removing ordinary campaign tags", () => {
		for (const host of ["x.com", "twitter.com"]) {
			expect(
				cleanUrl(`https://${host}/i/redirect?t=destination-token&utm_source=share`).cleaned,
			).toBe(`https://${host}/i/redirect?t=destination-token`);
		}
	});
	test("keeps a, s and t on unrelated or lookalike domains", () => {
		for (const host of [
			"example.com",
			"youtube.com",
			"notx.com",
			"x.com.example.com",
			"twitter.com.example.com",
		]) {
			const link = `https://${host}/?a=useful&s=search&t=42`;
			expect(cleanUrl(link).cleaned).toBe(link);
		}
	});
	test("removes repeated and encoded X share parameter names", () => {
		const result = cleanUrl(
			"https://x.com/example/status/123?%61=first&a=second&s=20&utm_source=share",
		);
		expect(result.cleaned).toBe("https://x.com/example/status/123");
		expect(result.removed).toHaveLength(4);
	});
	test("can remove all query parameters while preserving a fragment", () => {
		expect(cleanUrl("https://example.com/search?q=tea&page=2#top", true).cleaned).toBe(
			"https://example.com/search#top",
		);
	});
	test("does not treat a question mark inside a fragment as query parameters", () => {
		expect(cleanUrl("https://example.com/#route?utm_source=app").removed).toHaveLength(0);
	});
	test("accepts missing schemes and trims pasted whitespace", () => {
		expect(cleanUrl("  example.com/article?utm_medium=email  ").cleaned).toBe(
			"https://example.com/article",
		);
	});
	test("rejects empty, malformed, non-web and multiple links", () => {
		for (const invalid of [
			"",
			"hello",
			"https://",
			"javascript:alert(1)",
			"ftp://example.com",
			"https://a.com\nhttps://b.com",
		]) {
			expect(() => cleanUrl(invalid)).toThrow();
		}
	});
	test("preserves exact query encoding and signed values when nothing is removed", () => {
		const link = "https://example.com/?id=123&sig=a%2fb%2Bc+z&empty=#x";
		expect(cleanUrl(link).cleaned).toBe(link);
	});
});
