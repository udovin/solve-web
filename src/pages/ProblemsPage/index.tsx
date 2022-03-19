import { FC, useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../AuthContext";
import { Problems, ErrorResponse, Problem, observeProblems } from "../../api";
import Alert from "../../ui/Alert";
import Button from "../../ui/Button";
import Page from "../../components/Page";
import Sidebar from "../../ui/Sidebar";
import Block, { BlockProps } from "../../ui/Block";

import "./index.scss";

export type ProblemsBlockProps = BlockProps & {
	problems: Problem[];
};

const ProblemsBlock: FC<ProblemsBlockProps> = props => {
	const { problems, ...rest } = props;
	return <Block className="b-problems" title="Problems" {...rest}>
		<table className="ui-table">
			<thead>
				<tr>
					<th className="title">Title</th>
				</tr>
			</thead>
			<tbody>
				{problems && problems.map((problem, index) => {
					const { id, title } = problem;
					return <tr key={index} className="problem">
						<td className="title">
							<Link to={`/problems/${id}`}>{title}</Link>
						</td>
					</tr>;
				})}
			</tbody>
		</table>
	</Block>
};

const ProblemsPage: FC = () => {
	const [problems, setProblems] = useState<Problems>();
	const [error, setError] = useState<ErrorResponse>();
	const { status } = useContext(AuthContext);
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
	return <Page title="Problems" sidebar={<Sidebar />}>
		{status?.permissions?.includes("create_problem") && <p>
			<Link to={"/problems/create"}><Button>Create</Button></Link>
		</p>}
		{problems ?
			<ProblemsBlock problems={problems.problems || []} /> :
			<>Loading...</>}
	</Page>;
};

export default ProblemsPage;
