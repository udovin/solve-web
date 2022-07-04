import path from "path";
import fs from "fs";
import React from "react";
import express from "express";
import ReactDOMServer from "react-dom/server";
import App from "../src/App";
import { StaticRouter } from "react-router-dom/server";

const PORT = process.env.PORT || 8080;
const app = express();

app.use(express.static("./build"));

const indexFile = path.resolve("./build/index.html");
const indexData = fs.readFileSync(indexFile, "utf8");

app.get("/*", (req: any, res: any) => {
	const app = ReactDOMServer.renderToString(
		<React.StrictMode>
			<StaticRouter location={req.url}>
				<App />
			</StaticRouter>
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
