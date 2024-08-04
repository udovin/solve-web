import { FC, useContext, useEffect, useState } from "react";
import { Contest, ContestParticipant, ContestStandings, ContestStandingsCell, observeContestStandings } from "../../api";
import Block from "../../ui/Block";
import Checkbox from "../../ui/Checkbox";
import Field from "../../ui/Field";
import { ParticipantLink } from "./participants";
import { AuthContext } from "../../ui/Auth";
import { LocaleContext } from "../../ui/Locale";

type ContestStandingsBlockProps = {
    contest: Contest;
};

export const ContestStandingsBlock: FC<ContestStandingsBlockProps> = props => {
    const { contest } = props;
    const { localize } = useContext(LocaleContext);
    const [standings, setStandings] = useState<ContestStandings>();
    const [ignoreFreeze, setIgnoreFreeze] = useState<boolean>();
    const [onlyOfficial, setOnlyOfficial] = useState<boolean>(localStorage.getItem("contest_only_official") === "true");
    const [canChangeFreeze, setCanChangeFreeze] = useState<boolean>(false);
    useEffect(() => {
        observeContestStandings(contest.id, ignoreFreeze, onlyOfficial)
            .then(standings => {
                setStandings(standings);
                setCanChangeFreeze(ignoreFreeze || standings.frozen);
            });
        localStorage.setItem("contest_only_official", onlyOfficial ? "true" : "false")
    }, [contest.id, ignoreFreeze, onlyOfficial]);
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
    </>} className="b-contest-standings">
        {standings.kind === "ioi" ? <IOIStandingsTable standings={standings} /> : <ICPCStandingsTable standings={standings} />}
    </Block>;
}

type StandingsTableProps = {
    standings: ContestStandings;
};

const ICPCStandingsTable: FC<StandingsTableProps> = props => {
    const { standings } = props;
    let currentGroup = 0;
    let currentGroupScore: number | undefined = undefined;
    const { status } = useContext(AuthContext);
    const { localize } = useContext(LocaleContext);
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
                    return <th className={"problem"} key={index}>
                        <span className="code">{column.code}</span>
                        {column.points && <span className="points">{column.points}</span>}
                        {<span className="solutions">{column.accepted_solutions ?? 0} &#8725; {column.total_solutions ?? 0}</span>}
                    </th>;
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
                    {standings.columns?.map((_, index) => {
                        const cell = cellByColumn[index];
                        if (!cell) {
                            return <td className="problem" key={index}></td>;
                        }
                        if (!cell.verdict) {
                            return <td className="problem unknown" key={index}>
                                <span className="attempt">?{cell.attempt ?? 1}</span>
                                {!!cell.time && <span className="time">{<StandingsDuration value={cell.time} />}</span>}
                            </td>;
                        }
                        if (cell.verdict === "accepted") {
                            return <td className="problem accepted" key={index}>
                                <span className="attempt">+{cell.attempt && cell.attempt > 1 ? cell.attempt - 1 : ""}</span>
                                {!!cell.time && <span className="time">{<StandingsDuration value={cell.time} />}</span>}
                            </td>;
                        }
                        return <td className="problem rejected" key={index}>
                            <span className="attempt">&minus;{cell.attempt ?? 1}</span>
                            {!!cell.time && <span className="time">{<StandingsDuration value={cell.time} />}</span>}
                        </td>;
                    })}
                </tr>;
            })}
        </tbody>
    </table>;
};

const IOIStandingsTable: FC<StandingsTableProps> = props => {
    const { standings } = props;
    const { status } = useContext(AuthContext);
    const { localize } = useContext(LocaleContext);
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
                    return <th className={"problem"} key={index}>
                        <span className="code">{column.code}</span>
                        {column.points && <span className="points">{column.points}</span>}
                        {<span className="solutions">{column.accepted_solutions ?? 0} &#8725; {column.total_solutions ?? 0}</span>}
                    </th>;
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
                    {standings.columns?.map((_, index) => {
                        const cell = cellByColumn[index];
                        if (!cell) {
                            return <td className="problem" key={index}></td>;
                        }
                        if (!cell.verdict) {
                            return <td className="problem unknown" key={index}>
                                <span className="attempt">{cell.points ?? 0}?</span>
                                {!!cell.time && <span className="time">{<StandingsDuration value={cell.time} />}</span>}
                            </td>;
                        }
                        if (cell.verdict === "accepted") {
                            return <td className="problem accepted" key={index}>
                                <span className="attempt">{cell.points ?? 0}</span>
                                {!!cell.time && <span className="time">{<StandingsDuration value={cell.time} />}</span>}
                            </td>;
                        }
                        return <td className="problem points" key={index}>
                            <span className="attempt">{cell.points ?? 0}</span>
                            {!!cell.time && <span className="time">{<StandingsDuration value={cell.time} />}</span>}
                        </td>;
                    })}
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
