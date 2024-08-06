import { FC, useContext } from "react";
import { Link } from "react-router-dom";
import Tooltip from "../Tooltip";
import { VERSION, getSolveVersion } from "../../api";
import Select from "../Select";
import { ThemeContext } from "../Theme";
import { LocaleContext } from "../Locale";

import "./index.scss";

export const LOCALES: Record<string, string> = {
    "en": "English",
    "ru": "Русский",
};

const Footer: FC = () => {
    const { localize, localizeKey, name } = useContext(LocaleContext);
    const { theme, setTheme } = useContext(ThemeContext);
    const locale = name ?? "en";
    const localeTitle = LOCALES[locale] ?? "English";
    return <footer id="footer">
        <div id="footer-nav">
            <div className="wrap">
                <ul>
                    <li>
                        <Tooltip content={<span className="ui-version-tooltip">
                            <span>Web: {VERSION}</span>
                            <span>API: {getSolveVersion()}</span>
                        </span>}>{VERSION}</Tooltip>
                    </li>
                    <li>
                        <a href="//github.com/udovin/solve">{localize("Repository")}</a>
                    </li>
                    <li>{localize("Language")}: <Link to="/language">{localeTitle}</Link></li>
                    <li>{localize("Theme")}: <Select options={{ "light": localizeKey("theme_light", "Light"), "dark": localizeKey("theme_dark", "Dark") }} value={theme} onValueChange={setTheme} /></li>
                </ul>
            </div>
        </div>
        <div id="footer-copy">
            <a href="//github.com/udovin">Ivan Udovin</a> &copy; 2019-2024
        </div>
    </footer>;
};

export default Footer;
