import { ChangeEvent, FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ErrorResponse, observeProblem, Problem, rebuildProblem, updateProblem } from "../../api";
import FormBlock from "../../components/FormBlock";
import Page from "../../components/Page";
import Alert from "../../ui/Alert";
import Button from "../../ui/Button";
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
	const [form, setForm] = useState<{ [key: string]: string }>({});
	const [file, setFile] = useState<File>();
	const [rebuildDisabled, setRebuildDisabled] = useState<boolean>();
	const errorMessage = error && error.message;
	const invalidFields = (error && error.invalid_fields) || {};
	const onResetForm = () => {
		setForm({});
		setFile(undefined);
		setError(undefined);
	};
	const onSubmit = (event: any) => {
		event.preventDefault();
		updateProblem(problem.id, {
			title: form.title,
			file: file,
		})
			.then(problem => {
				onResetForm();
				onUpdateProblem && onUpdateProblem(problem);
			})
			.catch(setError);
	};
	const onRebuild = (event: any) => {
		setRebuildDisabled(true);
		rebuildProblem(problem.id)
			.then(problem => {
				onUpdateProblem && onUpdateProblem(problem);
			})
			.catch(setError);
	};
	return <FormBlock className="b-problem-edit" onSubmit={onSubmit} title={`Edit: ${statement?.title ?? problem.title}`} footer={<>
		<Button type="submit" disabled={!Object.keys(form).length && !file}>Update</Button>
		<Button disabled={rebuildDisabled} onClick={onRebuild}>Rebuild</Button>
		{(!!Object.keys(form).length || file) && <Button type="reset" onClick={onResetForm}>Reset</Button>}
	</>}>
		{errorMessage && <Alert>{errorMessage}</Alert>}
		<Field title="Title:">
			<Input
				type="text" name="title" placeholder="Title"
				value={form.title ?? problem.title}
				onValueChange={value => setForm({ ...form, title: value })}
				required autoFocus />
			{invalidFields["title"] && <Alert>{invalidFields["title"].message}</Alert>}
		</Field>
		<Field title="Package:">
			<input
				type="file" name="package"
				onChange={(e: ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0])} />
			{invalidFields["package"] && <Alert>{invalidFields["package"].message}</Alert>}
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
			</> :
			<>Loading...</>}
	</Page>;
};

export default EditProblemPage;
