import { FC, useState } from "react";
import { Navigate } from "react-router-dom";
import Page from "../../components/Page";
import Button from "../../ui/Button";
import FormBlock from "../../components/FormBlock";
import { Contest, ErrorResponse, createContest } from "../../api";
import { ContestForm } from "../../ui/ContestForm";

const CreateContestPage: FC = () => {
	const [newContest, setNewContest] = useState<Contest>();
	const [title, setTitle] = useState<string>("");
	const [beginTime, setBeginTime] = useState<number>();
	const [duration, setDuration] = useState<number>();
	const [enableRegistration, setEnableRegistration] = useState<boolean>();
	const [enableUpsolving, setEnableUpsolving] = useState<boolean>();
	const [enableObserving, setEnableObserving] = useState<boolean>();
	const [freezeBeginDuration, setFreezeBeginDuration] = useState<number>();
	const [freezeEndTime, setFreezeEndTime] = useState<number>();
	const [standingsKind, setStandingsKind] = useState<string>();
	const [error, setError] = useState<ErrorResponse>();
	const onSubmit = (event: any) => {
		event.preventDefault();
		setError(undefined);
		createContest({
			title: title,
			begin_time: beginTime ?? 0,
			duration: duration ?? 0,
			enable_registration: enableRegistration,
			enable_upsolving: enableUpsolving,
			enable_observing: enableObserving,
			freeze_begin_duration: freezeBeginDuration ?? 0,
			freeze_end_time: freezeEndTime ?? 0,
			standings_kind: standingsKind,
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
			<ContestForm
				title={title}
				onTitleChange={setTitle}
				beginTime={beginTime}
				onBeginTimeChange={setBeginTime}
				duration={duration}
				onDurationChange={setDuration}
				enableRegistration={enableRegistration}
				onEnableRegistrationChange={setEnableRegistration}
				enableUpsolving={enableUpsolving}
				onEnableUpsolvingChange={setEnableUpsolving}
				enableObserving={enableObserving}
				onEnableObservingChange={setEnableObserving}
				freezeBeginDuration={freezeBeginDuration}
				onFreezeBeginDurationChange={setFreezeBeginDuration}
				freezeEndTime={freezeEndTime}
				onFreezeEndTimeChange={setFreezeEndTime}
				standingsKind={standingsKind}
				onStandingsKindChange={setStandingsKind}
				error={error}
			/>
		</FormBlock>
	</Page>;
};

export default CreateContestPage;
