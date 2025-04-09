import { FC, ReactNode, useEffect, useState } from "react";
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

const SetValue: FC<{ value?: string, setValue(tab?: string): void, children?: ReactNode }> = props => {
	const { value, setValue, children } = props;
	useEffect(() => setValue(value), [value, setValue]);
	return <>{children}</>
};

type ContestTabProps = {
	contest: Contest;
	setContest?(contest: Contest): void;
	setTab(tab?: string): void;
};

const ContestProblemsTab: FC<ContestTabProps> = props => {
	const { contest, setTab } = props;
	const { permissions } = contest;
	const canObserveProblems = permissions?.includes("observe_contest_problems");
	return <SetValue value="problems" setValue={setTab}>
		{canObserveProblems ? <ContestProblemsBlock contest={contest} /> : <ContestSideBlock contest={contest} />}
	</SetValue>;
};

const ContestSubmitSolutionTab: FC<ContestTabProps> = props => {
	const { contest, setTab } = props;
	return <SetValue value="submit" setValue={setTab}>
		<ContestSubmitSolutionBlock contest={contest} />
	</SetValue>;
};

const ContestSolutionsTab: FC<ContestTabProps> = props => {
	const { contest, setTab } = props;
	return <SetValue value="solutions" setValue={setTab}>
		<ContestSolutionsBlock contest={contest} />
	</SetValue>;
};

const ContestStandingsTab: FC<ContestTabProps> = props => {
	const { contest, setTab } = props;
	return <SetValue value="standings" setValue={setTab}>
		<ContestSideBlock contest={contest} />
		<ContestStandingsBlock contest={contest} />
	</SetValue>;
};

const ContestMessagesTab: FC<ContestTabProps> = props => {
	const { contest, setTab } = props;
	return <SetValue value="messages" setValue={setTab}>
		<ContestMessagesBlock contest={contest} />
	</SetValue>;
};

const ContestQuestionTab: FC<ContestTabProps> = props => {
	const { contest, setTab } = props;
	return <SetValue value="question" setValue={setTab}>
		<SubmitContestQuestionBlock contest={contest} />
	</SetValue>;
};

const ContestCreateMessageTab: FC<ContestTabProps> = props => {
	const { contest, setTab } = props;
	return <SetValue value="create-message" setValue={setTab}>
		<CreateContestMessageBlock contest={contest} />
	</SetValue>;
};

const ContestRegisterTab: FC<ContestTabProps> = props => {
	const { contest, setTab } = props;
	return <SetValue value="register" setValue={setTab}>
		<ContestRegisterBlock contest={contest} />
	</SetValue>;
};

const ContestParticipantsTab: FC<ContestTabProps> = props => {
	const { contest, setTab } = props;
	return <SetValue value="participants" setValue={setTab}>
		<ContestParticipantsBlock contest={contest} />
	</SetValue>;
};

const ContestSolutionTab: FC<ContestTabProps> = props => {
	const { contest, setTab } = props;
	const params = useParams();
	return <SetValue value="solution" setValue={setTab}>
		<ContestSolutionBlock contest={contest} solutionID={Number(params.solution_id)} />
	</SetValue>;
};

const ContestProblemTab: FC<ContestTabProps> = props => {
	const { setTab } = props;
	return <SetValue value="problem" setValue={setTab}>
		<ContestProblemBlock />
	</SetValue>;
};

const ContestManageTab: FC<ContestTabProps> = props => {
	const { contest, setContest, setTab } = props;
	const { permissions } = contest;
	return <SetValue value="manage" setValue={setTab}>
		{permissions?.includes("update_contest") && <EditContestBlock contest={contest} onUpdateContest={setContest} />}
		{permissions?.includes("delete_contest") && <DeleteContestBlock contest={contest} />}
	</SetValue>;
};

const ContestSideBlock: FC<ContestSideBlockProps> = props => {
	const { contest } = props;
	const { state } = contest;
	const getNow = () => {
		return Math.round((new Date()).getTime() / 1000);
	};
	const { localize } = useLocale();
	const [now, setNow] = useState(getNow());
	const beginTime = contest.state?.begin_time ?? contest.begin_time;
	const beforeDuration = beginTime && Math.max(beginTime - now, 0);
	const remainingDuration = beginTime && contest.duration && Math.max(beginTime + contest.duration - now, 0);
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
	const [tab, setTab] = useState<string>();
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
		// observeContestMessages(contest.id)
		// 	.then((messages: ContestMessages) => {
		// 		let newMessages: number = 0;
		// 		messages.messages?.forEach(message => {
		// 			if (message.participant?.id === contest.state?.participant?.id) {
		// 				return;
		// 			}
		// 			if (message.id > seenMessage) {
		// 				newMessages++;
		// 			}
		// 		});
		// 		setNewMessages(newMessages);
		// 	})
		// 	.catch(console.log);
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
		{(isIndex && !canObserveProblems) ? <></> : <ContestTabs contest={contest} tab={tab} newMessages={newMessages} />}
		<Routes>
			<Route index element={<ContestProblemsTab contest={contest} setTab={setTab} />} />
			{canObserveProblems && <Route path="/problems" element={<ContestProblemsTab contest={contest} setTab={setTab} />} />}
			<Route path="/solutions" element={<ContestSolutionsTab contest={contest} setTab={setTab} />} />
			{canSubmitSolution && <Route path="/submit" element={<ContestSubmitSolutionTab contest={contest} setTab={setTab} />} />}
			{canObserveStandings && <Route path="/standings" element={<ContestStandingsTab contest={contest} setTab={setTab} />} />}
			{canObserveMessages && <Route path="/messages" element={<ContestMessagesTab contest={contest} setTab={setTab} />} />}
			{canSubmitQuestion && <Route path="/question" element={<ContestQuestionTab contest={contest} setTab={setTab} />} />}
			{canCreateMessage && <Route path="/messages/create" element={<ContestCreateMessageTab contest={contest} setTab={setTab} />} />}
			{canObserveParticipants && <Route path="/participants" element={<ContestParticipantsTab contest={contest} setTab={setTab} />} />}
			<Route path="/register" element={<ContestRegisterTab contest={contest} setTab={setTab} />} />
			<Route path="/solutions/:solution_id" element={<ContestSolutionTab contest={contest} setTab={setTab} />} />
			<Route path="/problems/:problem_code" element={<ContestProblemTab contest={contest} setTab={setTab} />} />
			{canManageContest && <Route path="/manage" element={<ContestManageTab contest={contest} setContest={setContest} setTab={setTab} />} />}
			<Route path="*" element={<Navigate to={`/contests/${contest_id}`} />} />
		</Routes>
	</Page >;
}

export default ContestPage;
