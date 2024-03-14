import { FC, ReactNode, createContext, useEffect, useState } from "react";

type ThemeContextProps = {
    theme: string;
    setTheme(theme: string): void;
};

const ThemeContext = createContext<ThemeContextProps>({
    theme: "light",
    setTheme: () => {},
});

const ThemeProvider: FC<{ children?: ReactNode }> = props => {
    const [theme, setTheme] = useState("light");
    const changeTheme = (theme: string) => {
        if (theme != "light" && theme != "dark") {
            return;
        }
        localStorage.setItem("theme", theme);
        setTheme(theme);
    };
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
        changeTheme(localStorage.getItem("theme") ?? "light");
    });
    return <ThemeContext.Provider value={{ theme, setTheme: changeTheme }}>
		{props.children}
	</ThemeContext.Provider>;
};

export {ThemeContext, ThemeProvider};
