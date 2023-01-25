import { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Contest, ContestProblem, ContestSolution, ContestSolutions, ErrorResponse, observeContestSolution, observeContestSolutions, TestReport } from "../../api";
import Alert from "../../ui/Alert";
import Block from "../../ui/Block";
import Code from "../../ui/Code";
import DateTime from "../../ui/DateTime";
import UserLink from "../../ui/UserLink";
import Verdict from "../../ui/Verdict";
import { SolutionReportBlock } from "../SolutionPage";

type ContestStandingsBlockProps = {
    contest: Contest;
};

export const ContestStandingsBlock: FC<ContestStandingsBlockProps> = props => {
    const { contest } = props;
    return <Block title="Standings" className="b-contest-standings">
        <table className="ui-table">
            <thead>
                <tr>
                    <th className="id">#</th>
                    <th className="date">Date</th>
                    <th className="participant">Participant</th>
                    <th className="problem">Problem</th>
                    <th className="compiler">Compiler</th>
                    <th className="verdict">Verdict</th>
                    <th className="points">Points</th>
                </tr>
            </thead>
            <tbody>

            </tbody>
        </table>
    </Block>;
};
