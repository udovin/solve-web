import path from "path";
import fs from "fs";
import React from "react";
import express from "express";
import compression from "compression";
import ReactDOMServer from "react-dom/server";
import App from "../src/App";
import { StaticRouter } from "react-router-dom/server";
import { ChunkExtractor } from "@loadable/server";

const PORT = process.env.PORT || 8080;
const app = express();

app.use(compression());
app.use(express.static("./build", { index: false }));

const indexFile = path.resolve("./build/index.html");
const indexData = fs.readFileSync(indexFile, "utf8");
const statsFile = path.resolve("./dist/loadable-stats.json");
const extractor = new ChunkExtractor({ statsFile });
const jsx = extractor.collectChunks(<App />);

app.get("/*", (req: any, res: any) => {
	const app = ReactDOMServer.renderToString(
		<React.StrictMode>
			<StaticRouter location={req.url}>{jsx}</StaticRouter>
		</React.StrictMode>
	);
	res.send(indexData.replace(
		`<div id="root"></div>`,
		`<div id="root">${app}</div>`
	));
});

app.listen(PORT, () => {
	console.log(`Server is listening on port ${PORT}`);
});
