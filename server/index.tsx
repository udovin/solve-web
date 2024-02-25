import path from "path";
import fs from "fs";
import React from "react";
import express from "express";
import compression from "compression";
import { renderToPipeableStream } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { createProxyMiddleware } from "http-proxy-middleware";
import App from "../src/App";

const PROXY = process.env.PROXY || "http://localhost:4242";
const PORT = process.env.PORT || 8080;

const app = express();

app.use(compression());
app.use(express.static("./build", { index: false }));

const indexFile = path.resolve("./build/index.html");
const indexData = fs.readFileSync(indexFile, "utf8");

const ROOT_BEGIN = `<div id="root">`;
const ROOT_END = `</div>`;
const [indexBegin, indexEnd] = indexData.split(ROOT_BEGIN + ROOT_END);

app.use("/api/*", createProxyMiddleware({ target: PROXY }));

app.get("/*", (req: any, resp: any) => {
	const { pipe } = renderToPipeableStream(
		<StaticRouter location={req.url}>
			<App />
		</StaticRouter>, {
		onShellReady() {
			resp.setHeader("Content-Type", "text/html");
			resp.write(indexBegin);
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
