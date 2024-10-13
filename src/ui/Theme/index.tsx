import { FC, ReactNode, createContext, useContext, useEffect, useState } from "react";
import { useMetadata } from "../Metadata";
import { getCookie, setCookie } from "../../api";

type ThemeContextProps = {
	theme: string;
	setTheme(theme: string): void;
};

const ThemeContext = createContext<ThemeContextProps>({
	theme: "light",
	setTheme: (_theme: string) => { },
});

const THEME_KEY = "theme";

const ThemeProvider: FC<{ children?: ReactNode }> = props => {
	const { children } = props;
	const { getServerData } = useMetadata();
	const [theme, setTheme] = useState(getServerData<string>(THEME_KEY) ?? "light");
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
		setTheme(getCookie("theme") ?? browserTheme);
	}, [setTheme]);
	const updateTheme = (theme: string) => {
		if (theme !== "light" && theme !== "dark") {
			return;
		}
		setCookie("theme", theme);
		setTheme(theme);
	};
	return <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>
		{children}
	</ThemeContext.Provider>;
};

const ServerThemeProvider: FC<{ children?: ReactNode, theme: string }> = props => {
	const { children, theme } = props;
	const { setServerData } = useMetadata();
	setServerData(THEME_KEY, theme);
	const setTheme = (theme: string) => console.error(`Cannot set theme: ${theme}`);
	return <ThemeContext.Provider value={{ theme, setTheme }}>
		{children}
	</ThemeContext.Provider>;
};

const useTheme = () => useContext(ThemeContext);

export { ThemeProvider, ServerThemeProvider, useTheme };
