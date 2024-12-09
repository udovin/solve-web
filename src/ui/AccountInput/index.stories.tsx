import { FC, useCallback, useState } from "react";
import AccountInput, { Account, AccountInputProps } from ".";

export default {
	title: "AccountInput",
};

const TestAccountInput: FC<AccountInputProps> = props => {
	const { ...rest } = props;
	const fetchAccounts = useCallback((kind?: string, query?: string) => {
		if (kind === undefined) {
			return Promise.resolve([
				{
					"id": 1,
					"kind": "user",
					"title": "Admin",
				},
				{
					"id": 2,
					"kind": "scope",
					"title": "Scope",
				},
				{
					"id": 3,
					"kind": "scope_user",
					"title": "User 1",
				},
				{
					"id": 4,
					"kind": "group",
					"title": "Group",
				}
			]);
		} else if (kind === "user") {
			return Promise.resolve([
				{
					"id": 1,
					"kind": "user",
					"title": "Admin",
				}
			]);
		} else if (kind === "scope") {
			return Promise.resolve([
				{
					"id": 2,
					"kind": "scope",
					"title": "Scope",
				}
			]);
		} else if (kind === "scope_user") {
			return Promise.resolve([
				{
					"id": 3,
					"kind": "scope_user",
					"title": "User 1",
				}
			]);
		} else if (kind === "group") {
			return Promise.resolve([
				{
					"id": 4,
					"kind": "group",
					"title": "Group",
				}
			]);
		}
		return Promise.reject(new Error("Failed!"));
	}, []);
	const [query, setQuery] = useState<string>();
	const [account, setAccount] = useState<Account | undefined>({ "id": 1, "kind": "user", "title": "Admin" });
	return <AccountInput
		query={query}
		onQueryChange={setQuery}
		account={account}
		onAccountChange={setAccount}
		fetchAccounts={fetchAccounts}
		{...rest}
	/>;
};

export const Index = () => <>
	<TestAccountInput />
</>;
