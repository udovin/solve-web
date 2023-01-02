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
	return (
		<div className={`theme-${theme}`}>
			<Story />
		</div>
	)
}

export const decorators = [withThemeProvider];
