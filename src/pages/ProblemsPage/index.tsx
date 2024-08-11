import { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../ui/Auth";
import { Problems, ErrorResponse, Problem, observeProblems } from "../../api";
import Alert from "../../ui/Alert";
import Button from "../../ui/Button";
import Page from "../../components/Page";
import Sidebar from "../../ui/Sidebar";
import Block, { BlockProps } from "../../ui/Block";
import { useLocale } from "../../ui/Locale";

import "./index.scss";

export type ProblemsBlockProps = BlockProps & {
	problems: Problem[];
	showCodes?: boolean;
};

const ProblemsBlock: FC<ProblemsBlockProps> = props => {
	const { problems, showCodes, ...rest } = props;
	const { localize } = useLocale();
	return <Block className="b-problems" title={localize("Problems")} {...rest}>
		<table className="ui-table">
			<thead>
				<tr>
					<th className="title">{localize("Title")}</th>
				</tr>
			</thead>
			<tbody>
				{problems && problems.map((problem, index) => {
					const { id, title, statement } = problem;
					return <tr key={index} className="problem">
						<td className="title">
							<Link to={`/problems/${id}`}>{statement?.title ?? title}</Link>
							{showCodes && <span className="code" onClick={() => navigator.clipboard.writeText(title)}>({title})</span>}
						</td>
					</tr>;
				})}
			</tbody>
		</table>
	</Block>
};

const ProblemsPage: FC = () => {
	const { localize } = useLocale();
	const [problems, setProblems] = useState<Problems>();
	const [error, setError] = useState<ErrorResponse>();
	const { status } = useAuth();
	useEffect(() => {
		setProblems(undefined);
		observeProblems()
			.then(setProblems)
			.catch(setError);
	}, []);
	if (error) {
		return <Page title="Error" sidebar={<Sidebar />}>
			{error.message && <Alert>{error.message}</Alert>}
		</Page>;
	}
	const canCreate = !!status?.permissions?.includes("create_problem");
	return <Page title={localize("Problems")} sidebar={<Sidebar />}>
		{canCreate && <p>
			<Link to={"/problems/create"}><Button>{localize("Create")}</Button></Link>
		</p>}
		{problems ?
			<ProblemsBlock problems={problems.problems || []} showCodes={canCreate} /> :
			<>Loading...</>}
	</Page>;
};

export default ProblemsPage;
