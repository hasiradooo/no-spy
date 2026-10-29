import type { Metadata } from "next";
import { SiteAnalytics } from "@/components/site-analytics";
import "./globals.css";

export const metadata: Metadata = {
	title: "no spy - same page. less shit.",
	description:
		"Remove the tracking crap from your links. Runs in your browser. Your links don’t go on a field trip.",
	robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	// Vercel provides the analytics endpoints. Other static hosts do not.
	return (
		<html lang="en">
			<body>
				{children}
				{process.env.VERCEL === "1" && <SiteAnalytics />}
			</body>
		</html>
	);
}
