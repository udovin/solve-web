import { ChangeEvent, FC, FormEvent, useEffect, useState } from "react";
import { Redirect, Route, RouteComponentProps, Switch } from "react-router";
import { Link } from "react-router-dom";
import Page from "../../components/Page";
import {
	Contest,
	ContestParticipant,
	ContestParticipants,
	ContestProblem,
	ContestProblems,
	ContestSolution,
	ContestSolutions,
	createContestParticipant,
	createContestProblem,
	deleteContest,
	deleteContestParticipant,
	deleteContestProblem,
	ErrorResponse,
	observeContestParticipants,
	observeContestProblems,
	observeContestSolutions,
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
import "./index.scss";

type ContestPageParams = {
	contest_id: string;
}

type ContestBlockParams = {
	contest: Contest;
};

const ContestProblemsBlock: FC<ContestBlockParams> = props => {
	const { contest } = props;
	const [error, setError] = useState<ErrorResponse>();
	const [problems, setProblems] = useState<ContestProblems>();
	useEffect(() => {
		observeContestProblems(contest.id)
			.then(problems => {
				setProblems(problems)
				setError(undefined)
			})
			.catch(setError)
	}, [contest.id]);
	if (!problems) {
		return <Block title="Problems" className="b-contest-problems">
			{error ? <Alert>{error.message}</Alert> : "Loading..."}
		</Block>;
	}
	let contestProblems: ContestProblem[] = problems.problems ?? [];
	contestProblems.sort((a, b: ContestProblem) => {
		return String(a.code).localeCompare(b.code);
	});
	return <Block title="Problems" className="b-contest-problems">{error ?
		<Alert>{error.message}</Alert> :
		<table className="ui-table">
			<thead>
				<tr>
					<th className="code">#</th>
					<th className="title">Title</th>
				</tr>
			</thead>
			<tbody>
				{contestProblems.map((problem: ContestProblem, key: number) => {
					const { code, title } = problem;
					return <tr key={key} className="problem">
						<td className="code">
							<Link to={`/contests/${contest.id}/problems/${code}`}>{code}</Link>
						</td>
						<td className="title">
							<Link to={`/contests/${contest.id}/problems/${code}`}>{title}</Link>
						</td>
					</tr>;
				})}
			</tbody>
		</table>
	}</Block>;
};

const ContestSolutionsBlock: FC<ContestBlockParams> = props => {
	const { contest } = props;
	const [error, setError] = useState<ErrorResponse>();
	const [solutions, setSolutions] = useState<ContestSolutions>();
	useEffect(() => {
		observeContestSolutions(contest.id)
			.then(result => setSolutions(result || []))
			.catch(setError);
	}, [contest.id]);
	if (!solutions) {
		return <Block title="Solutions" className="b-contest-solutions">
			{error ? <Alert>{error.message}</Alert> : "Loading..."}
		</Block>;
	}
	let contestSolutions: ContestSolution[] = solutions.solutions ?? [];
	return <Block title="Solutions" className="b-contest-solutions">{error ?
		<Alert>{error.message}</Alert> :
		<table className="ui-table">
			<thead>
				<tr>
					<th className="id">#</th>
					<th className="participant">Participant</th>
					<th className="problem">Problem</th>
					<th className="verdict">Verdict</th>
					<th className="points">Points</th>
				</tr>
			</thead>
			<tbody>
				{contestSolutions.map((solution: ContestSolution, key: number) => {
					const { id, report, participant, problem } = solution;
					return <tr key={key} className="problem">
						<td className="id">
							<Link to={`/contests/${contest.id}/solutions/${id}`}>{id}</Link>
						</td>
						<td className="participant">
							{participant && participant.user ? participant.user.login : <>&mdash;</>}
						</td>
						<td className="problem">
							{problem ? <Link to={`/contests/${contest.id}/problems/${problem.code}`}>{`${problem.code}. ${problem.title}`}</Link> : <>&mdash;</>}
						</td>
						<td className="verdict">
							{report ? report.verdict : "unknown"}
						</td>
						<td className="points">
							{(report && report.points) || <>&mdash;</>}
						</td>
					</tr>;
				})}
			</tbody>
		</table>
	}</Block>;
};

const CreateContestProblemBlock = ({ match }: RouteComponentProps<ContestPageParams>) => {
	const { contest_id } = match.params;
	const [success, setSuccess] = useState<boolean>();
	const onSubmit = (event: any) => {
		event.preventDefault();
		const { problemID, code } = event.target;
		fetch("/api/v0/contests/" + contest_id + "/problems", {
			method: "POST",
			headers: {
				"Content-Type": "application/json; charset=UTF-8",
			},
			body: JSON.stringify({
				ProblemID: Number(problemID.value),
				Code: code.value,
			})
		})
			.then(() => setSuccess(true));
	};
	if (success) {
		return <Redirect to={"/contests/" + contest_id} />
	}
	return <FormBlock onSubmit={onSubmit} title="Add contest problem" footer={
		<Button type="submit" color="primary">Create</Button>
	}>
		<Field title="Problem ID:">
			<Input type="number" name="problemID" placeholder="ID" required />
		</Field>
		<Field title="Code:">
			<Input type="text" name="code" placeholder="Code" required />
		</Field>
	</FormBlock>;
};

type ContestProblemPageParams = ContestPageParams & {
	problem_code: string;
}

const ContestProblemSideBlock = ({ match }: RouteComponentProps<ContestProblemPageParams>) => {
	const { contest_id, problem_code } = match.params;
	const [newSolution, setNewSolution] = useState<Solution>();
	const [file, setFile] = useState<File>();
	const [error, setError] = useState<ErrorResponse>();
	const onSubmit = (event: any) => {
		event.preventDefault();
		setError(undefined);
		file && submitContestSolution(Number(contest_id), problem_code, {
			file: file,
		})
			.then(solution => {
				setNewSolution(solution);
				setFile(undefined);
				setError(undefined);
			})
			.catch(setError);
	};
	if (newSolution) {
		return <Redirect to={`/solutions/${newSolution.id}`} />
	}
	const errorMessage = error && error.message;
	const invalidFields = (error && error.invalid_fields) || {};
	return <FormBlock onSubmit={onSubmit} title="Submit solution" footer={
		<Button color="primary">Submit</Button>
	}>
		{errorMessage && <Alert>{errorMessage}</Alert>}
		<Field title="Solution file:">
			<input
				type="file" name="file"
				onChange={(e: ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0])}
				required />
			{invalidFields["file"] && <Alert>{invalidFields["file"].message}</Alert>}
		</Field>
	</FormBlock>;
	// 	const [problem, setProblem] = useState<ContestProblem>();
	// 	const [compilers, setCompilers] = useState<Compiler[]>();
	// 	const [solution, setSolution] = useState<Solution>();
	// 	useEffect(() => {
	// 		fetch("/api/v0/compilers")
	// 			.then(result => result.json())
	// 			.then(result => setCompilers(result))
	// 	}, []);
	// 	useEffect(() => {
	// 		fetch("/api/v0/contests/" + contest_id + "/problems/" + problem_code)
	// 			.then(result => result.json())
	// 			.then(result => setProblem(result));
	// 	}, [contest_id, problem_code]);
	// 	if (solution) {
	// 		return <Redirect to={"/solutions/" + solution.ID} push={true}/>;
	// 	}
	// 	if (!problem) {
	// 		return <>Loading...</>;
	// 	}
	// 	return <>
	// 		<SubmitSolutionSideBlock onSubmit={onSubmit} compilers={compilers}/>
	// 		{problem.Solutions && <SolutionsSideBlock solutions={problem.Solutions}/>}
	// 	</>;
};

const ContestProblemBlock = ({ match }: RouteComponentProps<ContestProblemPageParams>) => {
	const { contest_id, problem_code } = match.params;
	const [problem, setProblem] = useState<ContestProblem>();
	useEffect(() => {
		fetch("/api/v0/contests/" + contest_id + "/problems/" + problem_code)
			.then(result => result.json())
			.then(result => setProblem(result));
	}, [contest_id, problem_code]);
	if (!problem) {
		return <>Loading...</>;
	}
	return <Block title={problem.title}>
		{/* <div className="problem-statement" dangerouslySetInnerHTML={{__html: problem.Description}}/> */}
	</Block>;
};

type ContestTabsProps = BlockProps & {
	contest: Contest;
	currentTab?: string;
};

const ContestTabs: FC<ContestTabsProps> = props => {
	const { contest, currentTab } = props;
	const getActiveClass = (name: string): string => {
		return name === currentTab ? "active" : "";
	};
	return <Block className="b-contest-tabs">
		<ul className="ui-tabs">
			<li className={getActiveClass("problems")}>
				<Link to={`/contests/${contest.id}`}>Problems</Link>
			</li>
			<li className={getActiveClass("solutions")}>
				<Link to={`/contests/${contest.id}/solutions`}>Solutions</Link>
			</li>
			{contest.permissions && (contest.permissions.includes("update_contest") || contest.permissions.includes("delete_contest")) && <li className={getActiveClass("manage")}>
				<Link to={`/contests/${contest.id}/manage`}>Manage</Link>
			</li>}
		</ul>
	</Block>;
};

export type EditContestBlockProps = {
	contest: Contest;
};

const EditContestBlock: FC<EditContestBlockProps> = props => {
	const { contest } = props;
	const [form, setForm] = useState<{ [key: string]: string }>({});
	const [error, setError] = useState<ErrorResponse>();
	const onSubmit = (event: any) => {
		event.preventDefault();
		updateContest(contest.id, form)
			.then(contest => {
				setForm({});
				setError(undefined);
			})
			.catch(setError);
	};
	const onResetForm = () => {
		setForm({});
		setError(undefined);
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
		return <Redirect to="/" />;
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

type EditContestProblemsBlockProps = {
	contest: Contest;
};

const EditContestProblemsBlock: FC<EditContestProblemsBlockProps> = props => {
	const { contest } = props;
	const [error, setError] = useState<ErrorResponse>();
	const [problems, setProblems] = useState<ContestProblems>();
	const [form, setForm] = useState<{ [key: string]: string }>({});
	useEffect(() => {
		observeContestProblems(contest.id)
			.then(problems => {
				setProblems(problems)
				setError(undefined)
			})
			.catch(setError);
	}, [contest.id]);
	const onSubmit = (event: FormEvent) => {
		event.preventDefault();
		createContestProblem(contest.id, {
			code: form.code ?? "",
			problem_id: Number(form.problem_id ?? 0),
		})
			.then(problem => {
				setProblems({ ...problems, problems: [...(problems?.problems ?? []), problem] });
				setForm({});
				setError(undefined);
			})
			.catch(setError);
	};
	const canCreateProblem = contest.permissions && contest.permissions.includes("create_contest_problem");
	const canDeleteProblem = contest.permissions && contest.permissions.includes("delete_contest_problem");
	if (!problems) {
		return <Block title="Problems" className="b-contest-problems">
			{error ? <Alert>{error.message}</Alert> : "Loading..."}
		</Block>;
	}
	let contestProblems: ContestProblem[] = problems.problems ?? [];
	contestProblems.sort((a, b: ContestProblem) => {
		const codeDiff = String(a.code).localeCompare(b.code);
		if (codeDiff) {
			return codeDiff;
		}
		return String(a.title).localeCompare(b.title);
	});
	return <Block
		title="Problems" className="b-contest-problems"
		footer={canCreateProblem && <form onSubmit={onSubmit}>
			<Input name="code"
				value={form.code || ""}
				onValueChange={value => setForm({ ...form, code: value })}
				placeholder="Code"
				required />
			<Input name="problem_id"
				value={form.problem_id || ""}
				onValueChange={value => setForm({ ...form, problem_id: value })}
				placeholder="Problem ID"
				required />
			<Button type="submit">Create</Button>
		</form>}
	>
		{error && <Alert>{error.message}</Alert>}
		<table className="ui-table">
			<thead>
				<tr>
					<th className="code">#</th>
					<th className="title">Title</th>
					<th className="actions">Actions</th>
				</tr>
			</thead>
			<tbody>
				{contestProblems.map((problem: ContestProblem, key: number) => {
					const { code, title } = problem;
					const deleteProblem = () => {
						deleteContestProblem(contest.id, code)
							.then(problem => {
								const contestProblems = [...(problems?.problems ?? [])];
								const pos = contestProblems.findIndex(value => value.code === problem.code && value.title === problem.title);
								if (pos >= 0) {
									contestProblems.splice(pos, 1);
								}
								setProblems({ ...problems, problems: contestProblems });
								setForm({});
								setError(undefined);
							})
							.catch(setError);
					};
					return <tr key={key} className="problem">
						<td className="code">{code}</td>
						<td className="title">{title}</td>
						<td className="actions">{canDeleteProblem && <Button onClick={deleteProblem}>Delete</Button>}</td>
					</tr>;
				})}
			</tbody>
		</table>
	</Block>;
};

type EditContestParticipantsBlockProps = {
	contest: Contest;
};

const EditContestParticipantsBlock: FC<EditContestParticipantsBlockProps> = props => {
	const { contest } = props;
	const [error, setError] = useState<ErrorResponse>();
	const [participants, setParticipants] = useState<ContestParticipants>();
	const [form, setForm] = useState<{ [key: string]: string }>({});
	useEffect(() => {
		observeContestParticipants(contest.id)
			.then(participants => {
				setParticipants(participants)
				setError(undefined)
			})
			.catch(setError);
	}, [contest.id]);
	const onSubmit = (event: FormEvent) => {
		event.preventDefault();
		createContestParticipant(contest.id, {
			user_id: Number(form.user_id ?? 0),
			user_login: form.user_id,
		})
			.then(participant => {
				setParticipants({ ...participants, participants: [...(participants?.participants ?? []), participant] });
				setForm({});
				setError(undefined);
			})
			.catch(setError);
	};
	const canCreateParticipant = contest.permissions && contest.permissions.includes("create_contest_participant");
	const canDeleteParticipant = contest.permissions && contest.permissions.includes("delete_contest_participant");
	if (!participants) {
		return <Block title="Participants" className="b-contest-participants">
			{error ? <Alert>{error.message}</Alert> : "Loading..."}
		</Block>;
	}
	let contestParticipants: ContestParticipant[] = participants.participants ?? [];
	contestParticipants.sort((a, b: ContestParticipant) => {
		return a.id - b.id;
	});
	return <Block
		title="Participants" className="b-contest-participants"
		footer={canCreateParticipant && <form onSubmit={onSubmit}>
			<Input name="user_id"
				value={form.user_id || ""}
				onValueChange={value => setForm({ ...form, user_id: value })}
				placeholder="User ID"
				required />
			<Button type="submit">Create</Button>
		</form>}
	>
		{error && <Alert>{error.message}</Alert>}
		<table className="ui-table">
			<thead>
				<tr>
					<th className="id">#</th>
					<th className="login">Login</th>
					<th className="actions">Actions</th>
				</tr>
			</thead>
			<tbody>
				{contestParticipants.map((participant: ContestParticipant, key: number) => {
					const { id, user } = participant;
					const deleteParticipant = () => {
						deleteContestParticipant(contest.id, id)
							.then(participant => {
								const contestParticipants = [...(participants?.participants ?? [])];
								const pos = contestParticipants.findIndex(value => value.id === participant.id);
								if (pos >= 0) {
									contestParticipants.splice(pos, 1);
								}
								setParticipants({ ...participants, participants: contestParticipants });
								setForm({});
								setError(undefined);
							})
							.catch(setError);
					};
					return <tr key={key} className="participant">
						<td className="id">{id}</td>
						<td className="login">{user?.login}</td>
						<td className="actions">{canDeleteParticipant && <Button onClick={deleteParticipant}>Delete</Button>}</td>
					</tr>;
				})}
			</tbody>
		</table>
	</Block>;
};


const ContestPage = ({ match }: RouteComponentProps<ContestPageParams>) => {
	const { contest_id } = match.params;
	const [contest, setContest] = useState<Contest>();
	const [currentTab, setCurrentTab] = useState<string>();
	useEffect(() => {
		fetch("/api/v0/contests/" + contest_id)
			.then(result => result.json())
			.then(result => setContest(result));
	}, [contest_id]);
	if (!contest) {
		return <>Loading...</>;
	}
	const { title, permissions } = contest;
	return <Page title={`Contest: ${title}`} sidebar={<Switch>
		<Route exact path="/contests/:contest_id/problems/:problem_code" component={ContestProblemSideBlock} />
	</Switch>}>
		<ContestTabs contest={contest} currentTab={currentTab} />
		<Switch>
			<Route exact path="/contests/:contest_id">
				{() => {
					setCurrentTab("problems");
					return <ContestProblemsBlock contest={contest} />;
				}}
			</Route>
			<Route exact path="/contests/:contest_id/solutions">
				{() => {
					setCurrentTab("solutions");
					return <ContestSolutionsBlock contest={contest} />;
				}}
			</Route>
			<Route exact path="/contests/:contest_id/manage">
				{() => {
					setCurrentTab("manage");
					return <>
						{permissions && permissions.includes("update_contest") && <EditContestBlock contest={contest} />}
						{permissions && (permissions.includes("observe_contest_problems")) && <EditContestProblemsBlock contest={contest} />}
						{permissions && (permissions.includes("observe_contest_participants")) && <EditContestParticipantsBlock contest={contest} />}
						{permissions && permissions.includes("delete_contest") && <DeleteContestBlock contest={contest} />}
					</>;
				}}
			</Route>
			<Route exact path="/contests/:contest_id/problems/create" component={CreateContestProblemBlock} />
			<Route exact path="/contests/:contest_id/problems/:problem_code" component={ContestProblemBlock} />
		</Switch>
	</Page>;
};

export default ContestPage;
