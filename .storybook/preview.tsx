import { DocsContainer } from "@storybook/blocks";
import { themes } from "@storybook/theming";
import React from "react";

import "../src/index.scss";

export const globalTypes = {
	theme: {
		name: "Theme",
		description: "Global theme for components",
		defaultValue: "light",
		toolbar: {
			icon: "circlehollow",
			items: [
				{ value: "light", icon: "circlehollow", title: "Light" },
				{ value: "dark", icon: "circle", title: "Dark" },
			],
			showName: true,
			dynamicTitle: true,
		},
	},
};

const withThemeProvider = (Story, context) => {
	const theme = context.globals.theme;
	document.body.classList.forEach((name) => {
		if (name.startsWith(`theme-`)) {
			document.body.classList.remove(name);
		}
	});
	document.body.classList.add(`theme-${theme}`);
	return <Story />;
};

const ThemeDocsContainer = ({ children, context }) => {
	const theme = context.store?.userGlobals?.globals?.theme;
	return (
		<DocsContainer
			theme={theme === "light" ? themes.light : themes.dark}
			context={context}
		>
			{children}
		</DocsContainer>
	);
};

export const decorators = [withThemeProvider];
export const tags = ["autodocs"];
export const parameters = {
	docs: {
		container: ThemeDocsContainer,
	},
};
