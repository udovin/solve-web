import { FC, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ErrorResponse, observeSolutions, Problem, Scope, ScopeUser, Solution, Solutions, User } from "../../api";
import Page from "../../components/Page";
import Sidebar from "../../ui/Sidebar";
import Alert from "../../ui/Alert";
import Block, { BlockProps } from "../../ui/Block";
import DateTime from "../../ui/DateTime";
import UserLink from "../../ui/UserLink";
import Verdict from "../../ui/Verdict";
import { LocaleContext } from "../../ui/Locale";

import "./index.scss";

export type SolutionsBlockProps = BlockProps & {
	solutions: Solution[];
};

interface Account {
	user?: User;
	scope?: Scope;
	scope_user?: ScopeUser;
};

type AccountLinkProps = {
	account: Account;
	disabled?: boolean;
};

export const AccountLink: FC<AccountLinkProps> = props => {
	const { account, disabled } = props;
	const { user, scope_user, scope } = account;
	if (user) {
		if (disabled) {
			return <>{user.login}</>;
		}
		return <UserLink user={user} />;
	}
	if (scope) {
		return <><span className="kind">Scope: </span>{scope.title ?? scope.id}</>;
	}
	if (scope_user) {
		return <>{scope_user.title ?? scope_user.login}</>;
	}
	return <>&mdash;</>;
};

const SolutionsBlock: FC<SolutionsBlockProps> = props => {
	const { solutions, ...rest } = props;
	const { localize } = useContext(LocaleContext);
	return <Block className="b-solutions" title={localize("Solutions")} {...rest}>
		<table className="ui-table">
			<thead>
				<tr>
					<th className="id">#</th>
					<th className="date">{localize("Time")}</th>
					<th className="author">{localize("Author")}</th>
					<th className="problem">{localize("Problem")}</th>
					<th className="compiler">{localize("Compiler")}</th>
					<th className="verdict">{localize("Verdict")}</th>
				</tr>
			</thead>
			<tbody>
				{solutions.map((solution: Solution, key: number) => {
					const { id, report, problem, compiler, create_time } = solution;
					const { statement } = problem as Problem;
					let compilerName = compiler?.name;
					if (compiler?.config?.language) {
						compilerName = compiler.config.language;
						if (compiler.config.compiler) {
							compilerName += ` (${compiler.config.compiler})`;
						}
					}
					return <tr key={key} className="problem">
						<td className="id"><Link to={`/solutions/${id}`}>{id}</Link></td>
						<td className="date"><DateTime value={create_time} /></td>
						<td className="author"><AccountLink account={solution} /></td>
						<td className="problem">
							{problem ? <Link to={`/problems/${problem.id}`}>{statement?.title ?? problem.title}</Link> : <>&mdash;</>}
						</td>
						<td className="compiler">{compilerName ?? <>&mdash;</>}</td>
						<td className="verdict"><Verdict report={report} /></td>
					</tr>;
				})}
			</tbody>
		</table>
	</Block>
};

const SolutionsPage: FC = () => {
	const { localize } = useContext(LocaleContext);
	const [solutions, setSolutions] = useState<Solutions>();
	const [error, setError] = useState<ErrorResponse>();
	useEffect(() => {
		setSolutions(undefined);
		observeSolutions()
			.then(setSolutions)
			.catch(setError);
	}, []);
	if (error) {
		return <Page title="Error" sidebar={<Sidebar />}>
			{error.message && <Alert>{error.message}</Alert>}
		</Page>;
	}
	return <Page title={localize("Solutions")} sidebar={<Sidebar />}>
		{solutions ?
			<SolutionsBlock solutions={solutions.solutions || []} /> :
			<>Loading...</>}
	</Page>;
};

export default SolutionsPage;
