import { FC } from "react";
import { ErrorResponse } from "../../api";
import Alert from "../Alert";
import Field from "../Field";
import Input from "../Input";
import DateTimeInput from "../DateTimeInput";
import DurationInput from "../DurationInput";
import Checkbox from "../Checkbox";
import Select from "../Select";
import { useLocale } from "../Locale";

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
    enableVirtual?: boolean,
    onEnableVirtualChange(value?: boolean): void,
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
        enableVirtual, onEnableVirtualChange,
        freezeBeginDuration, onFreezeBeginDurationChange,
        freezeEndTime, onFreezeEndTimeChange,
        standingsKind, onStandingsKindChange,
        error,
    } = props;
    const { localize, localizeKey } = useLocale();
    return <>
        {error && error.message && <Alert>{error.message}</Alert>}
        <Field title={localize("Title") + ":"} name="title" errorResponse={error}>
            <Input
                type="text" name="title" placeholder={localize("Title")}
                value={title}
                onValueChange={onTitleChange}
                required />
        </Field>
        <Field name="begin_time" title={localize("Begin time") + ":"} errorResponse={error}>
            <DateTimeInput
                value={beginTime}
                onValueChange={onBeginTimeChange} />
        </Field>
        <Field name="duration" title={localize("Duration") + ":"} errorResponse={error}>
            <DurationInput
                value={duration}
                onValueChange={onDurationChange} />
        </Field>
        <Field name="enable_registration" errorResponse={error} description={localizeKey("enable_registration_description", "Enables self-registration of participants.")}>
            <Checkbox
                value={enableRegistration ?? false}
                onValueChange={onEnableRegistrationChange} />
            <span className="label">{localize("Enable registration")}</span>
        </Field>
        <Field name="enable_upsolving" errorResponse={error} description={localizeKey("enable_upsolving_description", "Enables upsolving after contest is finished.")}>
            <Checkbox
                value={enableUpsolving ?? false}
                onValueChange={onEnableUpsolvingChange} />
            <span className="label">{localize("Enable upsolving")}</span>
        </Field>
        <Field name="enable_observing" errorResponse={error} description={localizeKey("enable_observing_description", "Enables public access to contest standings.")}>
            <Checkbox
                value={enableObserving ?? false}
                onValueChange={onEnableObservingChange} />
            <span className="label">{localize("Enable observing")}</span>
        </Field>
        <Field name="enable_virtual" errorResponse={error} description={localizeKey("enable_virtual_description", "Enables virtuial participation.")}>
            <Checkbox
                value={enableVirtual ?? false}
                onValueChange={onEnableVirtualChange} />
            <span className="label">{localize("Enable virtual")}</span>
        </Field>
        <Field title={localize("Standings") + ":"} name="standings_kind" errorResponse={error}>
            <Select
                options={{ disabled: localize("Disabled"), icpc: "ICPC", ioi: "IOI" }}
                value={standingsKind ?? "disabled"}
                onValueChange={onStandingsKindChange} />
        </Field>
        <Field title={localize("Freeze since duration") + ":"} name="freeze_begin_duration" errorResponse={error}>
            <DurationInput
                value={freezeBeginDuration}
                onValueChange={onFreezeBeginDurationChange} />
        </Field>
        <Field title={localize("Unfreeze time") + ":"} name="freeze_end_time" errorResponse={error}>
            <DateTimeInput
                value={freezeEndTime}
                onValueChange={onFreezeEndTimeChange} />
        </Field>
    </>;
};
