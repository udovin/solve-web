import { FC, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ErrorResponse, observeSolution, Problem, Solution, SolutionReport, TestReport } from "../../api";
import Page from "../../components/Page";
import Sidebar from "../../ui/Sidebar";
import Alert from "../../ui/Alert";
import Block, { BlockProps } from "../../ui/Block";
import DateTime from "../../ui/DateTime";
import Verdict, { TestVerdict } from "../../ui/Verdict";
import Duration from "../../ui/Duration";
import ByteSize from "../../ui/ByteSize";
import { AccountLink } from "../SolutionsPage";
import Code from "../../ui/Code";
import CollapseBlock from "../../ui/CollapseBlock";
import { useLocale } from "../../ui/Locale";

import "./index.scss";

export type SolutionBlockProps = BlockProps & {
	solution: Solution;
};

const SolutionBlock: FC<SolutionBlockProps> = props => {
	const { solution, ...rest } = props;
	const { id, report, problem, compiler, create_time } = solution;
	const { statement } = problem as Problem;
	const { localize } = useLocale();
	let compilerName = compiler?.name;
	if (compiler?.config?.language) {
		compilerName = compiler.config.language;
		if (compiler.config.compiler) {
			compilerName += ` (${compiler.config.compiler})`;
		}
	}
	return <Block className="b-solution" title="Solutions" {...rest}>
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
				<tr className="problem">
					<td className="id"><Link to={`/solutions/${id}`}>{id}</Link></td>
					<td className="date"><DateTime value={create_time} /></td>
					<td className="author"><AccountLink account={solution} /></td>
					<td className="problem">
						{problem ? <Link to={`/problems/${problem.id}`}>{statement?.title ?? problem.title}</Link> : <>&mdash;</>}
					</td>
					<td className="compiler">{compilerName ?? <>&mdash;</>}</td>
					<td className="verdict"><Verdict report={report} /></td>
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
	const { localize } = useLocale();
	return <CollapseBlock title={localize("Tests")} className="b-solution-report" {...rest}>
		<table className="ui-table">
			<thead>
				<tr>
					<th className="id">#</th>
					<th className="time">{localize("Time")}</th>
					<th className="memory">{localize("Memory")}</th>
					<th className="verdict">{localize("Verdict")}</th>
					<th className="check-log">{localize("Check log")}</th>
				</tr>
			</thead>
			<tbody>{report && report.tests?.map((test: TestReport, index: number) => {
				return <tr className="test" key={index}>
					<td className="id">{index + 1}</td>
					<td className="time">{<Duration value={(test.used_time ?? 0) * 0.001} />}</td>
					<td className="memory">{<ByteSize value={test.used_memory ?? 0} />}</td>
					<td className="verdict"><TestVerdict report={test} /></td>
					<td className="check-log">
						{test.check_log ? <pre className="log">{test.check_log}</pre> : <>&mdash;</>}
					</td>
				</tr>;
			})}</tbody>
		</table>
	</CollapseBlock>;
};

const SolutionPage: FC = () => {
	const params = useParams();
	const { solution_id } = params;
	const { localize } = useLocale();
	const [solution, setSolution] = useState<Solution>();
	const [error, setError] = useState<ErrorResponse>();
	useEffect(() => {
		setSolution(undefined);
		observeSolution(Number(solution_id))
			.then(setSolution)
			.catch(setError);
	}, [solution_id]);
	if (error) {
		return <Page title={localize("Error")} sidebar={<Sidebar />}>
			{error.message && <Alert>{error.message}</Alert>}
		</Page>;
	}
	if (!solution) {
		return <Page title={localize("Solution")} sidebar={<Sidebar />}>
			<>Loading...</>
		</Page>;
	}
	const { content, compiler } = solution;
	return <Page title={localize("Solution")} sidebar={<Sidebar />}>
		<SolutionBlock solution={solution} />
		{content && <CollapseBlock title={localize("Content")} className="b-contest-solution-content">
			<Code value={content} language={compiler?.config?.extensions?.at(0)} />
		</CollapseBlock>}
		{!!solution.report?.tests && <SolutionReportBlock report={solution.report} />}
	</Page>;
};

export default SolutionPage;
