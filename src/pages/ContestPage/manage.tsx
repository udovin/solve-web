import { FC, useEffect, useState } from "react";
import { Contest, ErrorResponse, updateContest } from "../../api";
import FormBlock from "../../components/FormBlock";
import Alert from "../../ui/Alert";
import Button from "../../ui/Button";
import Checkbox from "../../ui/Checkbox";
import DurationInput from "../../ui/DurationInput";
import Field from "../../ui/Field";
import Input from "../../ui/Input";
import Select from "../../ui/Select";

export type EditContestBlockProps = {
    contest: Contest;
    onUpdateContest?(contest: Contest): void;
};

export const EditContestBlock: FC<EditContestBlockProps> = props => {
    const { contest, onUpdateContest } = props;
    const [title, setTitle] = useState(contest.title);
    const [beginTime, setBeginTime] = useState(contest.begin_time);
    const [duration, setDuration] = useState(contest.duration);
    const [enableRegistration, setEnableRegistration] = useState(contest.enable_registration);
    const [enableUpsolving, setEnableUpsolving] = useState(contest.enable_upsolving);
    const [freezeBeginDuration, setFreezeBeginDuration] = useState(contest.freeze_begin_duration);
    const [freezeEndTime, setFreezeEndTime] = useState(contest.freeze_end_time);
    const [standingsKind, setStandingsKind] = useState(contest.standings_kind);
    const [error, setError] = useState<ErrorResponse>();
    const onResetForm = () => {
        setTitle(contest.title);
        setBeginTime(contest.begin_time);
        setDuration(contest.duration);
        setEnableRegistration(contest.enable_registration);
        setEnableUpsolving(contest.enable_upsolving);
        setFreezeBeginDuration(contest.freeze_begin_duration);
        setFreezeEndTime(contest.freeze_end_time);
        setStandingsKind(contest.standings_kind);
        setError(undefined);
    };
    const onSubmit = (event: any) => {
        event.preventDefault();
        updateContest(contest.id, {
            title: title,
            begin_time: beginTime,
            duration: duration,
            enable_registration: enableRegistration,
            enable_upsolving: enableUpsolving,
            freeze_begin_duration: freezeBeginDuration,
            freeze_end_time: freezeEndTime,
            standings_kind: standingsKind,
        })
            .then(contest => {
                onUpdateContest && onUpdateContest(contest);
            })
            .catch(setError);
    };
    useEffect(onResetForm, [contest]);
    const changed = title !== contest.title ||
        beginTime !== contest.begin_time ||
        duration !== contest.duration ||
        enableRegistration !== contest.enable_registration ||
        enableUpsolving !== contest.enable_upsolving ||
        freezeBeginDuration !== contest.freeze_begin_duration ||
        freezeEndTime !== contest.freeze_end_time ||
        (standingsKind ?? "disabled") !== (contest.standings_kind ?? "disabled");
    return <FormBlock className="b-contest-edit" title="Edit contest" onSubmit={onSubmit} footer={<>
        <Button
            type="submit" color="primary"
            disabled={!changed}
        >Change</Button>
        {changed && <Button type="reset" onClick={onResetForm}>Reset</Button>}
    </>}>
        {error && error.message && <Alert>{error.message}</Alert>}
        <Field title="Title:" name="title" errorResponse={error}>
            <Input
                type="text" name="title" placeholder="Title"
                value={title}
                onValueChange={setTitle}
                required />
        </Field>
        <Field title="Begin time:" name="begin_time" errorResponse={error}>
            <Input
                type="number" name="begin_time" placeholder="Begin time"
                value={beginTime ? String(beginTime) : undefined}
                onValueChange={value => setBeginTime(value ? Number(value) : 0)} />
        </Field>
        <Field title="Duration:" name="duration" errorResponse={error}>
            <DurationInput
                value={duration}
                onValueChange={setDuration} />
        </Field>
        <Field name="enable_registration" errorResponse={error}>
            <Checkbox
                value={enableRegistration ?? false}
                onValueChange={setEnableRegistration} />
            <span className="label">Enable registration</span>
        </Field>
        <Field name="enable_upsolving" errorResponse={error}>
            <Checkbox
                value={enableUpsolving ?? false}
                onValueChange={setEnableUpsolving} />
            <span className="label">Enable upsolving</span>
        </Field>
        <Field title="Standings:" name="standings_kind" errorResponse={error}>
            <Select
                options={{ disabled: "Disabled", icpc: "ICPC", ioi: "IOI" }}
                value={standingsKind ?? "disabled"}
                onValueChange={setStandingsKind} />
        </Field>
        <Field title="Freeze since duration:" name="freeze_begin_duration" errorResponse={error}>
            <DurationInput
                value={freezeBeginDuration}
                onValueChange={setFreezeBeginDuration} />
        </Field>
        <Field title="Unfreeze time:" name="freeze_end_time" errorResponse={error}>
            <Input
                type="number" name="freeze_end_time" placeholder="Unfreeze time"
                value={freezeEndTime ? String(freezeEndTime) : undefined}
                onValueChange={value => setFreezeEndTime(value ? Number(value) : 0)} />
        </Field>
    </FormBlock>;
};
