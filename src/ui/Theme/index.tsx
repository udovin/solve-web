import { FC, ReactNode, createContext, useEffect, useState } from "react";

type ThemeContextProps = {
	theme: string;
	setTheme(theme: string): void;
};

const ThemeContext = createContext<ThemeContextProps>({
	theme: "light",
	setTheme: () => { },
});

const ThemeProvider: FC<{ children?: ReactNode }> = props => {
	const [theme, setTheme] = useState("light");
	useEffect(() => {
		const classList = document.body.classList;
		classList.forEach((name) => {
			if (name.startsWith(`theme-`)) {
				classList.remove(name);
			}
		});
		classList.add(`theme-${theme}`);
	}, [theme]);
	useEffect(() => {
		const browserTheme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? "dark" : "light";
		setTheme(localStorage.getItem("theme") ?? browserTheme);
	}, [setTheme]);
	const updateTheme = (theme: string) => {
		if (theme !== "light" && theme !== "dark") {
			return;
		}
		localStorage.setItem("theme", theme);
		document.cookie = `theme=${encodeURIComponent(theme)};SameSite=Strict;MaxAge=31536000`;
		setTheme(theme);
	};
	return <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>
		{props.children}
	</ThemeContext.Provider>;
};

export { ThemeContext, ThemeProvider };
