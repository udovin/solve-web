import "../src/index.scss";

export const globalTypes = {
	theme: {
		name: "Theme",
		description: "Global theme for components",
		defaultValue: "light",
		toolbar: {
			icon: "circlehollow",
			// Array of plain string values or MenuItem shape (see below)
			items: ["light", "dark"],
			// Property that specifies if the name of the item will be displayed
			showName: true,
			// Change title based on selected value
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
}

export const decorators = [withThemeProvider];
