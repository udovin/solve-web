import {FC, useState} from "react";
import {Redirect} from "react-router";
import Page from "../../components/Page";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import FormBlock from "../../components/FormBlock";
import {Contest, ErrorResp, createContest} from "../../api";

const CreateContestPage: FC = () => {
	const [contest, setContest] = useState<Contest>();
	const [error, setError] = useState<ErrorResp>();
	const [form, setForm] = useState<{[key: string]: string}>({});
	const onSubmit = (event: any) => {
		event.preventDefault();
		createContest({
			title: form.title,
		})
			.then(setContest)
			.catch(setError);
	};
	if (contest) {
		return <Redirect to={"/contests/" + contest.id}/>
	}
	return <Page title="Create contest">
		<FormBlock onSubmit={onSubmit} title="Create contest" footer={
			<Button type="submit" color="primary">Create</Button>
		}>
			<div className="ui-field">
				<label>
					<span className="label">Title:</span>
					<Input
						type="text" name="title" placeholder="Title"
						value={form.title || ""}
						onValueChange={value => setForm({...form, title: value})}
						required autoFocus/>
				</label>
			</div>
		</FormBlock>
	</Page>;
};

export default CreateContestPage;
