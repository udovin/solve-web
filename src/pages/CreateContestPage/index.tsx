import { FC, useState } from "react";
import { Navigate } from "react-router-dom";
import Page from "../../components/Page";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import FormBlock from "../../components/FormBlock";
import { Contest, ErrorResponse, createContest } from "../../api";
import Field from "../../ui/Field";
import Alert from "../../ui/Alert";
import DurationInput from "../../ui/DurationInput";

const toNumber = (n?: string) => {
	return n === undefined ? undefined : Number(n);
};

const CreateContestPage: FC = () => {
	const [newContest, setNewContest] = useState<Contest>();
	const [error, setError] = useState<ErrorResponse>();
	const [form, setForm] = useState<{ [key: string]: string }>({});
	const onSubmit = (event: any) => {
		event.preventDefault();
		setError(undefined);
		createContest({
			title: form.title,
			begin_time: toNumber(form.begin_time),
			duration: toNumber(form.duration),
		})
			.then(setNewContest)
			.catch(setError);
	};
	if (newContest) {
		return <Navigate to={"/contests/" + newContest.id} />
	}
	return <Page title="Create contest">
		<FormBlock onSubmit={onSubmit} title="Create contest" footer={
			<Button type="submit" color="primary">Create</Button>
		}>
			{error && error.message && <Alert>{error.message}</Alert>}
			<Field title="Title:">
				<Input
					type="text" name="title" placeholder="Title"
					value={form.title || ""}
					onValueChange={value => setForm({ ...form, title: value })}
					required autoFocus />
				{error && error.invalid_fields && error.invalid_fields["title"] && <Alert>{error.invalid_fields["title"].message}</Alert>}
			</Field>
			<Field title="Begin time:">
				<Input
					type="number" name="begin_time" placeholder="Begin time"
					value={form.begin_time || ""}
					onValueChange={value => setForm({ ...form, begin_time: value })} />
				{error && error.invalid_fields && error.invalid_fields["begin_time"] && <Alert>{error.invalid_fields["begin_time"].message}</Alert>}
			</Field>
			<Field title="Duration:">
				<DurationInput
					value={Number(form.duration || "0")}
					onValueChange={value => setForm({ ...form, duration: String(value) })} />
				{error && error.invalid_fields && error.invalid_fields["duration"] && <Alert>{error.invalid_fields["duration"].message}</Alert>}
			</Field>
		</FormBlock>
	</Page>;
};

export default CreateContestPage;
