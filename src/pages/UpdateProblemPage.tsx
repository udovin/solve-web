import { FC, useState } from "react";
import Page from "../components/Page";
import Input from "../ui/Input";
import Button from "../ui/Button";
import FormBlock from "../components/FormBlock";
import { Problem } from "../api";
import { Navigate, useParams } from "react-router-dom";
import Field from "../ui/Field";

type UpdateProblemPageParams = {
	ProblemID: string;
}

const UpdateProblemPage: FC = () => {
	const params = useParams();
	const { ProblemID } = params;
	const [problem, setProblem] = useState<Problem>();
	const onSubmit = (event: any) => {
		event.preventDefault();
		const { title, file } = event.target;
		const form = new FormData();
		form.append("ID", String(ProblemID));
		form.append("Title", title.value);
		form.append("File", file.files[0]);
		fetch("/api/v0/problems/" + ProblemID, {
			method: "PATCH",
			body: form,
		})
			.then(result => result.json())
			.then(result => setProblem(result))
			.catch(error => console.log(error));
	};
	if (problem) {
		return <Navigate to={"/problems/" + problem.id} />
	}
	return <Page title="Update problem">
		<FormBlock onSubmit={onSubmit} title="Update problem" footer={
			<Button type="submit" color="primary">Update</Button>
		}>
			<Field title="Title:">
				<Input type="text" name="title" placeholder="Title" required autoFocus />
			</Field>
			<Field title="Package:">
				<Input type="file" name="file" placeholder="Package" required />
			</Field>
		</FormBlock>
	</Page>;
};

export default UpdateProblemPage;
