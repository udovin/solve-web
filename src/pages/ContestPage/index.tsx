import {FC, useEffect, useState} from "react";
import {Redirect, Route, RouteComponentProps, Switch} from "react-router";
import {Link} from "react-router-dom";
import Page from "../../components/Page";
import {Contest, ContestProblem, ContestProblems, deleteContest, ErrorResponse, observeContestProblems, Solution, updateContest} from "../../api";
import Block, { BlockProps } from "../../ui/Block";
// import {
// 	SolutionsBlock,
// 	SolutionsSideBlock,
// 	SubmitSolutionSideBlock
// } from "../../components/solutions";
import FormBlock from "../../components/FormBlock";
import Field from "../../ui/Field";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import "./index.scss";
import Alert from "../../ui/Alert";

type ContestPageParams = {
	contest_id: string;
}

type ContestBlockParams = {
	contest: Contest;
};

const ContestProblemsBlock: FC<ContestBlockParams> = props => {
	const {contest} = props;
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
			{problems?.problems && problems.problems.map((problem: ContestProblem, key: number) => {
				const {code, title} = problem;
				return <tr key={key} className="problem">
					<td className="code">{code}</td>
					<td className="title">{title}</td>
				</tr>;
			})}
			</tbody>
		</table>
	}</Block>;
};

const ContestSolutionsBlock: FC<ContestBlockParams> = props => {
	const {contest} = props;
	const [solutions, setSolutions] = useState<Solution[]>();
	useEffect(() => {
		fetch("/api/v0/contests/" + contest.id + "/solutions")
			.then(result => result.json())
			.then(result => setSolutions(result || []));
	}, [contest.id]);
	if (!solutions) {
		return <>Loading...</>;
	}
	return <></>;
	// return <SolutionsBlock title="Solutions" solutions={solutions}/>;
};

const CreateContestProblemBlock = ({match}: RouteComponentProps<ContestPageParams>) => {
	const {contest_id} = match.params;
	const [success, setSuccess] = useState<boolean>();
	const onSubmit = (event: any) => {
		event.preventDefault();
		const {problemID, code} = event.target;
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
		return <Redirect to={"/contests/" + contest_id}/>
	}
	return <FormBlock onSubmit={onSubmit} title="Add contest problem" footer={
		<Button type="submit" color="primary">Create</Button>
	}>
		<Field title="Problem ID:">
			<Input type="number" name="problemID" placeholder="ID" required autoFocus/>
		</Field>
		<Field title="Code:">
			<Input type="text" name="code" placeholder="Code" required/>
		</Field>
	</FormBlock>;
};

type ContestProblemPageParams = ContestPageParams & {
	problem_code: string;
}

// const ContestProblemSideBlock = ({match}: RouteComponentProps<ContestProblemPageParams>) => {
// 	const {contest_id, problem_code} = match.params;
// 	const [problem, setProblem] = useState<ContestProblem>();
// 	const [compilers, setCompilers] = useState<Compiler[]>();
// 	const [solution, setSolution] = useState<Solution>();
// 	const onSubmit = (event: any) => {
// 		event.preventDefault();
// 		const {sourceFile, sourceText, compilerID} = event.target;
// 		let create = (code: string) => {
// 			fetch("/api/v0/contests/" + contest_id + "/problems/" + problem_code, {
// 				method: "POST",
// 				headers: {
// 					"Content-Type": "application/json; charset=UTF-8",
// 				},
// 				body: JSON.stringify({
// 					CompilerID: Number(compilerID.value),
// 					SourceCode: code,
// 				})
// 			})
// 				.then(result => result.json())
// 				.then(result => setSolution(result));
// 		};
// 		if (sourceFile.files.length > 0) {
// 			let reader = new FileReader();
// 			reader.onload = (event: any) => create(event.target.result);
// 			reader.readAsText(sourceFile.files[0]);
// 		} else {
// 			create(sourceText.value);
// 		}
// 	};
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
// };

const ContestProblemBlock = ({match}: RouteComponentProps<ContestProblemPageParams>) => {
	const {contest_id, problem_code} = match.params;
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
	const {contest, currentTab} = props;
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
	const {contest} = props;
	const [form, setForm] = useState<{[key: string]: string}>({});
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
				onValueChange={value => setForm({...form, title: value})}
				required autoFocus/>
			{error && error.invalid_fields && error.invalid_fields["title"] && <Alert>{error.invalid_fields["title"].message}</Alert>}
		</Field>
	</FormBlock>;
};

export type DeleteContestBlockProps = {
	contest: Contest;
};

const DeleteContestBlock: FC<DeleteContestBlockProps> = props => {
	const {contest} = props;
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
		return <Redirect to="/"/>;
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
				required autoFocus autoComplete="off"/>
		</Field>
	</FormBlock>;
};

type EditContestProblemsBlockProps = {
	contest: Contest;
};

const EditContestProblemsBlock: FC<EditContestProblemsBlockProps> = props => {
	const {contest} = props;
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
	const canCreateProblem = contest.permissions && contest.permissions.includes("create_contest_problem");
	const canDeleteProblem = contest.permissions && contest.permissions.includes("delete_contest_problem");
	return <Block title="Problems" className="b-contest-problems">{error ? 
		<Alert>{error.message}</Alert> : 
		<table className="ui-table">
			<thead>
			<tr>
				<th className="code">#</th>
				<th className="title">Title</th>
				<th className="actions">Actions</th>
			</tr>
			</thead>
			<tbody>
			{problems?.problems && problems.problems.map((problem: ContestProblem, key: number) => {
				const {code, title} = problem;
				return <tr key={key} className="problem">
					<td className="code">{code}</td>
					<td className="title">{title}</td>
					<td className="actions">{canDeleteProblem && <Button>Delete</Button>}</td>
				</tr>;
			})}
			</tbody>
			<tfoot>
			{canCreateProblem && <tr>
				<td className="code"><Input/></td>
				<td className="title"><Input/></td>
				<td className="actions"><Button>Create</Button></td>
			</tr>}
			</tfoot>
		</table>
	}</Block>;
};


const ContestPage = ({match}: RouteComponentProps<ContestPageParams>) => {
	const {contest_id} = match.params;
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
	const {title, permissions} = contest;
	return <Page title={`Contest: ${title}`} sidebar={<Switch>
		{/* <Route exact path="/contests/:contest_id/problems/:ProblemCode" component={ContestProblemSideBlock}/> */}
	</Switch>}>
		<ContestTabs contest={contest} currentTab={currentTab}/>
		<Switch>
			<Route exact path="/contests/:contest_id">
				{() => {
					setCurrentTab("problems");
					return <ContestProblemsBlock contest={contest}/>;
				}}
			</Route>
			<Route exact path="/contests/:contest_id/solutions">
				{() => {
					setCurrentTab("solutions");
					return <></>;
					// return <ContestSolutionsBlock contest={contest}/>;
				}}
			</Route>
			<Route exact path="/contests/:contest_id/manage">
				{() => {
					setCurrentTab("manage");
					return <>
						{permissions && permissions.includes("update_contest") && <EditContestBlock contest={contest}/>}
						{permissions && (permissions.includes("observe_contest_problems")) && <EditContestProblemsBlock contest={contest}/>}
						{permissions && permissions.includes("delete_contest") && <DeleteContestBlock contest={contest}/>}
					</>;
				}}
			</Route>
			<Route exact path="/contests/:contest_id/problems/create" component={CreateContestProblemBlock}/>
			<Route exact path="/contests/:contest_id/problems/:problem_code" component={ContestProblemBlock}/>
		</Switch>
	</Page>;
};

export default ContestPage;
