import { ChangeEvent, FC, useEffect, useState } from "react";
import { matchPath, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
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
	Solution,
	submitContestSolution,
	updateContest,
} from "../../api";
import Block, { BlockProps } from "../../ui/Block";
import FormBlock from "../../components/FormBlock";
import Field from "../../ui/Field";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import Alert from "../../ui/Alert";
import { Tab, TabContent, Tabs, TabsGroup } from "../../ui/Tabs";
import DurationInput from "../../ui/DurationInput";
import Checkbox from "../../ui/Checkbox";
import Select from "../../ui/Select";
import { ProblemBlock } from "../ProblemPage";
import { ContestProblemsBlock } from "./problems";
import { ContestSolutionsBlock, ContestSolutionBlock } from "./solutions";
import { ContestParticipantsBlock } from "./participants";
import { ContestRegisterBlock } from "./register";
import { ContestStandingsBlock } from "./standings";
import Duration from "../../ui/Duration";

import "./index.scss";

const ContestProblemSideBlock: FC = () => {
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
		<Button type="submit" color="primary">Submit</Button>
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
		fetch(`/api/v0/contests/${contest_id}/problems/${problem_code}`)
			.then(result => result.json())
			.then(result => setProblem(result));
	}, [contest_id, problem_code]);
	if (!problem) {
		return <>Loading...</>;
	}
	return <ProblemBlock
		problem={problem}
		imageBaseUrl={`${BASE}/api/v0/contests/${contest_id}/problems/${problem_code}/resources/`}
	/>;
};

type ContestTabsProps = BlockProps & {
	contest: Contest;
	currentTab?: string;
};

const ContestTabs: FC<ContestTabsProps> = props => {
	const { contest } = props;
	const { id, permissions, state } = contest;
	const canRegister = !state?.participant && permissions?.includes("register_contest");
	const canObserveProblems = permissions?.includes("observe_contest_problems");
	const canObserveSolutions = permissions?.includes("observe_contest_solutions");
	const canObserveStandings = permissions?.includes("observe_contest_standings");
	const canObserveParticipants = permissions?.includes("observe_contest_participants");
	const canManage = permissions?.includes("update_contest") || permissions?.includes("delete_contest");
	return <Block className="b-contest-tabs">
		<Tabs>
			{canObserveProblems && <Tab tab="problems">
				<Link to={`/contests/${id}`}>Problems</Link>
			</Tab>}
			{canObserveSolutions && <Tab tab="solutions">
				<Link to={`/contests/${id}/solutions`}>Solutions</Link>
			</Tab>}
			{canObserveStandings && <Tab tab="standings">
				<Link to={`/contests/${id}/standings`}>Standings</Link>
			</Tab>}
			{canObserveParticipants && <Tab tab="participants">
				<Link to={`/contests/${id}/participants`}>Participants</Link>
			</Tab>}
			{canRegister && <Tab tab="register">
				<Link to={`/contests/${id}/register`}>Register</Link>
			</Tab>}
			{canManage && <Tab tab="manage">
				<Link to={`/contests/${id}/manage`}>Manage</Link>
			</Tab>}
		</Tabs>
	</Block>;
};

export type EditContestBlockProps = {
	contest: Contest;
	onUpdateContest?(contest: Contest): void;
};

const toNumber = (n?: string | null) => {
	return (n === undefined || n === null) ? undefined : Number(n);
};

const toBoolean = (n?: string) => {
	return n === undefined ? undefined : n === "true";
};

const EditContestBlock: FC<EditContestBlockProps> = props => {
	const { contest, onUpdateContest } = props;
	const [form, setForm] = useState<{ [key: string]: string }>({});
	const [error, setError] = useState<ErrorResponse>();
	const onResetForm = () => {
		setForm({});
		setError(undefined);
	};
	const onSubmit = (event: any) => {
		event.preventDefault();
		updateContest(contest.id, {
			title: form.title,
			begin_time: toNumber(form.begin_time),
			duration: toNumber(form.duration),
			enable_registration: toBoolean(form.enable_registration),
			enable_upsolving: toBoolean(form.enable_upsolving),
		})
			.then(contest => {
				onResetForm();
				onUpdateContest && onUpdateContest(contest);
			})
			.catch(setError);
	};
	return <FormBlock className="b-contest-edit" title="Edit contest" onSubmit={onSubmit} footer={<>
		<Button
			type="submit" color="primary"
			disabled={!Object.keys(form).length}
		>Change</Button>
		{!!Object.keys(form).length && <Button type="reset" onClick={onResetForm}>Reset</Button>}
	</>}>
		{error && error.message && <Alert>{error.message}</Alert>}
		<Field title="Title:">
			<Input
				type="text" name="title" placeholder="Title"
				value={form.title ?? contest.title}
				onValueChange={value => setForm({ ...form, title: value })}
				required />
			{error && error.invalid_fields && error.invalid_fields["title"] && <Alert>{error.invalid_fields["title"].message}</Alert>}
		</Field>
		<Field title="Begin time:">
			<Input
				type="number" name="begin_time" placeholder="Begin time"
				value={form.begin_time ?? (contest.begin_time ? String(contest.begin_time) : "")}
				onValueChange={value => setForm({ ...form, begin_time: value })} />
			{error && error.invalid_fields && error.invalid_fields["begin_time"] && <Alert>{error.invalid_fields["begin_time"].message}</Alert>}
		</Field>
		<Field title="Duration:">
			<DurationInput
				value={toNumber(form.duration) ?? contest.duration}
				onValueChange={value => setForm({ ...form, duration: String(value) })} />
			{error && error.invalid_fields && error.invalid_fields["duration"] && <Alert>{error.invalid_fields["duration"].message}</Alert>}
		</Field>
		<Field name="enable_registration" errorResponse={error}>
			<Checkbox
				value={toBoolean(form.enable_registration) ?? contest.enable_registration ?? false}
				onValueChange={value => setForm({ ...form, enable_registration: value ? "true" : "false" })} />
			<span className="label">Enable registration</span>
		</Field>
		<Field name="enable_upsolving" errorResponse={error}>
			<Checkbox
				value={toBoolean(form.enable_upsolving) ?? contest.enable_upsolving ?? false}
				onValueChange={value => setForm({ ...form, enable_upsolving: value ? "true" : "false" })} />
			<span className="label">Enable upsolving</span>
		</Field>
	</FormBlock>;
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
	return <TabContent tab="problems" setCurrent>
		<ContestProblemsBlock contest={contest} />
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
		<ContestStandingsBlock contest={contest} />
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

type ContestSideBlockProps = {
	contest: Contest;
	onUpdateContest(contest: Contest): void;
};

const ContestSideBlock: FC<ContestSideBlockProps> = props => {
	const { contest, onUpdateContest } = props;
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
	useEffect(() => {
		if (state?.stage === "not_started" && beforeDuration !== undefined && beforeDuration <= 0) {
			observeContest(contest.id).then(onUpdateContest);
		} else if (state?.stage === "started" && remainingDuration !== undefined && remainingDuration <= 0) {
			observeContest(contest.id).then(onUpdateContest);
		}
	}, [beforeDuration, remainingDuration, state, contest, onUpdateContest]);
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
	useEffect(() => {
		observeContest(Number(contest_id))
			.then(contest => setContest(contest));
	}, [contest_id]);
	if (!contest) {
		return <>Loading...</>;
	}
	const { title, permissions } = contest;
	const canManageContest = permissions?.includes("update_contest") || permissions?.includes("delete_contest");
	const isStandings = matchPath({ path: "/contests/:contest_id/standings" }, location.pathname);
	return <Page title={`Contest: ${title}`} sidebar={isStandings ? undefined : <Routes>
		<Route path="/problems/:problem_code" element={<>
			<ContestSideBlock contest={contest} onUpdateContest={setContest} />
			<ContestProblemSideBlock />
		</>} />
		<Route path="*" element={<ContestSideBlock contest={contest} onUpdateContest={setContest} />} />
	</Routes>}>
		<TabsGroup>
			<ContestTabs contest={contest} />
			<Routes>
				<Route index element={<ContestProblemsTab contest={contest} />} />
				<Route path="/problems" element={<ContestProblemsTab contest={contest} />} />
				<Route path="/solutions" element={<ContestSolutionsTab contest={contest} />} />
				<Route path="/standings" element={<ContestStandingsTab contest={contest} />} />
				{canManageContest && <Route path="/participants" element={<ContestParticipantsTab contest={contest} />} />}
				<Route path="/register" element={<ContestRegisterTab contest={contest} />} />
				<Route path="/solutions/:solution_id" element={<ContestSolutionTab contest={contest} />} />
				<Route path="/problems/:problem_code" element={<ContestProblemTab contest={contest} />} />
				<Route path="/manage" element={<ContestManageTab contest={contest} setContest={setContest} />} />
			</Routes>
		</TabsGroup>
	</Page>;
};

export default ContestPage;
