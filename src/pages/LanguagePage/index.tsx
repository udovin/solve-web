import { useContext } from "react";
import { setLocale } from "../../api";
import { AuthContext } from "../../ui/Auth";
import Page from "../../components/Page";
import Block from "../../ui/Block";
import Button from "../../ui/Button";
import { strings } from "../../Locale"

import "./index.scss";

const LanguagePage = () => {
    const { status, refreshStatus } = useContext(AuthContext);
    const locale = status?.locale ?? "en";
    const updateLocale = (locale: string) => {
        strings.setLanguage(locale);
        setLocale(locale);
        refreshStatus();
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
