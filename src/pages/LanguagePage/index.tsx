import { useContext } from "react";
import { setLocale } from "../../api";
import { AuthContext } from "../../AuthContext";
import Page from "../../components/Page";
import Block from "../../ui/Block";
import Button from "../../ui/Button";

import "./index.scss";

const LanguagePage = () => {
    const { status, updateStatus } = useContext(AuthContext);
    const locale = status?.locale ?? "en";
    const updateLocale = (locale: string) => {
        setLocale(locale);
        updateStatus();
    };
    return <Page title="Change language">
        <Block title="Change language" className="b-locales">
            <ul>
                <li><Button disabled={locale === "en"} onClick={() => updateLocale("en")}>English</Button></li>
                <li><Button disabled={locale === "ru"} onClick={() => updateLocale("ru")}>Русский</Button></li>
            </ul>
        </Block>
    </Page>;
};

export default LanguagePage;
