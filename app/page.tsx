"use client";

import { ChevronDown, Copy, EyeOff, X } from "lucide-react";
import { type FormEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { type CleanResult, cleanUrl } from "@/lib/clean-url";

const examples = [
	{
		label: "article",
		url: "https://example.com/a-good-read?utm_source=newsletter&utm_medium=email&utm_campaign=weekend",
	},
	{
		label: "video",
		url: "https://www.youtube.com/watch?v=jfKfPfyJRdk&si=sharing-id&utm_source=share&t=42",
	},
	{
		label: "shopping link",
		url: "https://www.amazon.com/dp/B0EXAMPLE?tag=affiliate-20&utm_source=social&th=1",
	},
];

function Brand() {
	return (
		<span className="brand">
			<EyeOff size={23} strokeWidth={1.7} aria-hidden="true" />
			<span>no spy.</span>
		</span>
	);
}

function Privacy() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="ghost" className="privacy-button">
					the privacy bit
				</Button>
			</DialogTrigger>
			<DialogContent className="privacy-dialog">
				<DialogHeader>
					<DialogTitle>your links. none of our business.</DialogTitle>
					<DialogDescription>Here’s the boring but useful bit.</DialogDescription>
				</DialogHeader>
				<div className="privacy-details">
					<p>
						<strong>It stays in this tab.</strong> Your browser cleans the link. We
						don’t upload it, open it, or keep a history. Close or reload the tab and
						it’s gone.
					</p>
					<p>
						<strong>Just the boring stats.</strong> On Vercel, cookie-free analytics
						counts visits. It never gets the links you paste. The cleaner adds no
						cookies, and strips page query strings and fragments from analytics. Hosting
						providers may also keep standard access logs.
					</p>
					<p>
						<strong>Still not an invisibility cloak.</strong> We remove known trackers
						from the URL. The destination can still track visits. Shortened links and
						tracking hidden in paths or fragments aren’t cleaned.
					</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default function Home() {
	const [input, setInput] = useState("");
	const [removeAll, setRemoveAll] = useState(false);
	const [result, setResult] = useState<CleanResult | null>(null);
	const [error, setError] = useState("");
	const [copied, setCopied] = useState(false);
	const [clipboardNotice, setClipboardNotice] = useState("");
	const [showRemoved, setShowRemoved] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const outputRef = useRef<HTMLInputElement>(null);
	const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	function resetOutput() {
		setResult(null);
		setError("");
		setCopied(false);
		setClipboardNotice("");
		setShowRemoved(false);
		if (copyTimer.current) clearTimeout(copyTimer.current);
	}

	function runClean(value = input, all = removeAll) {
		resetOutput();
		try {
			setResult(cleanUrl(value, all));
		} catch (err) {
			setError(err instanceof Error ? err.message : "Please check your link and try again.");
			inputRef.current?.focus();
		}
	}

	function handleSubmit(event: FormEvent) {
		event.preventDefault();
		runClean();
	}

	async function copyLink() {
		if (!result) return;
		try {
			await navigator.clipboard.writeText(result.cleaned);
			setCopied(true);
			setClipboardNotice("");
			if (copyTimer.current) clearTimeout(copyTimer.current);
			copyTimer.current = setTimeout(() => setCopied(false), 2400);
		} catch {
			outputRef.current?.focus();
			outputRef.current?.select();
			setClipboardNotice("Clipboard said no. Press Ctrl+C or ⌘C to copy the selected link.");
		}
	}

	return (
		<div className="site-shell" id="top">
			<header className="site-header">
				<a href="#top" className="brand-link" aria-label="no spy home">
					<Brand />
				</a>
				<Privacy />
			</header>

			<main>
				<section className="hero" aria-labelledby="hero-title">
					<h1 id="hero-title">
						same page.
						<br />
						less shit.
					</h1>
					<p>
						Remove the tracking crap from your links.
						<br />
						Send the page. Keep your business.
					</p>
				</section>

				<section className="cleaner-section" aria-label="Link cleaner">
					<div className="cleaner-card">
						<form onSubmit={handleSubmit} noValidate>
							<div className="input-label-row">
								<label htmlFor="original-url">the link with all the crap</label>
								<span id="paste-hint" className="paste-hint">
									Ctrl / ⌘ + V
								</span>
							</div>
							<div className={`url-entry ${error ? "has-error" : ""}`}>
								<Input
									ref={inputRef}
									id="original-url"
									type="text"
									inputMode="url"
									autoComplete="off"
									autoCorrect="off"
									autoCapitalize="none"
									spellCheck={false}
									maxLength={20000}
									className="url-input"
									value={input}
									placeholder="https://example.com/?utm_whatever…"
									onChange={(e) => {
										setInput(e.target.value);
										resetOutput();
									}}
									aria-invalid={!!error}
									aria-describedby={error ? "url-error" : "paste-hint link-help"}
								/>
								{input && (
									<Button
										variant="ghost"
										size="icon"
										type="button"
										className="clear-button"
										aria-label="Clear link"
										onClick={() => {
											setInput("");
											resetOutput();
											inputRef.current?.focus();
										}}
									>
										<X size={15} />
									</Button>
								)}
								<Button type="submit" className="clean-button">
									clean it
								</Button>
							</div>
							{error && (
								<p id="url-error" role="alert" className="error-message">
									{error}
								</p>
							)}
							<div className="example-row">
								<span>try one:</span>
								{examples.map((example) => (
									<button
										type="button"
										className="example-pill"
										key={example.label}
										onClick={() => {
											setInput(example.url);
											runClean(example.url);
										}}
									>
										{example.label}
									</button>
								))}
							</div>
						</form>

						<div className="result-area" aria-live="polite" aria-atomic="true">
							{result ? (
								<div className="clean-result" key={result.cleaned + removeAll}>
									<div className="result-heading">
										<label htmlFor="cleaned-url">
											{result.removed.length
												? "the link. just the link."
												: "already clean. carry on."}
										</label>
									</div>
									<div className="output-row">
										<Input
											ref={outputRef}
											id="cleaned-url"
											className="clean-output"
											aria-label="Cleaned link"
											value={result.cleaned}
											readOnly
											onFocus={(e) => e.target.select()}
										/>
										<Button
											className="copy-button"
											type="button"
											onClick={copyLink}
										>
											{!copied && <Copy size={14} aria-hidden="true" />}
											{copied ? "copied." : "copy link"}
										</Button>
									</div>
									{result.removed.length > 0 ? (
										<div className="removed-details">
											<button
												type="button"
												className="details-toggle"
												onClick={() => setShowRemoved(!showRemoved)}
												aria-expanded={showRemoved}
												aria-controls="removed-parameters"
											>
												{result.removed.length}{" "}
												{removeAll ? "parameter" : "tracker"}
												{result.removed.length !== 1 ? "s" : ""} binned{" "}
												<ChevronDown
													size={13}
													className={showRemoved ? "rotate-arrow" : ""}
													aria-hidden="true"
												/>
											</button>
											{showRemoved && (
												<ul
													id="removed-parameters"
													className="removed-tags"
												>
													{result.removed.map((parameter, i) => (
														<li key={i}>
															{parameter.name ||
																"(unnamed parameter)"}
														</li>
													))}
												</ul>
											)}
										</div>
									) : (
										<p className="nothing-removed">
											No known trackers found. A rare W.
										</p>
									)}
								</div>
							) : (
								<div className="empty-result">
									<p>your less cursed link goes here.</p>
								</div>
							)}
						</div>

						<div className="options-row">
							<div className="option-label">
								<Switch
									id="remove-all"
									checked={removeAll}
									onCheckedChange={(checked) => {
										setRemoveAll(checked);
										if (result) runClean(input, checked);
									}}
								/>
								<label htmlFor="remove-all">remove all parameters</label>
							</div>
							<span id="link-help">
								{removeAll
									? "Nuclear option. Some links may break."
									: "Keep the useful bits by default."}
							</span>
						</div>
						{removeAll && (
							<p className="all-parameters-note">
								This also deletes search terms, filters and video IDs after “?”.
								Some links will stop doing their thing.
							</p>
						)}
						{clipboardNotice && (
							<p className="clipboard-notice" role="status">
								{clipboardNotice}
							</p>
						)}
					</div>
					<p className="privacy-note">
						Runs in your browser. Your links don’t go on a field trip.
					</p>
				</section>

				<section className="explanation" aria-label="How the cleaner works">
					<details>
						<summary>
							what’s getting deleted?
							<ChevronDown size={16} aria-hidden="true" />
						</summary>
						<div className="explanation-content">
							<p>
								Ad click IDs, campaign tags, social share IDs. The little snitches
								after the <code>?</code>.
							</p>
							<p className="tracker-examples">
								<s>utm_source</s>
								<s>fbclid</s>
								<s>gclid</s>
								<span>and friends.</span>
							</p>
							<p>
								Search terms, timestamps and product options stay. Want the whole
								query gone? Flip “remove all parameters”. Your call.
							</p>
						</div>
					</details>
				</section>
			</main>

			<footer className="site-footer">
				<span>no spy.</span>
				<p>that’s it. that’s the website.</p>
			</footer>
		</div>
	);
}
