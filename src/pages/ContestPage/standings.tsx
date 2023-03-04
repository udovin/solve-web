import { FC, useEffect, useState } from "react";
import { Contest, ContestStandings, ContestStandingsCell, observeContestStandings } from "../../api";
import Block from "../../ui/Block";
import Checkbox from "../../ui/Checkbox";
import Field from "../../ui/Field";
import { ParticipantLink } from "./participants";

type ContestStandingsBlockProps = {
    contest: Contest;
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
        return <>{days} day{days > 1 ? "s" : ""} {formatPart(hours)}:{formatPart(minutes)}</>;
    }
    return <>{formatPart(hours)}:{formatPart(minutes)}</>;
};

export const ContestStandingsBlock: FC<ContestStandingsBlockProps> = props => {
    const { contest } = props;
    const [standings, setStandings] = useState<ContestStandings>();
    const [ignoreFreeze, setIgnoreFreeze] = useState<boolean>();
    useEffect(() => {
        observeContestStandings(contest.id, ignoreFreeze)
            .then(setStandings);
    }, [contest.id, ignoreFreeze]);
    if (!standings) {
        return <>Loading...</>;
    }
    const canObserveFullStandings = contest.permissions?.includes("observe_contest_full_standings");
    return <Block header={<>
        <span className="title">Standings</span>
        {canObserveFullStandings && <Field>
            <Checkbox
                value={ignoreFreeze ?? false}
                onValueChange={setIgnoreFreeze} />
            <span className="label">Show unfrozen</span>
        </Field>}
    </>} className="b-contest-standings">
        <table className="ui-table">
            <thead>
                <tr>
                    <th className="id">#</th>
                    <th className="participant">Participant</th>
                    <th className="score">Score</th>
                    <th className="penalty">Penalty</th>
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
                    return <tr key={index}>
                        <td className="id">{row.place ?? ""}</td>
                        <td className="participant">
                            {!!participant && <ParticipantLink participant={participant} />}
                        </td>
                        <td className="score">{row.score ?? 0}</td>
                        <td className="penalty">{row.penalty ?? ""}</td>
                        {standings.columns?.map((column, index) => {
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
        </table>
    </Block >;
};
