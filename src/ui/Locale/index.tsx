import { FC, ReactNode, createContext, useEffect, useState } from "react";

import { localeUser } from "../../api";

export type LocalizeFn = (text: string) => string;
export type LocalizeKeyFn = (key: string, text: string) => string;

type LocaleContextProps = {
    name: string,
    localizations: { [index: string]: string },
    localize: LocalizeFn,
    localizeKey: LocalizeKeyFn,
    setLocale(name: string): void;
};

const LocaleContext = createContext<LocaleContextProps>({
    name: "en",
    localizations: {},
    localize: (text: string) => text,
    localizeKey: (_key: string, text: string) => text,
    setLocale: (_name: string) => { },
});

const getLocalizationKey = (text: string) => {
    let key = "";
    let split = false;
    for (let i = 0; i < text.length; i++) {
        if (text[i].toLowerCase() !== text[i].toUpperCase()) {
            if (split) {
                key += "_";
                split = false;
            }
            key += text[i].toLowerCase();
        } else {
            split = true;
        }
    }
    return key;
};

const LocaleProvider: FC<{ children?: ReactNode }> = props => {
    const [name, setName] = useState("en");
    const [localizations, setLocalizations] = useState<{ [index: string]: string }>({});
    const refreshLocale = () => {
        localeUser()
            .then(result => {
                let localizations: { [index: string]: string } = {};
                (result.localizations ?? []).forEach((item: any) => {
                    localizations[item.key] = item.text;
                });
                setName(result.name);
                setLocalizations(localizations);
            })
            .catch(console.log);
    };
    useEffect(refreshLocale, [setName, setLocalizations]);
    const localizeKey = (key: string, text: string) => {
        return localizations["web." + key] ?? localizations[key] ?? text;
    };
    const localize = (text: string) => localizeKey(getLocalizationKey(text), text);
    const setLocale = (name: string) => {
        localStorage.setItem("locale", name);
        refreshLocale();
    };
    return <LocaleContext.Provider value={{ name, localizations, localize, localizeKey, setLocale }}>
        {props.children}
    </LocaleContext.Provider>;
};

export { LocaleContext, LocaleProvider };
