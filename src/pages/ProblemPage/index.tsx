import { FC, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ContestProblem, ErrorResponse, observeProblem, Problem } from "../../api";
import Page from "../../components/Page";
import Alert from "../../ui/Alert";
import Block from "../../ui/Block";
import Icon from "../../ui/Icon";
import Latex from "../../ui/Latex";
import Sidebar from "../../ui/Sidebar";

type ProblemBlockProps = {
	problem: ContestProblem | Problem;
};

export const ProblemBlock: FC<ProblemBlockProps> = props => {
	const { problem } = props;
	const { statement } = problem;
	const contestProblem = problem as ContestProblem;
	return <Block title={`${contestProblem.code ? `${contestProblem.code}. ` : ""}${statement?.title ?? problem.title}`} className="b-problem-statement">
		<Latex className={"section legend"} content={statement?.legend} />
		{statement?.input && <>
			<h3>Input</h3>
			<Latex className={"section input"} content={statement?.input} />
		</>}
		{statement?.output && <>
			<h3>Output</h3>
			<Latex className={"section output"} content={statement?.output} />
		</>}
		{<>
			<h3>Samples</h3>
		</>}
		{statement?.notes && <>
			<h3>Notes</h3>
			<Latex className={"section notes"} content={statement?.notes} />
		</>}
	</Block>;
};

type ManageProblemSideBlockProps = {
	problem: Problem;
};

const ManageProblemSideBlock: FC<ManageProblemSideBlockProps> = props => {
	const { problem } = props;
	return <Block className="b-sidebar" title="Manage problem">
		<ul>
			<li><Link to={`/problems/${problem.id}/manage`}>
				<Icon kind="edit" />
				<span className="label">Manage problem</span>
			</Link></li>
		</ul>
	</Block>;
};

const ProblemPage: FC = () => {
	const params = useParams();
	const { problem_id } = params;
	const [problem, setProblem] = useState<Problem>();
	const [error, setError] = useState<ErrorResponse>();
	useEffect(() => {
		setProblem(undefined);
		observeProblem(Number(problem_id))
			.then(setProblem)
			.catch(setError);
	}, [problem_id]);
	if (error) {
		return <Page title="Error" sidebar={<Sidebar />}>
			{error.message && <Alert>{error.message}</Alert>}
		</Page>;
	}
	const canUpdate = problem?.permissions?.includes("update_problem");
	return <Page title="Problem" sidebar={<>
		{problem && canUpdate && <ManageProblemSideBlock problem={problem as Problem} />}
		<Sidebar />
	</>}>
		{problem ?
			<>
				<ProblemBlock problem={problem} />
			</> :
			<>Loading...</>}
	</Page>;
};

export default ProblemPage;