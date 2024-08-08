import { CSSProperties, FC, useContext, useEffect, useRef, useState } from "react";
import Input from "../Input";
import Portal from "../Portal";
import { LocaleContext } from "../Locale";

import "./index.scss";

export type Account = {
	id: number;
	kind?: string;
	title?: string;
};

export type AccountInputProps = {
	placeholder?: string;
	disabled?: boolean;
	account?: Account;
	onAccountChange?(account?: Account): void;
	fetchAccounts?(kind?: string, query?: string): Promise<Account[]>;
};

const AccountInput: FC<AccountInputProps> = props => {
	const { placeholder, disabled, account, onAccountChange, fetchAccounts } = props;
	const { localize } = useContext(LocaleContext);
	const ref = useRef<HTMLInputElement>(null);
	const [focused, setFocused] = useState(false);
	const [style, setStyle] = useState<CSSProperties>({});
	const [kind, setKind] = useState<string | undefined>(account?.kind);
	const [query, setQuery] = useState<string | undefined>(account?.title ?? account?.id.toString());
	const [accounts, setAccounts] = useState<Account[]>([]);
	const updateStyle = () => {
		if (!ref.current) {
			return;
		}
		const element = ref.current;
		setStyle({
			top: element.getBoundingClientRect().top + window.scrollY + element.offsetHeight,
			left: element.getBoundingClientRect().left + window.scrollX,
			minWidth: element.offsetWidth,
		});
	};
	useEffect(() => {
		if (!ref.current) {
			return;
		}
		updateStyle();
		window.addEventListener("resize", updateStyle);
		window.addEventListener("scroll", updateStyle, true);
		return () => {
			window.removeEventListener("resize", updateStyle);
			window.removeEventListener("scroll", updateStyle, true);
		};
	}, [ref, focused]);
	const updateQuery = (query: string) => {
		setQuery(query);
		if (onAccountChange) {
			onAccountChange(undefined);
		}
	};
	const updateAccount = (account: Account) => {
		if (onAccountChange) {
			onAccountChange(account);
		}
		setQuery(account.title ?? account.id.toString());
	};
	useEffect(() => {
		if (fetchAccounts) {
			fetchAccounts(kind, query).then(setAccounts).catch(console.log);
		}
	}, [kind, query, fetchAccounts]);
	return <>
		<Input
			value={query}
			onValueChange={updateQuery}
			placeholder={placeholder}
			disabled={disabled}
			onFocus={() => setFocused(true)}
			onBlur={() => setFocused(false)}
			ref={ref} />
		{focused && !disabled && <Portal>
			<div className="ui-search-portal" style={style} onMouseDown={(event) => { event.preventDefault(); }}>
				<div className="search-box">
					<ul className="tabs">
						<li className={kind === undefined ? "selected" : undefined} onClick={() => setKind(undefined)}>{localize("All")}</li>
						<li className={kind === "user" ? "selected" : undefined} onClick={() => setKind("user")}>{localize("Users")}</li>
						<li className={kind === "scope_user" ? "selected" : undefined} onClick={() => setKind("scope_user")}>{localize("Scope users")}</li>
						<li className={kind === "scope" ? "selected" : undefined} onClick={() => setKind("scope")}>{localize("Scopes")}</li>
						<li className={kind === "group" ? "selected" : undefined} onClick={() => setKind("group")}>{localize("Groups")}</li>
					</ul>
					<ul className="accounts">
						{accounts && accounts.map((item: Account, key: number) => {
							return <li
								className={item.id === account?.id ? "selected" : undefined}
								onClick={() => updateAccount(item)}
								key={key}
							>{item.title ?? item.id}</li>;
						})}
					</ul>
				</div>
			</div>
		</Portal>}
	</>;
};

export default AccountInput;
