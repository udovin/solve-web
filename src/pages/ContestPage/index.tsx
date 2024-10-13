import { FC, useEffect, useState } from "react";
import { Link, matchPath, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import Page from "../../components/Page";
import {
	BASE,
	Compilers,
	Contest,
	ContestMessages,
	ContestProblem,
	deleteContest,
	ErrorResponse,
	observeCompilers,
	observeContest,
	observeContestMessages,
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
import { ContestProblemsBlock, ContestProblemsSideBlock } from "./problems";
import { ContestSolutionsBlock, ContestSolutionBlock, ContestSubmitSolutionBlock } from "./solutions";
import { ContestParticipantsBlock } from "./participants";
import { ContestRegisterBlock } from "./register";
import { ContestStandingsBlock } from "./standings";
import Duration from "../../ui/Duration";
import { ContestTabs } from "./tabs";
import { ContestMessagesBlock, CreateContestMessageBlock, SubmitContestQuestionBlock } from "./messages";
import { EditContestBlock } from "./manage";
import FileInput from "../../ui/FileInput";
import { useLocale } from "../../ui/Locale";

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
	const { localize } = useLocale();
	const [newSolution, setNewSolution] = useState<Solution>();
	const [file, setFile] = useState<File>();
	const [compiler, setCompiler] = useState<number>();
	const [error, setError] = useState<ErrorResponse>();
	const [compilers, setCompilers] = useState<Compilers>();
	const [uploading, setUploading] = useState<boolean>(false);
	const selectedCompiler = compiler ?? toNumber(localStorage.getItem("last_compiler"));
	const compilerInfo = compilers?.compilers?.find(compiler => compiler.id === selectedCompiler);
	const extensions = compilerInfo?.config?.extensions?.map(ext => `.${ext}`).join(",");
	const canSubmitSolution = contest.permissions?.includes("submit_contest_solution");
	const onSubmit = (event: any) => {
		event.preventDefault();
		if (uploading || !file || !compilerInfo) {
			return;
		}
		setUploading(true);
		setError(undefined);
		submitContestSolution(Number(contest_id), String(problem_code), {
			compiler_id: compilerInfo.id,
			file: file,
		})
			.then(solution => {
				setNewSolution(solution);
				setFile(undefined);
				setError(undefined);
				localStorage.setItem("last_compiler", String(compilerInfo.id));
			})
			.catch(setError)
			.finally(() => setUploading(false));
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
	return <FormBlock onSubmit={onSubmit} title={localize("Submit solution")} className="b-contest-side-submit" footer={<>
		<Button
			type="submit"
			color="primary"
			disabled={!canSubmitSolution || uploading || !file || !compilerInfo}
		>{localize("Submit")}</Button>
		<span>{localize("or")} <Link to={`/contests/${contest_id}/submit?problem=${problem_code}`}>{localize("paste source code")}</Link>.</span>
	</>}>
		{errorMessage && <Alert>{errorMessage}</Alert>}
		<Field title={localize("Compiler") + ":"} name="compiler_id" errorResponse={error}>
			<Select
				name="compiler_id"
				value={String(compilerInfo?.id ?? localize("Select compiler"))}
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
				disabled={!canSubmitSolution || !compilers?.compilers}
			/>
		</Field>
		<Field title={localize("Solution file") + ":"} name="file" errorResponse={error}>
			<FileInput
				name="file"
				accept={extensions}
				file={file}
				onFileChange={setFile}
				disabled={!canSubmitSolution}
				required />
		</Field>
	</FormBlock>;
};

const ContestProblemBlock: FC = () => {
	const { contest_id, problem_code } = useParams();
	const [problem, setProblem] = useState<ContestProblem>();
	useEffect(() => {
		observeContestProblem(Number(contest_id), problem_code ?? "")
			.then(setProblem);
	}, [contest_id, problem_code]);
	if (!problem) {
		return <>Loading...</>;
	}
	return <ProblemBlock
		problem={problem.problem}
		code={problem.code}
		imageBaseUrl={`${BASE}/api/v0/contests/${contest_id}/problems/${problem_code}/statement-files/`}
	/>;
};

export type DeleteContestBlockProps = {
	contest: Contest;
};

const DeleteContestBlock: FC<DeleteContestBlockProps> = props => {
	const { contest } = props;
	const { localize } = useLocale();
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
	return <FormBlock className="b-contest-edit" title={localize("Delete contest")} onSubmit={onSubmit} footer={<>
		<Button
			type="submit" color="danger"
			disabled={title !== contest.title}
		>{localize("Delete contest")}</Button>
		{title && <Button type="reset" onClick={onResetForm}>Reset</Button>}
	</>}>
		{error && error.message && <Alert>{error.message}</Alert>}
		<Field title={localize("Enter title of contest") + ":"}>
			<Input
				type="text" name="title" placeholder={localize("Title")}
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

const ContestSubmitSolutionTab: FC<ContestTabProps> = props => {
	const { contest } = props;
	return <TabContent tab="submit" setCurrent>
		<ContestSubmitSolutionBlock contest={contest} />
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
	const { localize } = useLocale();
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
			<div className="stage">{localize("Contest not started")}</div>
			{!!beforeDuration && <div className="duration" suppressHydrationWarning={true}>
				<Duration value={beforeDuration} />
			</div>}
		</>}
		{state?.stage === "started" && <>
			<div className="stage">{localize("Contest running")}</div>
			{!!remainingDuration && <div className="duration" suppressHydrationWarning={true}>
				<Duration value={remainingDuration} />
			</div>}
		</>}
		{state?.stage === "finished" && <>
			<div className="stage">{localize("Contest finished")}</div>
		</>}
	</Block>;
};

const ContestPage: FC = () => {
	const params = useParams();
	const location = useLocation();
	const { contest_id } = params;
	const { localize } = useLocale();
	const [contest, setContest] = useState<Contest>();
	const [newMessages, setNewMessages] = useState<number>(0);
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
				observeContest(contest.id)
					.then(setContest)
					.catch(console.log);
			} else if (contest?.state?.stage === "started" && remainingDuration !== undefined && remainingDuration <= 0) {
				observeContest(contest.id)
					.then(setContest)
					.catch(console.log);
			}
		}, 1000);
		return () => clearInterval(intervalID);
	}, [contest, setContest]);
	useEffect(() => {
		if (!contest || contest.state?.stage !== "started") {
			return;
		}
		if (!contest.permissions?.includes("observe_contest_messages")) {
			return;
		}
		if (!contest.state?.participant) {
			return;
		}
		const seenMessage = toNumber(localStorage.getItem("contest_seen_message")) ?? 0;
		observeContestMessages(contest.id)
			.then((messages: ContestMessages) => {
				let newMessages: number = 0;
				messages.messages?.forEach(message => {
					if (message.participant?.id === contest.state?.participant?.id) {
						return;
					}
					if (message.id > seenMessage) {
						newMessages++;
					}
				});
				setNewMessages(newMessages);
			})
			.catch(console.log);
	}, [contest]);
	useEffect(() => {
		if (!contest || contest.state?.stage !== "started") {
			return;
		}
		if (!contest.permissions?.includes("observe_contest_messages")) {
			return;
		}
		if (!contest.state?.participant) {
			return;
		}
		const intervalID = setInterval(() => {
			const seenMessage = toNumber(localStorage.getItem("contest_seen_message")) ?? 0;
			observeContestMessages(contest.id)
				.then((messages: ContestMessages) => {
					let newMessages: number = 0;
					messages.messages?.forEach(message => {
						if (message.participant?.id === contest.state?.participant?.id) {
							return;
						}
						if (message.id > seenMessage) {
							newMessages++;
						}
					});
					setNewMessages(newMessages);
				})
				.catch(console.log);
		}, 2000);
		return () => clearInterval(intervalID);
	}, [contest]);
	if (!contest) {
		return <>Loading...</>;
	}
	const { title, permissions } = contest;
	const canObserveProblems = permissions?.includes("observe_contest_problems");
	const canObserveMessages = permissions?.includes("observe_contest_messages");
	const canSubmitSolution = permissions?.includes("submit_contest_solution");
	const canSubmitQuestion = permissions?.includes("submit_contest_question");
	const canCreateMessage = permissions?.includes("create_contest_message");
	const canObserveParticipants = permissions?.includes("observe_contest_participants");
	const canObserveStandings = permissions?.includes("observe_contest_standings") &&
		contest.standings_kind !== undefined &&
		contest.standings_kind !== "disabled";
	const canManageContest = permissions?.includes("update_contest") || permissions?.includes("delete_contest");
	const isIndex = matchPath({ path: "/contests/:contest_id" }, location.pathname);
	const isStandings = matchPath({ path: "/contests/:contest_id/standings" }, location.pathname);
	if (isIndex && !canObserveProblems && canObserveStandings) {
		return <Navigate to={`/contests/${contest.id}/standings`} replace />;
	}
	return <Page title={localize("Contest") + ": " + title} sidebar={(isStandings || (isIndex && !canObserveProblems)) ? undefined : <Routes>
		<Route path="/problems/:problem_code" element={<>
			<ContestSideBlock contest={contest} />
			<ContestProblemSideBlock contest={contest} />
			<ContestProblemsSideBlock contest={contest} />
		</>} />
		<Route path="*" element={<ContestSideBlock contest={contest} />} />
	</Routes>}>
		<TabsGroup>
			{(isIndex && !canObserveProblems) ? <></> : <ContestTabs contest={contest} newMessages={newMessages} />}
			<Routes>
				<Route index element={<ContestProblemsTab contest={contest} />} />
				{canObserveProblems && <Route path="/problems" element={<ContestProblemsTab contest={contest} />} />}
				<Route path="/solutions" element={<ContestSolutionsTab contest={contest} />} />
				{canSubmitSolution && <Route path="/submit" element={<ContestSubmitSolutionTab contest={contest} />} />}
				{canObserveStandings && <Route path="/standings" element={<ContestStandingsTab contest={contest} />} />}
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
