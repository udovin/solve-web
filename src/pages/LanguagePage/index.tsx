import { useContext } from "react";
import Page from "../../components/Page";
import Block from "../../ui/Block";
import Button from "../../ui/Button";
import { LocaleContext } from "../../ui/Locale";

import "./index.scss";

const LanguagePage = () => {
    const { localize, locale, setLocale } = useContext(LocaleContext);
    return <Page title={localize("Change language")}>
        <Block title={localize("Change language")} className="b-locales">
            <ul>
                <li><Button disabled={locale === "en"} onClick={() => setLocale("en")}>English</Button></li>
                <li><Button disabled={locale === "ru"} onClick={() => setLocale("ru")}>Русский</Button></li>
            </ul>
        </Block>
    </Page>;
};

export default LanguagePage;
