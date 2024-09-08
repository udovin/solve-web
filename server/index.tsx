import path from "path";
import fs from "fs";
import React from "react";
import express, { Request, Response } from "express";
import compression from "compression";
import cookieParser from "cookie-parser";
import { renderToPipeableStream, renderToStaticMarkup } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { createProxyMiddleware } from "http-proxy-middleware";
import App from "../src/App";
import { MetadataState, ServerMetadataProvider } from "../src/ui/Metadata";
import { ServerThemeProvider } from "../src/ui/Theme";
import { ServerLocaleProvider } from "../src/ui/Locale";
import { ServerAuthProvider } from "../src/ui/Auth";
import { Status } from "../src/api";

const PROXY = process.env.PROXY || "http://localhost:4242";
const PORT = process.env.PORT || 8080;

const app = express();

app.use(compression());
app.use(express.static("./build", { index: false }));
app.use(cookieParser());

const indexFile = path.resolve("./build/index.html");
const indexData = fs.readFileSync(indexFile, "utf8");

const ROOT_BEGIN = `<div id="root">`;
const ROOT_END = `</div>`;
const [indexBegin, indexEnd] = indexData.split(ROOT_BEGIN + ROOT_END);

app.use("/api/*", createProxyMiddleware({ target: PROXY }));

const getTheme = (raw: string) => {
	return raw === "dark" ? "dark" : "light";
};

const getHeaders = (req: Request) => {
	const headers: Record<string, string> = {};
	if (req.headers["authorization"]) {
		headers["Authorization"] = req.headers["authorization"];
	}
	if (req.headers["cookie"]) {
		headers["Cookie"] = req.headers["cookie"];
	}
	if (req.headers["accept-language"]) {
		headers["Accept-Language"] = req.headers["accept-language"];
	}
	if (req.headers["user-agent"]) {
		headers["User-Agent"] = req.headers["user-agent"];
	}
	if (req.headers["x-forwarded-for"]) {
		const header = req.headers["x-forwarded-for"];
		const value = header instanceof Array ? (header.length > 0 ? header[0] : undefined) : header;
		if (value) {
			headers["X-Forwarded-For"] = value;
		}
	}
	if (req.headers["x-real-ip"]) {
		const header = req.headers["x-real-ip"];
		const value = header instanceof Array ? (header.length > 0 ? header[0] : undefined) : header;
		if (value) {
			headers["X-Real-IP"] = value;
		}
	}
	return headers;
};

app.get("/*", async (req: Request, resp: Response) => {
	const SERVER_DATA: Record<string, any> = {};
	const metadata: MetadataState = { data: SERVER_DATA };
	const theme = getTheme(req.signedCookies.theme ?? req.cookies.theme ?? "light");
	const localeResult = fetch(PROXY + "/api/v0/locale", { headers: getHeaders(req) })
		.then(resp => resp.json())
		.then(result => {
			let locale = (result.name as string | undefined) ?? "en";
			let localizations: { [index: string]: string } = {};
			(result.localizations ?? []).forEach((item: any) => {
				if (item.key) {
					localizations[item.key] = item.text ?? "";
				}
			});
			return { locale, localizations };
		})
		.catch(error => {
			console.warn("Cannot fetch locale:", error);
			return { locale: "en", localizations: {} };
		});
	const statusResult = fetch(PROXY + "/api/v0/status", { headers: getHeaders(req) })
		.then(resp => resp.json() as Status)
		.catch(error => {
			console.warn("Cannot fetch auth:", error);
			return undefined;
		});
	const { locale, localizations } = await localeResult;
	const status = await statusResult;
	const { pipe } = renderToPipeableStream(
		<StaticRouter location={req.url}>
			<ServerMetadataProvider state={metadata}>
				<ServerThemeProvider theme={theme}>
					<ServerLocaleProvider locale={locale} localizations={localizations}>
						<ServerAuthProvider status={status}>
							<App />
						</ServerAuthProvider>
					</ServerLocaleProvider>
				</ServerThemeProvider>
			</ServerMetadataProvider>
		</StaticRouter>, {
		onAllReady() {
			if (metadata.statusCode) {
				resp.statusCode = metadata.statusCode;
			}
			resp.setHeader("Content-Type", "text/html");
			resp.write(
				indexBegin
					.replace(`<title></title>`, renderToStaticMarkup(<title>{metadata.title ?? ""}</title>))
					.replace(`<meta name="description" content=""/>`, renderToStaticMarkup(<meta name="description" content={metadata.description ?? ""} />))
					.replace(`<script>window.SERVER_DATA={}</script>`, `<script>window.SERVER_DATA=${JSON.stringify(SERVER_DATA)}</script>`)
					.replace(`<body class="theme-light">`, `<body class="theme-${theme}">`)
			);
			resp.write(ROOT_BEGIN);
			pipe(resp);
			resp.write(ROOT_END);
			resp.write(indexEnd);
		}
	});
});

app.listen(PORT, () => {
	console.log(`Server is listening on port ${PORT}`);
});
