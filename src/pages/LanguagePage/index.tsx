import { useContext } from "react";
import { setLocale } from "../../api";
import { AuthContext } from "../../AuthContext";
import Page from "../../components/Page";
import Block from "../../ui/Block";
import Button from "../../ui/Button";
import { strings } from "../../Locale"

import "./index.scss";

const LanguagePage = () => {
    const { status, updateStatus } = useContext(AuthContext);
    const locale = status?.locale ?? "en";
    const updateLocale = (locale: string) => {
        setLocale(locale);
        strings.setLanguage(locale);
        updateStatus();
    };
    return <Page title={strings.changeLanguage}>
        <Block title={strings.changeLanguage} className="b-locales">
            <ul>
                <li><Button disabled={locale === "en"} onClick={() => updateLocale("en")}>English</Button></li>
                <li><Button disabled={locale === "ru"} onClick={() => updateLocale("ru")}>Русский</Button></li>
            </ul>
        </Block>
    </Page>;
};

export default LanguagePage;
