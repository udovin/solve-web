import { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ErrorResponse, observeSolutions, Problem, ScopeUser, Solution, Solutions, User } from "../../api";
import Page from "../../components/Page";
import Sidebar from "../../ui/Sidebar";
import Alert from "../../ui/Alert";
import Block, { BlockProps } from "../../ui/Block";
import DateTime from "../../ui/DateTime";
import UserLink from "../../ui/UserLink";
import Verdict from "../../ui/Verdict";

import "./index.scss";

export type SolutionsBlockProps = BlockProps & {
	solutions: Solution[];
};

interface Account {
	user?: User;
	scope_user?: ScopeUser;
};

type AccountLinkProps = {
	account: Account;
};

export const AccountLink: FC<AccountLinkProps> = props => {
	const { account } = props;
	const { user, scope_user } = account;
	if (user) {
		return <UserLink user={user} />;
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
					<th className="date">Date</th>
					<th className="author">Author</th>
					<th className="problem">Problem</th>
					<th className="verdict">Verdict</th>
				</tr>
			</thead>
			<tbody>
				{solutions.map((solution: Solution, key: number) => {
					const { id, report, problem, create_time } = solution;
					const { statement } = problem as Problem;
					return <tr key={key} className="problem">
						<td className="id"><Link to={`/solutions/${id}`}>{id}</Link></td>
						<td className="date"><DateTime value={create_time} /></td>
						<td className="author"><AccountLink account={solution} /></td>
						<td className="problem">
							{problem ? <Link to={`/problems/${problem.id}`}>{statement?.title ?? problem.title}</Link> : <>&mdash;</>}
						</td>
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
