import { ChangeEvent, FC, useEffect, useState } from "react";
import { matchPath, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import Page from "../../components/Page";
import {
	BASE,
	Compilers,
	Contest,
	ContestProblem,
	deleteContest,
	ErrorResponse,
	observeCompilers,
	observeContest,
	observeContestProblem,
	Solution,
	submitContestSolution,
} from "../../api";
import Block from "../../ui/Block";
import FormBlock from "../../components/FormBlock";
import Field from "../../ui/Field";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import Alert from "../../ui/Alert";
import { TabContent, TabsGroup } from "../../ui/Tabs";
import Select from "../../ui/Select";
import { ProblemBlock } from "../ProblemPage";
import { ContestProblemsBlock } from "./problems";
import { ContestSolutionsBlock, ContestSolutionBlock } from "./solutions";
import { ContestParticipantsBlock } from "./participants";
import { ContestRegisterBlock } from "./register";
import { ContestStandingsBlock } from "./standings";
import Duration from "../../ui/Duration";
import { ContestTabs } from "./tabs";
import { ContestMessagesBlock, CreateContestMessageBlock, SubmitContestQuestionBlock } from "./messages";
import { EditContestBlock } from "./manage";

import "./index.scss";

type ContestSideBlockProps = {
	contest: Contest;
};

const toNumber = (n?: string | null) => {
	return (n === undefined || n === null) ? undefined : Number(n);
};

const ContestProblemSideBlock: FC<ContestSideBlockProps> = props => {
	const { contest } = props;
	const params = useParams();
	const { contest_id, problem_code } = params;
	const [newSolution, setNewSolution] = useState<Solution>();
	const [file, setFile] = useState<File>();
	const [compiler, setCompiler] = useState<number>();
	const [error, setError] = useState<ErrorResponse>();
	const [compilers, setCompilers] = useState<Compilers>();
	const selectedCompiler = compiler ?? toNumber(localStorage.getItem("last_compiler"));
	const compilerInfo = compilers?.compilers?.find(compiler => compiler.id === selectedCompiler);
	const extensions = compilerInfo?.config?.extensions?.map(ext => `.${ext}`).join(",");
	const canSubmitSolution = contest.permissions?.includes("submit_contest_solution");
	const onSubmit = (event: any) => {
		event.preventDefault();
		setError(undefined);
		file && compilerInfo && submitContestSolution(Number(contest_id), String(problem_code), {
			compiler_id: compilerInfo.id,
			file: file,
		})
			.then(solution => {
				setNewSolution(solution);
				setFile(undefined);
				setError(undefined);
				localStorage.setItem("last_compiler", String(compilerInfo.id));
			})
			.catch(setError);
	};
	useEffect(() => {
		observeCompilers()
			.then(setCompilers)
			.catch(setError)
	}, []);
	if (newSolution) {
		return <Navigate to={`/contests/${contest_id}/solutions`} />
	}
	const errorMessage = error && error.message;
	const invalidFields = (error && error.invalid_fields) || {};
	return <FormBlock onSubmit={onSubmit} title="Submit solution" footer={
		<Button type="submit" color="primary" disabled={!canSubmitSolution}>Submit</Button>
	}>
		{errorMessage && <Alert>{errorMessage}</Alert>}
		<Field title="Compiler:" name="compiler_id" errorResponse={error}>
			<Select
				name="compiler_id"
				value={String(compilerInfo?.id ?? "Select compiler")}
				onValueChange={value => setCompiler(Number(value))}
				options={compilers?.compilers?.reduce((options, compiler) => {
					let name = compiler.name;
					if (compiler.config?.language) {
						name = compiler.config.language;
						if (compiler.config.compiler) {
							name += ` (${compiler.config.compiler})`;
						}
					}
					return { ...options, [compiler.id]: name };
				}, {}) ?? {}}
				disabled={!compilers?.compilers}
			/>
		</Field>
		<Field title="Solution file:">
			<input
				type="file" name="file"
				accept={extensions}
				onChange={(e: ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0])}
				required />
			{invalidFields["file"] && <Alert>{invalidFields["file"].message}</Alert>}
		</Field>
	</FormBlock >;
};

const ContestProblemBlock: FC = () => {
	const params = useParams();
	const { contest_id, problem_code } = params;
	const [problem, setProblem] = useState<ContestProblem>();
	useEffect(() => {
		observeContestProblem(Number(contest_id), problem_code ?? "")
			.then(setProblem);
	}, [contest_id, problem_code]);
	if (!problem) {
		return <>Loading...</>;
	}
	return <ProblemBlock
		problem={problem}
		imageBaseUrl={`${BASE}/api/v0/contests/${contest_id}/problems/${problem_code}/resources/`}
	/>;
};

export type DeleteContestBlockProps = {
	contest: Contest;
};

const DeleteContestBlock: FC<DeleteContestBlockProps> = props => {
	const { contest } = props;
	const [redirect, setRedirect] = useState<boolean>(false);
	const [title, setTitle] = useState<string>();
	const [error, setError] = useState<ErrorResponse>();
	const onSubmit = (event: any) => {
		event.preventDefault();
		deleteContest(contest.id)
			.then(() => setRedirect(true))
			.catch(setError);
	};
	const onResetForm = () => {
		setTitle(undefined);
		setError(undefined);
	};
	if (redirect) {
		return <Navigate to="/" />;
	}
	return <FormBlock className="b-contest-edit" title="Delete contest" onSubmit={onSubmit} footer={<>
		<Button
			type="submit" color="danger"
			disabled={title !== contest.title}
		>Delete contest</Button>
		{title && <Button type="reset" onClick={onResetForm}>Reset</Button>}
	</>}>
		{error && error.message && <Alert>{error.message}</Alert>}
		<Field title="Enter title of contest:">
			<Input
				type="text" name="title" placeholder="Title"
				value={title ?? ""}
				onValueChange={value => setTitle(value)}
				required autoComplete="off" />
		</Field>
	</FormBlock>;
};

type ContestTabProps = {
	contest: Contest;
	setContest?(contest: Contest): void;
};

const ContestProblemsTab: FC<ContestTabProps> = props => {
	const { contest } = props;
	const { permissions } = contest;
	const canObserveProblems = permissions?.includes("observe_contest_problems");
	return <TabContent tab="problems" setCurrent>
		{canObserveProblems ? <ContestProblemsBlock contest={contest} /> : <ContestSideBlock contest={contest} />}
	</TabContent>;
};

const ContestSolutionsTab: FC<ContestTabProps> = props => {
	const { contest } = props;
	return <TabContent tab="solutions" setCurrent>
		<ContestSolutionsBlock contest={contest} />
	</TabContent>;
};

const ContestStandingsTab: FC<ContestTabProps> = props => {
	const { contest } = props;
	return <TabContent tab="standings" setCurrent>
		<ContestSideBlock contest={contest} />
		<ContestStandingsBlock contest={contest} />
	</TabContent>;
};

const ContestMessagesTab: FC<ContestTabProps> = props => {
	const { contest } = props;
	return <TabContent tab="messages" setCurrent>
		<ContestMessagesBlock contest={contest} />
	</TabContent>;
};

const ContestQuestionTab: FC<ContestTabProps> = props => {
	const { contest } = props;
	return <TabContent tab="question" setCurrent>
		<SubmitContestQuestionBlock contest={contest} />
	</TabContent>;
};

const ContestCreateMessageTab: FC<ContestTabProps> = props => {
	const { contest } = props;
	return <TabContent tab="create-message" setCurrent>
		<CreateContestMessageBlock contest={contest} />
	</TabContent>;
};

const ContestRegisterTab: FC<ContestTabProps> = props => {
	const { contest } = props;
	return <TabContent tab="register" setCurrent>
		<ContestRegisterBlock contest={contest} />
	</TabContent>;
};

const ContestParticipantsTab: FC<ContestTabProps> = props => {
	const { contest } = props;
	return <TabContent tab="participants" setCurrent>
		<ContestParticipantsBlock contest={contest} />
	</TabContent>;
};

const ContestSolutionTab: FC<ContestTabProps> = props => {
	const { contest } = props;
	const params = useParams();
	return <TabContent tab="solution" setCurrent>
		<ContestSolutionBlock contest={contest} solutionID={Number(params.solution_id)} />
	</TabContent>;
};

const ContestProblemTab: FC<ContestTabProps> = props => {
	return <TabContent tab="problem" setCurrent>
		<ContestProblemBlock />
	</TabContent>;
};

const ContestManageTab: FC<ContestTabProps> = props => {
	const { contest, setContest } = props;
	const { permissions } = contest;
	return <TabContent tab="manage" setCurrent>
		{permissions?.includes("update_contest") && <EditContestBlock contest={contest} onUpdateContest={setContest} />}
		{permissions?.includes("delete_contest") && <DeleteContestBlock contest={contest} />}
	</TabContent>;
};

const ContestSideBlock: FC<ContestSideBlockProps> = props => {
	const { contest } = props;
	const { state } = contest;
	const getNow = () => {
		return Math.round((new Date()).getTime() / 1000);
	};
	const [now, setNow] = useState(getNow());
	const beforeDuration = contest.begin_time && Math.max(contest.begin_time - now, 0);
	const remainingDuration = contest.begin_time && contest.duration && Math.max(contest.begin_time + contest.duration - now, 0);
	useEffect(() => {
		if (!remainingDuration || remainingDuration <= 0) {
			return;
		}
		const intervalID = setInterval(() => setNow(getNow()), 1000);
		return () => clearInterval(intervalID);
	}, [remainingDuration, setNow]);
	return <Block className="b-contest-side">
		<h3>{contest.title}</h3>
		{state?.stage === "not_started" && <>
			<div className="stage">Not started</div>
			{!!beforeDuration && <div className="duration"><Duration value={beforeDuration} /></div>}
		</>}
		{state?.stage === "started" && <>
			<div className="stage">Running</div>
			{!!remainingDuration && <div className="duration"><Duration value={remainingDuration} /></div>}
		</>}
		{state?.stage === "finished" && <>
			<div className="stage">Finished</div>
		</>}
	</Block>;
};

const ContestPage: FC = () => {
	const params = useParams();
	const location = useLocation();
	const { contest_id } = params;
	const [contest, setContest] = useState<Contest>();
	const getNow = () => {
		return Math.round((new Date()).getTime() / 1000);
	};
	useEffect(() => {
		observeContest(Number(contest_id))
			.then(contest => setContest(contest));
	}, [contest_id]);
	useEffect(() => {
		if (!contest || contest.state?.stage === "finished") {
			return;
		}
		const intervalID = setInterval(() => {
			const beforeDuration = contest?.begin_time && Math.max(contest.begin_time - getNow(), 0);
			const remainingDuration = contest?.begin_time && contest.duration && Math.max(contest.begin_time + contest.duration - getNow(), 0);
			if (contest?.state?.stage === "not_started" && beforeDuration !== undefined && beforeDuration <= 0) {
				observeContest(contest.id).then(setContest);
			} else if (contest?.state?.stage === "started" && remainingDuration !== undefined && remainingDuration <= 0) {
				observeContest(contest.id).then(setContest);
			}
		}, 1000);
		return () => clearInterval(intervalID);
	}, [contest, setContest]);
	if (!contest) {
		return <>Loading...</>;
	}
	const { title, permissions } = contest;
	const canObserveProblems = permissions?.includes("observe_contest_problems");
	const canObserveMessages = permissions?.includes("observe_contest_messages");
	const canSubmitQuestion = permissions?.includes("submit_contest_question");
	const canCreateMessage = permissions?.includes("create_contest_message");
	const canObserveParticipants = permissions?.includes("observe_contest_participants");
	const canManageContest = permissions?.includes("update_contest") || permissions?.includes("delete_contest");
	const isIndex = matchPath({ path: "/contests/:contest_id" }, location.pathname);
	const isStandings = matchPath({ path: "/contests/:contest_id/standings" }, location.pathname);
	return <Page title={`Contest: ${title}`} sidebar={(isStandings || (isIndex && !canObserveProblems)) ? undefined : <Routes>
		<Route path="/problems/:problem_code" element={<>
			<ContestSideBlock contest={contest} />
			<ContestProblemSideBlock contest={contest} />
		</>} />
		<Route path="*" element={<ContestSideBlock contest={contest} />} />
	</Routes>}>
		<TabsGroup>
			{(isIndex && !canObserveProblems) ? <></> : <ContestTabs contest={contest} />}
			<Routes>
				<Route index element={<ContestProblemsTab contest={contest} />} />
				{canObserveProblems && <Route path="/problems" element={<ContestProblemsTab contest={contest} />} />}
				<Route path="/solutions" element={<ContestSolutionsTab contest={contest} />} />
				<Route path="/standings" element={<ContestStandingsTab contest={contest} />} />
				{canObserveMessages && <Route path="/messages" element={<ContestMessagesTab contest={contest} />} />}
				{canSubmitQuestion && <Route path="/question" element={<ContestQuestionTab contest={contest} />} />}
				{canCreateMessage && <Route path="/messages/create" element={<ContestCreateMessageTab contest={contest} />} />}
				{canObserveParticipants && <Route path="/participants" element={<ContestParticipantsTab contest={contest} />} />}
				<Route path="/register" element={<ContestRegisterTab contest={contest} />} />
				<Route path="/solutions/:solution_id" element={<ContestSolutionTab contest={contest} />} />
				<Route path="/problems/:problem_code" element={<ContestProblemTab contest={contest} />} />
				{canManageContest && <Route path="/manage" element={<ContestManageTab contest={contest} setContest={setContest} />} />}
				<Route path="*" element={<Navigate to={`/contests/${contest_id}`} />} />
			</Routes>
		</TabsGroup>
	</Page>;
};

export default ContestPage;
