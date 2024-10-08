import React from "react";
import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";
import App from "./App";
import { MetadataProvider } from "./ui/Metadata";
import { ThemeProvider } from "./ui/Theme";
import { LocaleProvider } from "./ui/Locale";
import { AuthProvider } from "./ui/Auth";

import "./index.scss";

hydrateRoot(
	document.getElementById("root")!,
	<React.StrictMode>
		<BrowserRouter basename={process.env.PUBLIC_URL}>
			<MetadataProvider>
				<ThemeProvider>
					<LocaleProvider>
						<AuthProvider>
							<App />
						</AuthProvider>
					</LocaleProvider>
				</ThemeProvider>
			</MetadataProvider>
		</BrowserRouter>
	</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
