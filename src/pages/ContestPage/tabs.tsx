import { FC } from "react";
import { Link } from "react-router-dom";
import { Contest } from "../../api";
import Block, { BlockProps } from "../../ui/Block";
import { Tab, Tabs } from "../../ui/Tabs";
import { strings } from "../../Locale";

type ContestTabsProps = BlockProps & {
    contest: Contest;
    currentTab?: string;
    newMessages: number;
};

export const ContestTabs: FC<ContestTabsProps> = props => {
    const { contest, newMessages } = props;
    const { id, permissions, state } = contest;
    const canRegister = !state?.participant && permissions?.includes("register_contest");
    const canObserveProblems = permissions?.includes("observe_contest_problems");
    const canSubmitSolution = permissions?.includes("submit_contest_solution");
    const canObserveSolutions = permissions?.includes("observe_contest_solutions");
    const canObserveStandings = permissions?.includes("observe_contest_standings") &&
        contest.standings_kind !== undefined &&
        contest.standings_kind !== "disabled";
    const canObserveMessages = permissions?.includes("observe_contest_messages");
    const canObserveParticipants = permissions?.includes("observe_contest_participants");
    const canManage = permissions?.includes("update_contest") || permissions?.includes("delete_contest");
    return <Block className="b-contest-tabs">
        <Tabs>
            {canObserveProblems && <Tab tab="problems">
                <Link to={`/contests/${id}`}>{strings.problems}</Link>
            </Tab>}
            {canObserveSolutions && <Tab tab="solutions">
                <Link to={`/contests/${id}/solutions`}>{strings.solutions}</Link>
            </Tab>}
            {canSubmitSolution && <Tab tab="submit">
                <Link to={`/contests/${id}/submit`}>{strings.submit}</Link>
            </Tab>}
            {canObserveStandings && <Tab tab="standings">
                <Link to={`/contests/${id}/standings`}>{strings.standings}</Link>
            </Tab>}
            {canObserveMessages && <Tab tab="messages">
                <Link to={`/contests/${id}/messages`}>{strings.messages}{newMessages > 0 && <span className="counter">{newMessages}</span>}</Link>
            </Tab>}
            {canObserveParticipants && <Tab tab="participants">
                <Link to={`/contests/${id}/participants`}>{strings.participants}</Link>
            </Tab>}
            {canRegister && <Tab tab="register">
                <Link to={`/contests/${id}/register`}>{strings.register}</Link>
            </Tab>}
            {canManage && <Tab tab="manage">
                <Link to={`/contests/${id}/manage`}>{strings.manage}</Link>
            </Tab>}
        </Tabs>
    </Block>;
};
