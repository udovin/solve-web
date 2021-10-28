import path from "path";
import fs from "fs";
import React from "react";
import express from "express";
import ReactDOMServer from "react-dom/server";
import App from "../src/App";
import { StaticRouter } from "react-router";

const PORT = process.env.PORT || 8080;
const app = express();

app.use(express.static("./build"));

app.get("/*", (req: any, res: any) => {
	const context = {};
	const app = ReactDOMServer.renderToString(
		<React.StrictMode>
			<StaticRouter location={req.url} context={context}>
				<App />
			</StaticRouter>
		</React.StrictMode>
	);
	const indexFile = path.resolve("./build/index.html");
	fs.readFile(indexFile, "utf8", (err, data) => {
		if (err) {
			console.error("Something went wrong:", err);
			return res.status(500).send("Oops, better luck next time!");
		}
		return res.send(data.replace(
			`<div id="root"></div>`,
			`<div id="root">${app}</div>`
		));
	});
});

app.listen(PORT, () => {
	console.log(`Server is listening on port ${PORT}`);
});
