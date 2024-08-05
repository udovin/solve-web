import { FC, useContext, useEffect, useState } from "react";
import { Contest, ErrorResponse, updateContest } from "../../api";
import FormBlock from "../../components/FormBlock";
import Button from "../../ui/Button";
import { ContestForm } from "../../forms/ContestForm";
import { LocaleContext } from "../../ui/Locale";

export type EditContestBlockProps = {
    contest: Contest;
    onUpdateContest?(contest: Contest): void;
};

export const EditContestBlock: FC<EditContestBlockProps> = props => {
    const { contest, onUpdateContest } = props;
    const { localize } = useContext(LocaleContext);
    const [title, setTitle] = useState(contest.title);
    const [beginTime, setBeginTime] = useState(contest.begin_time);
    const [duration, setDuration] = useState(contest.duration);
    const [enableRegistration, setEnableRegistration] = useState(contest.enable_registration);
    const [enableUpsolving, setEnableUpsolving] = useState(contest.enable_upsolving);
    const [enableObserving, setEnableObserving] = useState(contest.enable_observing);
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
        setEnableObserving(contest.enable_observing);
        setFreezeBeginDuration(contest.freeze_begin_duration);
        setFreezeEndTime(contest.freeze_end_time);
        setStandingsKind(contest.standings_kind);
        setError(undefined);
    };
    const onSubmit = (event: any) => {
        event.preventDefault();
        updateContest(contest.id, {
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
        enableObserving !== contest.enable_observing ||
        freezeBeginDuration !== contest.freeze_begin_duration ||
        freezeEndTime !== contest.freeze_end_time ||
        (standingsKind ?? "disabled") !== (contest.standings_kind ?? "disabled");
    return <FormBlock className="b-contest-edit" title={localize("Edit contest")} onSubmit={onSubmit} footer={<>
        <Button
            type="submit" color="primary"
            disabled={!changed}
        >{localize("Change")}</Button>
        {changed && <Button type="reset" onClick={onResetForm}>{localize("Reset")}</Button>}
    </>}>
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
    </FormBlock>;
};
