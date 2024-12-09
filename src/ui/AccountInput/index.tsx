import { CSSProperties, FC, useCallback, useEffect, useRef, useState } from "react";
import Input from "../Input";
import Portal from "../Portal";
import { useLocale } from "../Locale";
import { useDebounce } from "../../utils/debounce";

import "./index.scss";

export type Account = {
	id: number;
	kind?: string;
	title?: string;
};

export type AccountInputProps = {
	kinds?: string[];
	placeholder?: string;
	disabled?: boolean;
	query?: string;
	onQueryChange?(query?: string): void;
	account?: Account;
	onAccountChange?(account?: Account): void;
	fetchAccounts?(kind?: string, query?: string): Promise<Account[]>;
};

const AccountInput: FC<AccountInputProps> = props => {
	const { kinds, placeholder, disabled, query, onQueryChange, account, onAccountChange, fetchAccounts } = props;
	const hasUser = kinds ? kinds.includes("user") : true;
	const hasScopeUser = kinds ? kinds.includes("scope_user") : true;
	const hasScope = kinds ? kinds.includes("scope") : true;
	const hasGroup = kinds ? kinds.includes("group") : true;
	const isOnly = kinds && kinds.length === 1;
	const { localize } = useLocale();
	const ref = useRef<HTMLInputElement>(null);
	const [focused, setFocused] = useState(false);
	const [style, setStyle] = useState<CSSProperties>({});
	const [kind, setKind] = useState<string | undefined>(isOnly ? kinds[0] : account?.kind);
	const [accounts, setAccounts] = useState<Account[]>([]);
	if (account && !query && onQueryChange) {
		onQueryChange(account.title ?? account.id.toString());
	}
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
		if (onQueryChange) {
			onQueryChange(query);
		}
		if (onAccountChange) {
			onAccountChange(undefined);
		}
	};
	const updateAccount = (account: Account) => {
		if (onQueryChange) {
			onQueryChange(account.title ?? account.id.toString());
		}
		if (onAccountChange) {
			onAccountChange(account);
		}
	};
	const debouncedQuery = useDebounce(query, 300);
	const updateAccounts = useCallback(() => {
		if (fetchAccounts) {
			fetchAccounts(kind, debouncedQuery).then(setAccounts).catch(console.log);
		}
	}, [kind, debouncedQuery, fetchAccounts]);
	useEffect(() => {
		if (focused) {
			updateAccounts();
		}
	}, [focused, updateAccounts]);
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
						{!isOnly && <li className={kind === undefined ? "selected" : undefined} onClick={() => setKind(undefined)}>{localize("All")}</li>}
						{hasUser && <li className={kind === "user" ? "selected" : undefined} onClick={() => setKind("user")}>{localize("Users")}</li>}
						{hasGroup && <li className={kind === "group" ? "selected" : undefined} onClick={() => setKind("group")}>{localize("Groups")}</li>}
						{hasScope && <li className={kind === "scope" ? "selected" : undefined} onClick={() => setKind("scope")}>{localize("Scopes")}</li>}
						{hasScopeUser && <li className={kind === "scope_user" ? "selected" : undefined} onClick={() => setKind("scope_user")}>{localize("Scope users")}</li>}
					</ul>
					<ul className="items">
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
