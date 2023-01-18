import { FC, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ErrorResponse, observeSolution, Solution, SolutionReport, TestReport } from "../../api";
import Page from "../../components/Page";
import Sidebar from "../../ui/Sidebar";
import Alert from "../../ui/Alert";
import Block, { BlockProps } from "../../ui/Block";
import DateTime from "../../ui/DateTime";
import UserLink from "../../ui/UserLink";
import Verdict, { TestVerdict } from "../../ui/Verdict";

import "./index.scss";
import Duration from "../../ui/Duration";
import ByteSize from "../../ui/ByteSize";

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
						<Verdict report={report} />
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

export const SolutionReportBlock: FC<SolutionReportBlockProps> = props => {
	const { report, ...rest } = props;
	return <Block title="Tests" className="b-solution-report" {...rest}>
		<table className="ui-table">
			<thead>
				<tr>
					<th className="id">#</th>
					<th className="time">Time</th>
					<th className="memory">Memory</th>
					<th className="verdict">Verdict</th>
					<th className="check-log">Check log</th>
				</tr>
			</thead>
			<tbody>{report && report.tests?.map((test: TestReport, key: number) => {
				return <tr className="test">
					<td className="id">{key + 1}</td>
					<td className="time">{<Duration value={(test.used_time ?? 0) * 0.001} />}</td>
					<td className="memory">{<ByteSize value={test.used_memory ?? 0} />}</td>
					<td className="verdict"><TestVerdict report={test} /></td>
					<td className="check-log">
						{test.check_log ? <pre className="log">{test.check_log}</pre> : <>&mdash;</>}
					</td>
				</tr>;
			})}</tbody>
		</table>
	</Block>;
};

const SolutionPage: FC = () => {
	const params = useParams();
	const { solution_id } = params;
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
