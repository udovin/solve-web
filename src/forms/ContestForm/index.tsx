import { FC } from "react";
import { ErrorResponse } from "../../api";
import Alert from "../../ui/Alert";
import Field from "../../ui/Field";
import Input from "../../ui/Input";
import DateTimeInput from "../../ui/DateTimeInput";
import DurationInput from "../../ui/DurationInput";
import Checkbox from "../../ui/Checkbox";
import Select from "../../ui/Select";

type ContestFormProps = {
    title: string,
    onTitleChange(value: string): void,
    beginTime?: number,
    onBeginTimeChange(value?: number): void,
    duration?: number,
    onDurationChange(value?: number): void,
    enableRegistration?: boolean,
    onEnableRegistrationChange(value?: boolean): void,
    enableUpsolving?: boolean,
    onEnableUpsolvingChange(value?: boolean): void,
    enableObserving?: boolean,
    onEnableObservingChange(value?: boolean): void,
    freezeBeginDuration?: number,
    onFreezeBeginDurationChange(value?: number): void,
    freezeEndTime?: number,
    onFreezeEndTimeChange(value?: number): void,
    standingsKind?: string,
    onStandingsKindChange(value?: string): void,
    error?: ErrorResponse,
};

export const ContestForm: FC<ContestFormProps> = props => {
    const {
        title, onTitleChange,
        beginTime, onBeginTimeChange,
        duration, onDurationChange,
        enableRegistration, onEnableRegistrationChange,
        enableUpsolving, onEnableUpsolvingChange,
        enableObserving, onEnableObservingChange,
        freezeBeginDuration, onFreezeBeginDurationChange,
        freezeEndTime, onFreezeEndTimeChange,
        standingsKind, onStandingsKindChange,
        error,
    } = props;
    return <>
        {error && error.message && <Alert>{error.message}</Alert>}
        <Field title="Title:" name="title" errorResponse={error}>
            <Input
                type="text" name="title" placeholder="Title"
                value={title}
                onValueChange={onTitleChange}
                required />
        </Field>
        <Field name="begin_time" title="Begin time:" errorResponse={error}>
            <DateTimeInput
                value={beginTime}
                onValueChange={onBeginTimeChange} />
        </Field>
        <Field name="duration" title="Duration:" errorResponse={error}>
            <DurationInput
                value={duration}
                onValueChange={onDurationChange} />
        </Field>
        <Field name="enable_registration" errorResponse={error} description="Enables self-registration of participants.">
            <Checkbox
                value={enableRegistration ?? false}
                onValueChange={onEnableRegistrationChange} />
            <span className="label">Enable registration</span>
        </Field>
        <Field name="enable_upsolving" errorResponse={error} description="Enables upsolving after contest is finished.">
            <Checkbox
                value={enableUpsolving ?? false}
                onValueChange={onEnableUpsolvingChange} />
            <span className="label">Enable upsolving</span>
        </Field>
        <Field name="enable_observing" errorResponse={error} description="Enables public access to contest standings.">
            <Checkbox
                value={enableObserving ?? false}
                onValueChange={onEnableObservingChange} />
            <span className="label">Enable observing</span>
        </Field>
        <Field title="Standings:" name="standings_kind" errorResponse={error}>
            <Select
                options={{ disabled: "Disabled", icpc: "ICPC", ioi: "IOI" }}
                value={standingsKind ?? "disabled"}
                onValueChange={onStandingsKindChange} />
        </Field>
        <Field title="Freeze since duration:" name="freeze_begin_duration" errorResponse={error}>
            <DurationInput
                value={freezeBeginDuration}
                onValueChange={onFreezeBeginDurationChange} />
        </Field>
        <Field title="Unfreeze time:" name="freeze_end_time" errorResponse={error}>
            <DateTimeInput
                value={freezeEndTime}
                onValueChange={onFreezeEndTimeChange} />
        </Field>
    </>;
};
