import { FC, ReactNode, createContext, useContext, useEffect, useState } from "react";

import { localeUser } from "../../api";

export type LocalizeFn = (text: string) => string;
export type LocalizeKeyFn = (key: string, text: string) => string;
export type LocalizePluralFn = (texts: string[], num: number) => string;
export type LocalizePluralKeyFn = (key: string, texts: string[], num: number) => string;

type LocaleContextProps = {
	locale: string,
	localizations: { [index: string]: string },
	localize: LocalizeFn,
	localizeKey: LocalizeKeyFn,
	localizePlural: LocalizePluralFn,
	localizePluralKey: LocalizePluralKeyFn,
	setLocale(name: string): void;
};

const LocaleContext = createContext<LocaleContextProps>({
	locale: "en",
	localizations: {},
	localize: (text: string) => text,
	localizeKey: (_key: string, text: string) => text,
	localizePlural: (texts: string[], _num: number) => texts[0],
	localizePluralKey: (_key: string, texts: string[], _num: number) => texts[0],
	setLocale: (name: string) => console.error("Cannot set locale: " + name),
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
	const [locale, setLocale] = useState("en");
	const [localizations, setLocalizations] = useState<{ [index: string]: string }>({});
	const refreshLocale = () => {
		localeUser()
			.then(result => {
				let localizations: { [index: string]: string } = {};
				(result.localizations ?? []).forEach((item: any) => {
					localizations[item.key] = item.text;
				});
				setLocale(result.name);
				setLocalizations(localizations);
			})
			.catch(console.log);
	};
	useEffect(refreshLocale, [setLocale, setLocalizations]);
	const plural = (num: number) => {
		if (locale === "ru") {
			const m10 = num % 10;
			const m100 = num % 100;
			if (m10 === 1 && m100 !== 11) {
				return 0;
			}
			if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) {
				return 1;
			}
			return 2;
		}
		return num === 1 ? 0 : 1;
	};
	const localizeKey = (key: string, text: string) => localizations[`web.${key}`] ?? localizations[key] ?? text;
	const localizePluralKey = (key: string, texts: string[], num: number) => localizeKey(`${key}:${plural(num)}`, texts[num === 1 ? 0 : 1]).replaceAll("%d", num.toString());
	const localize = (text: string) => localizeKey(getLocalizationKey(text), text);
	const localizePlural = (texts: string[], num: number) => localizePluralKey(getLocalizationKey(texts[0]), texts, num);
	const updateLocale = (name: string) => {
		localStorage.setItem("locale", name);
		document.cookie = `locale=${encodeURIComponent(name)};SameSite=Strict;MaxAge=31536000`;
		refreshLocale();
	};
	return <LocaleContext.Provider value={{
		locale,
		localizations,
		localize,
		localizeKey,
		localizePlural,
		localizePluralKey,
		setLocale: updateLocale,
	}}>
		{props.children}
	</LocaleContext.Provider>;
};

const useLocale = () => useContext(LocaleContext);

export { LocaleProvider, useLocale };
