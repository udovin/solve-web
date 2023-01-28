import { FC, useEffect, useState } from "react";
import { Contest, ContestStandings, ContestStandingsCell, observeContestStandings } from "../../api";
import Block from "../../ui/Block";
import UserLink from "../../ui/UserLink";

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
    useEffect(() => {
        observeContestStandings(contest.id)
            .then(setStandings);
    }, [contest.id]);
    if (!standings) {
        return <>Loading...</>;
    }
    return <Block title="Standings" className="b-contest-standings">
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
                    return <tr>
                        <td className="index">{index + 1}</td>
                        <td className="participant">
                            {participant && <>
                                {participant.user ? <UserLink user={participant.user} /> : <>&mdash;</>}
                            </>}
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
                                    {cell.time && <span className="time">{<StandingsDuration value={cell.time} />}</span>}
                                </td>;
                            }
                            if (cell.verdict === "accepted") {
                                return <td className="problem accepted" key={index}>
                                    <span className="attempt">+{cell.attempt && cell.attempt > 1 ? cell.attempt - 1 : ""}</span>
                                    {cell.time && <span className="time">{<StandingsDuration value={cell.time} />}</span>}
                                </td>;
                            }
                            return <td className="problem rejected" key={index}>
                                <span className="attempt">&minus;{cell.attempt ?? 1}</span>
                                {cell.time && <span className="time">{<StandingsDuration value={cell.time} />}</span>}
                            </td>;
                        })}
                    </tr>;
                })}
            </tbody>
        </table>
    </Block >;
};
