import { ChangeEvent, FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ErrorResponse, observeProblem, Problem, rebuildProblem, updateProblem } from "../../api";
import FormBlock from "../../components/FormBlock";
import Page from "../../components/Page";
import Alert from "../../ui/Alert";
import Button from "../../ui/Button";
import Checkbox from "../../ui/Checkbox";
import Field from "../../ui/Field";
import Input from "../../ui/Input";
import Sidebar from "../../ui/Sidebar";
import { ManageProblemSideBlock } from "../ProblemPage";

import "./index.scss";

type EditProblemBlockProps = {
	problem: Problem;
	onUpdateProblem?(problem: Problem): void;
};

const EditProblemBlock: FC<EditProblemBlockProps> = props => {
	const { problem, onUpdateProblem } = props;
	const { statement } = problem;
	const [error, setError] = useState<ErrorResponse>();
	const [title, setTitle] = useState<string>();
	const [file, setFile] = useState<File>();
	const errorMessage = error && error.message;
	const onResetForm = () => {
		setTitle(undefined);
		setFile(undefined);
		setError(undefined);
	};
	const onSubmit = (event: any) => {
		event.preventDefault();
		updateProblem(problem.id, {
			title: title,
			file: file,
		})
			.then(problem => {
				onResetForm();
				onUpdateProblem && onUpdateProblem(problem);
			})
			.catch(setError);
	};
	return <FormBlock className="b-problem-edit" onSubmit={onSubmit} title={`Edit: ${statement?.title ?? problem.title}`} footer={<>
		<Button type="submit" disabled={!title && !file}>Update</Button>
		{(title || file) && <Button type="reset" onClick={onResetForm}>Reset</Button>}
	</>}>
		{errorMessage && <Alert>{errorMessage}</Alert>}
		<Field title="Title:" name="title" errorResponse={error}>
			<Input
				type="text" name="title" placeholder="Title"
				value={title ?? problem.title}
				onValueChange={setTitle}
				required autoFocus />
		</Field>
		<Field title="Package:" name="package" errorResponse={error}>
			<input
				type="file" name="package"
				onChange={(e: ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0])} />
		</Field>
	</FormBlock>;
};

const RebuildProblemBlock: FC<EditProblemBlockProps> = props => {
	const { problem, onUpdateProblem } = props;
	const [error, setError] = useState<ErrorResponse>();
	const [compile, setCompile] = useState<boolean>();
	const [disabled, setDisabled] = useState<boolean>();
	const errorMessage = error && error.message;
	const onResetForm = () => {
		setCompile(undefined);
		setError(undefined);
	};
	const onSubmit = (event: any) => {
		event.preventDefault();
		setDisabled(true);
		rebuildProblem(problem.id, {
			compile: compile,
		})
			.then(problem => {
				onResetForm();
				onUpdateProblem && onUpdateProblem(problem);
			})
			.catch(setError);
	};
	return <FormBlock className="b-problem-edit" onSubmit={onSubmit} title={`Rebuild problem`} footer={<>
		<Button disabled={disabled} type="submit">Rebuild</Button>
	</>}>
		{errorMessage && <Alert>{errorMessage}</Alert>}
		<Field name="compile" errorResponse={error}>
			<Checkbox value={compile ?? false} onValueChange={setCompile} />
			<span className="label">Compile package</span>
		</Field>
	</FormBlock>;
};

const EditProblemPage: FC = () => {
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
	return <Page title="Edit problem" sidebar={<>
		{problem && canUpdate && <ManageProblemSideBlock problem={problem as Problem} />}
		<Sidebar />
	</>}>
		{problem ?
			<>
				<EditProblemBlock problem={problem} onUpdateProblem={setProblem} />
				<RebuildProblemBlock problem={problem} onUpdateProblem={setProblem} />
			</> :
			<>Loading...</>}
	</Page>;
};

export default EditProblemPage;
