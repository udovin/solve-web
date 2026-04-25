import { FC, MouseEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Contest, ContestParticipant, ContestSolutions, ContestStandings, ContestStandingsCell, ContestStandingsColumn, ErrorResponse, observeContestSolutions, observeContestStandings } from "../../api";
import Alert from "../../ui/Alert";
import Block from "../../ui/Block";
import Checkbox from "../../ui/Checkbox";
import DateTime from "../../ui/DateTime";
import Dialog from "../../ui/Dialog";
import Field from "../../ui/Field";
import Tooltip from "../../ui/Tooltip";
import Verdict from "../../ui/Verdict";
import { ParticipantLink } from "./participants";
import { useAuth } from "../../ui/Auth";
import { useLocale } from "../../ui/Locale";

type ContestStandingsBlockProps = {
    contest: Contest;
};

type ProblemColumnHeaderProps = {
    contest: Contest;
    column: ContestStandingsColumn;
};

const ProblemColumnHeader: FC<ProblemColumnHeaderProps> = props => {
    const { contest, column } = props;
    const content = <>
        <span className="code">{column.code}</span>
        {column.points && <span className="points">{column.points}</span>}
        <span className="solutions">{column.accepted_solutions ?? 0} &#8725; {column.total_solutions ?? 0}</span>
    </>;
    if (!column.code) {
        return <th className="problem">{content}</th>;
    }
    const link = <Link to={`/contests/${contest.id}/problems/${column.code}`}>{content}</Link>;
    return <th className="problem">
        {column.title ? <Tooltip content={column.title}>{link}</Tooltip> : link}
    </th>;
};

type CellSolutionsDialogProps = {
    contest: Contest;
    column: ContestStandingsColumn;
    participantId: number;
    open: boolean;
    onClose: () => void;
};

const CellSolutionsDialog: FC<CellSolutionsDialogProps> = props => {
    const { contest, column, participantId, open, onClose } = props;
    const { localize } = useLocale();
    const [solutions, setSolutions] = useState<ContestSolutions>();
    const [error, setError] = useState<ErrorResponse>();
    useEffect(() => {
        if (!open || !column.id) {
            return;
        }
        setSolutions(undefined);
        setError(undefined);
        observeContestSolutions(contest.id, {
            participant_id: participantId,
            problem_id: column.id,
        })
            .then(setSolutions)
            .catch(setError);
    }, [open, contest.id, column.id, participantId]);
    const title = column.title
        ? `${column.code}. ${column.title}`
        : column.code ?? "";
    return <Dialog open={open} onClose={onClose}>
        <Block title={title} className="b-cell-solutions">
            {error && <Alert>{error.message}</Alert>}
            {!solutions && !error && <>{localize("Loading...")}</>}
            {solutions && <table className="ui-table">
                <thead>
                    <tr>
                        <th className="id">#</th>
                        <th className="date">{localize("Time")}</th>
                        <th className="verdict">{localize("Verdict")}</th>
                    </tr>
                </thead>
                <tbody>
                    {solutions.solutions?.map(solution => (
                        <tr key={solution.id}>
                            <td className="id">
                                <Link to={`/contests/${contest.id}/solutions/${solution.id}`}>{solution.id}</Link>
                            </td>
                            <td className="date">
                                <DateTime value={solution.solution.create_time} />
                            </td>
                            <td className="verdict">
                                <Verdict report={solution.solution.report} />
                            </td>
                        </tr>
                    ))}
                    {!solutions.solutions?.length && <tr>
                        <td colSpan={3}>{localize("No solutions")}</td>
                    </tr>}
                </tbody>
            </table>}
        </Block>
    </Dialog>;
};

type ProblemCellProps = {
    contest: Contest;
    column: ContestStandingsColumn;
    participantId?: number;
    cell?: ContestStandingsCell;
    kind: "icpc" | "ioi";
};

const renderICPCAttempt = (cell: ContestStandingsCell): { className: string, attempt: string } => {
    if (!cell.verdict) {
        return { className: "unknown", attempt: `?${cell.attempt ?? 1}` };
    }
    if (cell.verdict === "accepted") {
        const extra = cell.attempt && cell.attempt > 1 ? cell.attempt - 1 : "";
        return { className: "accepted", attempt: `+${extra}` };
    }
    return { className: "rejected", attempt: `−${cell.attempt ?? 1}` };
};

const renderIOIAttempt = (cell: ContestStandingsCell): { className: string, attempt: string } => {
    const points = String(cell.points ?? 0);
    if (!cell.verdict) {
        return { className: "unknown", attempt: `${points}?` };
    }
    if (cell.verdict === "accepted") {
        return { className: "accepted", attempt: points };
    }
    return { className: "points", attempt: points };
};

const ProblemCell: FC<ProblemCellProps> = props => {
    const { contest, column, participantId, cell, kind } = props;
    const [open, setOpen] = useState(false);
    if (!cell) {
        return <td className="problem"></td>;
    }
    const { className, attempt } = kind === "ioi" ? renderIOIAttempt(cell) : renderICPCAttempt(cell);
    const content = <>
        <span className="attempt">{attempt}</span>
        {!!cell.time && <span className="time"><StandingsDuration value={cell.time} /></span>}
    </>;
    const tdClassName = `problem ${className}`;
    const canObserveSolutions = contest.permissions?.includes("observe_contest_solutions");
    if (!participantId || !column.id || !canObserveSolutions) {
        return <td className={tdClassName}>{content}</td>;
    }
    const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setOpen(true);
    };
    return <td className={tdClassName}>
        <a href="#" onClick={onClick}>{content}</a>
        <CellSolutionsDialog
            contest={contest}
            column={column}
            participantId={participantId}
            open={open}
            onClose={() => setOpen(false)} />
    </td>;
};

export const ContestStandingsBlock: FC<ContestStandingsBlockProps> = props => {
    const { contest } = props;
    const { localize } = useLocale();
    const [standings, setStandings] = useState<ContestStandings>();
    const [ignoreFreeze, setIgnoreFreeze] = useState<boolean>();
    const [onlyOfficial, setOnlyOfficial] = useState<boolean>(localStorage.getItem("contest_only_official") === "true");
    const [autoUpdate, setAutoUpdate] = useState<boolean>(localStorage.getItem("contest_auto_update") === "true");
    const [canChangeFreeze, setCanChangeFreeze] = useState<boolean>(false);
    useEffect(() => {
        observeContestStandings(contest.id, ignoreFreeze, onlyOfficial)
            .then(standings => {
                setStandings(standings);
                setCanChangeFreeze(ignoreFreeze || standings.frozen);
            });
        localStorage.setItem("contest_only_official", onlyOfficial ? "true" : "false");
    }, [contest.id, ignoreFreeze, onlyOfficial]);
    useEffect(() => {
        localStorage.setItem("contest_auto_update", autoUpdate ? "true" : "false");
    }, [autoUpdate]);
    useEffect(() => {
        if (!autoUpdate) {
            return;
        }
        const updateStandings = () => {
            observeContestStandings(contest.id, ignoreFreeze, onlyOfficial)
                .then(standings => {
                    setStandings(standings);
                    setCanChangeFreeze(ignoreFreeze || standings.frozen);
                });
        };
        const interval = setInterval(updateStandings, 10000);
        return () => clearInterval(interval);
    }, [contest.id, autoUpdate, ignoreFreeze, onlyOfficial]);
    if (!standings) {
        return <>Loading...</>;
    }
    const canObserveFullStandings = contest.permissions?.includes("observe_contest_full_standings");
    return <Block header={<>
        <span className="title">{localize("Standings")}</span>
        {canObserveFullStandings && canChangeFreeze && <Field>
            <Checkbox
                value={ignoreFreeze ?? false}
                onValueChange={setIgnoreFreeze} />
            <span className="label">{localize("Unfrozen")}</span>
        </Field>}
        <Field>
            <Checkbox
                value={onlyOfficial ?? false}
                onValueChange={setOnlyOfficial} />
            <span className="label">{localize("Official")}</span>
        </Field>
        <Field>
            <Checkbox
                value={autoUpdate ?? false}
                onValueChange={setAutoUpdate} />
            <span className="label">{localize("Auto-update")}</span>
        </Field>
    </>} className="b-contest-standings">
        {standings.kind === "ioi" ? <IOIStandingsTable contest={contest} standings={standings} /> : <ICPCStandingsTable contest={contest} standings={standings} />}
    </Block>;
}

type StandingsTableProps = {
    contest: Contest;
    standings: ContestStandings;
};

const ICPCStandingsTable: FC<StandingsTableProps> = props => {
    const { contest, standings } = props;
    let currentGroup = 0;
    let currentGroupScore: number | undefined = undefined;
    const { status } = useAuth();
    const { localize } = useLocale();
    const isCurrent = (rowParticipant?: ContestParticipant) => {
        if (!rowParticipant) {
            return false;
        }
        if (rowParticipant.user && status?.user) {
            return rowParticipant.user.id === status.user.id;
        }
        if (rowParticipant.scope_user && status?.scope_user) {
            return rowParticipant.scope_user.id === status.scope_user.id;
        }
        return false;
    };
    return <table className="ui-table">
        <thead>
            <tr>
                <th className="id">#</th>
                <th className="participant">{localize("Participant")}</th>
                <th className="score">{localize("Points")}</th>
                <th className="penalty">{localize("Penalty")}</th>
                {standings.columns?.map((column, index) => {
                    return <ProblemColumnHeader contest={contest} column={column} key={index} />;
                })}
            </tr>
        </thead>
        <tbody>
            {standings.rows?.map((row, index) => {
                let cellByColumn: Record<number, ContestStandingsCell | undefined> = {};
                if (row.cells) {
                    for (let i = 0; i < row.cells.length; i++) {
                        cellByColumn[row.cells[i].column] = row.cells[i];
                    }
                }
                const { participant } = row;
                if (participant?.kind === "regular") {
                    if (currentGroupScore === undefined) {
                        currentGroup = 1;
                        currentGroupScore = row.score ?? 0;
                    }
                    if (currentGroupScore !== (row.score ?? 0)) {
                        currentGroup = 3 - currentGroup;
                        currentGroupScore = row.score ?? 0;
                    }
                } else {
                    currentGroup = 0;
                    currentGroupScore = undefined;
                }
                return <tr key={index} className={`group-${currentGroup}${isCurrent(participant) ? " current" : ""}`}>
                    <td className="id">{row.place ?? ""}</td>
                    <td className="participant">
                        {!!participant && <ParticipantLink participant={participant} />}
                    </td>
                    <td className="score">{row.score ?? 0}</td>
                    <td className="penalty">{row.penalty ?? ""}</td>
                    {standings.columns?.map((column, index) => (
                        <ProblemCell
                            contest={contest}
                            column={column}
                            participantId={participant?.id}
                            cell={cellByColumn[index]}
                            kind="icpc"
                            key={index} />
                    ))}
                </tr>;
            })}
        </tbody>
    </table>;
};

const IOIStandingsTable: FC<StandingsTableProps> = props => {
    const { contest, standings } = props;
    const { status } = useAuth();
    const { localize } = useLocale();
    const isCurrent = (rowParticipant?: ContestParticipant) => {
        if (!rowParticipant) {
            return false;
        }
        if (rowParticipant.user && status?.user) {
            return rowParticipant.user.id === status.user.id;
        }
        if (rowParticipant.scope_user && status?.scope_user) {
            return rowParticipant.scope_user.id === status.scope_user.id;
        }
        return false;
    };
    return <table className="ui-table">
        <thead>
            <tr>
                <th className="id">#</th>
                <th className="participant">{localize("Participant")}</th>
                <th className="score">{localize("Score")}</th>
                {standings.columns?.map((column, index) => {
                    return <ProblemColumnHeader contest={contest} column={column} key={index} />;
                })}
            </tr>
        </thead>
        <tbody>
            {standings.rows?.map((row, index) => {
                let cellByColumn: Record<number, ContestStandingsCell | undefined> = {};
                if (row.cells) {
                    for (let i = 0; i < row.cells.length; i++) {
                        cellByColumn[row.cells[i].column] = row.cells[i];
                    }
                }
                const { participant } = row;
                return <tr key={index} className={isCurrent(participant) ? "current" : undefined}>
                    <td className="id">{row.place ?? ""}</td>
                    <td className="participant">
                        {!!participant && <ParticipantLink participant={participant} />}
                    </td>
                    <td className="score">{row.score ?? 0}</td>
                    {standings.columns?.map((column, index) => (
                        <ProblemCell
                            contest={contest}
                            column={column}
                            participantId={participant?.id}
                            cell={cellByColumn[index]}
                            kind="ioi"
                            key={index} />
                    ))}
                </tr>;
            })}
        </tbody>
    </table>;
};

type StandingsDurationProps = {
    value: number;
};

const formatPart = (value: number) => {
    let result = String(value);
    while (result.length < 2) {
        result = "0" + result;
    }
    return result;
};

const StandingsDuration: FC<StandingsDurationProps> = props => {
    const { value } = props;
    const minutes = Math.trunc(value / 60) % 60;
    const hours = Math.trunc(value / 3600) % 24;
    const days = Math.trunc(value / 86400);
    if (days) {
        return <>{days}d {formatPart(hours)}:{formatPart(minutes)}</>;
    }
    return <>{formatPart(hours)}:{formatPart(minutes)}</>;
};
