import { FC, useEffect, useState } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { ErrorResponse, observeSolution, Solution, SolutionReport, TestReport } from "../../api";
import Page from "../../components/Page";
import Sidebar from "../../ui/Sidebar";
import Alert from "../../ui/Alert";
import Block, { BlockProps } from "../../ui/Block";
import DateTime from "../../ui/DateTime";
import UserLink from "../../ui/UserLink";

import "./index.scss";

export type SolutionBlockProps = BlockProps & {
	solution: Solution;
};

const SolutionBlock: FC<SolutionBlockProps> = props => {
	const { solution, ...rest } = props;
	const { id, report, user, problem, create_time } = solution;
	return <Block className="b-solution" title="Solutions" {...rest}>
		<table className="ui-table">
			<thead>
				<tr>
					<th className="id">#</th>
					<th className="date">Date</th>
					<th className="author">Author</th>
					<th className="problem">Problem</th>
					<th className="verdict">Verdict</th>
					<th className="points">Points</th>
				</tr>
			</thead>
			<tbody>
				<tr className="problem">
					<td className="id">
						<Link to={`/solutions/${id}`}>{id}</Link>
					</td>
					<td className="date">
						<DateTime value={create_time} />
					</td>
					<td className="author">
						{user ? <UserLink user={user} /> : <>&mdash;</>}
					</td>
					<td className="problem">
						{problem ? <Link to={`/problems/${problem.id}`}>{problem.title}</Link> : <>&mdash;</>}
					</td>
					<td className="verdict">
						{report ? report.verdict : "running"}
					</td>
					<td className="points">
						{(report && report.points) || <>&mdash;</>}
					</td>
				</tr>
			</tbody>
		</table>
	</Block>
};

export type SolutionReportBlockProps = BlockProps & {
	report: SolutionReport;
};

const SolutionReportBlock: FC<SolutionReportBlockProps> = props => {
	const { report, ...rest } = props;
	return <Block title="Tests" className="b-solution" {...rest}>
		<table className="ui-table">
			<thead>
				<tr>
					<th className="id">#</th>
					<th className="verdict">Verdict</th>
					<th className="check-log">Check log</th>
				</tr>
			</thead>
			<tbody>{report && report.tests?.map((test: TestReport, key: number) => {
				return <tr className="problem">
					<td className="id">{key + 1}</td>
					<td className="verdict">
						{test ? test.verdict : "running"}
					</td>
					<td className="check-log">
						{(test && test.check_log) || <>&mdash;</>}
					</td>
				</tr>;
			})}</tbody>
		</table>
	</Block>;
};

type SolutionPageParams = {
	solution_id: string;
}

const SolutionPage = ({ match }: RouteComponentProps<SolutionPageParams>) => {
	const { solution_id } = match.params;
	const [solution, setSolution] = useState<Solution>();
	const [error, setError] = useState<ErrorResponse>();
	useEffect(() => {
		setSolution(undefined);
		observeSolution(Number(solution_id))
			.then(setSolution)
			.catch(setError);
	}, [solution_id]);
	if (error) {
		return <Page title="Error" sidebar={<Sidebar />}>
			{error.message && <Alert>{error.message}</Alert>}
		</Page>;
	}
	return <Page title="Solution" sidebar={<Sidebar />}>
		{solution ?
			<>
				<SolutionBlock solution={solution} />
				{solution.report && <SolutionReportBlock report={solution.report} />}
			</> :
			<>Loading...</>}
	</Page>;
};

export default SolutionPage;
