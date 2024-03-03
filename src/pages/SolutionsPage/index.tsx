import { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ErrorResponse, observeSolutions, Problem, Scope, ScopeUser, Solution, Solutions, User } from "../../api";
import Page from "../../components/Page";
import Sidebar from "../../ui/Sidebar";
import Alert from "../../ui/Alert";
import Block, { BlockProps } from "../../ui/Block";
import DateTime from "../../ui/DateTime";
import UserLink from "../../ui/UserLink";
import Verdict from "../../ui/Verdict";
import { strings } from "../../Locale";

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
};

export const AccountLink: FC<AccountLinkProps> = props => {
	const { account } = props;
	const { user, scope_user, scope } = account;
	if (user) {
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
	return <Block className="b-solutions" title="Solutions" {...rest}>
		<table className="ui-table">
			<thead>
				<tr>
					<th className="id">#</th>
					<th className="date">{strings.time}</th>
					<th className="author">{strings.participant}</th>
					<th className="problem">{strings.problem}</th>
					<th className="compiler">{strings.compiler}</th>
					<th className="verdict">{strings.verdict}</th>
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
	return <Page title="Solutions" sidebar={<Sidebar />}>
		{solutions ?
			<SolutionsBlock solutions={solutions.solutions || []} /> :
			<>Loading...</>}
	</Page>;
};

export default SolutionsPage;
