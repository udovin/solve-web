import { FC, useState, FormEvent, ChangeEvent } from "react";
import { Navigate } from "react-router-dom";
import Page from "../../components/Page";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import FormBlock from "../../components/FormBlock";
import { Problem, ErrorResponse, createProblem } from "../../api";
import Field from "../../ui/Field";
import Alert from "../../ui/Alert";
import "./index.scss";

const CreateProblemPage: FC = () => {
	const [newProblem, setNewProblem] = useState<Problem>();
	const [error, setError] = useState<ErrorResponse>();
	const [form, setForm] = useState<{ [key: string]: string }>({});
	const [file, setFile] = useState<File>();
	const onSubmit = (event: FormEvent) => {
		event.preventDefault();
		setError(undefined);
		file && createProblem({
			title: form.title,
			file: file,
		})
			.then(setNewProblem)
			.catch(setError);
	};
	if (newProblem) {
		return <Navigate to={"/problems/" + newProblem.id} />
	}
	const errorMessage = error && error.message;
	const invalidFields = (error && error.invalid_fields) || {};
	return <Page title="Create problem">
		<FormBlock className="b-create-problem" onSubmit={onSubmit} title="Create problem" footer={
			<Button type="submit" color="primary">Create</Button>
		}>
			{errorMessage && <Alert>{errorMessage}</Alert>}
			<Field title="Title:">
				<Input
					type="text" name="title" placeholder="Title"
					value={form.title || ""}
					onValueChange={value => setForm({ ...form, title: value })}
					required autoFocus />
				{invalidFields["title"] && <Alert>{invalidFields["title"].message}</Alert>}
			</Field>
			<Field title="Package:">
				<input
					type="file" name="package"
					onChange={(e: ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0])}
					required />
				{invalidFields["package"] && <Alert>{invalidFields["package"].message}</Alert>}
			</Field>
		</FormBlock>
	</Page>;
};

export default CreateProblemPage;
