import { FC, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../AuthContext";
import Tooltip from "../Tooltip";
import { VERSION, getSolveVersion } from "../../api";
import { strings } from "../../Locale";

import "./index.scss";

export const LOCALES: Record<string, string> = {
    "en": "English",
    "ru": "Русский",
};

const Footer: FC = () => {
    const { status } = useContext(AuthContext);
    const locale = status?.locale ?? "en";
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
                        <a href="//github.com/udovin/solve">{strings.repository}</a>
                    </li>
                    <li>{strings.language + ":"} <Link to="/language">{localeTitle}</Link></li>
                </ul>
            </div>
        </div>
        <div id="footer-copy">
            <a href="//github.com/udovin">Ivan Udovin</a> &copy; 2019-2024
        </div>
    </footer>;
};

export default Footer;
