import path from "path";
import fs from "fs";
import React from "react";
import express from "express";
import compression from "compression";
import ReactDOMServer from "react-dom/server";
import App from "../src/App";
import { StaticRouter } from "react-router-dom/server";
import { ChunkExtractor } from "@loadable/server";
import { createProxyMiddleware } from "http-proxy-middleware";

const PROXY = process.env.PROXY || "http://localhost:4242";
const PORT = process.env.PORT || 8080;
const app = express();

app.use(compression());
app.use(express.static("./build", { index: false }));

const indexFile = path.resolve("./build/index.html");
const statsFile = path.resolve("./build/loadable-stats.json");
const indexData = fs.readFileSync(indexFile, "utf8");

app.use("/api/*", createProxyMiddleware({ target: PROXY }));

app.get("/*", (req: any, res: any) => {
	const extractor = new ChunkExtractor({ statsFile });
	const app = extractor.collectChunks(
		<React.StrictMode>
			<StaticRouter location={req.url}><App /></StaticRouter>
		</React.StrictMode>
	);
	const content = ReactDOMServer.renderToString(app);
	res.send(
		indexData
			.replace(
				`<script>console.log("loadable")</script>`,
				`${extractor.getLinkTags()}${extractor.getStyleTags()}${extractor.getScriptTags().replace(/async /g, "")}`
			)
			.replace(
				`<div id="root"></div>`,
				`<div id="root">${content}</div>`
			)
	);
});

app.listen(PORT, () => {
	console.log(`Server is listening on port ${PORT}`);
});
