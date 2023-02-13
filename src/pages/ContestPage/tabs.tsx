import { FC } from "react";
import { Link } from "react-router-dom";
import { Contest } from "../../api";
import Block, { BlockProps } from "../../ui/Block";
import { Tab, Tabs } from "../../ui/Tabs";

type ContestTabsProps = BlockProps & {
    contest: Contest;
    currentTab?: string;
};

export const ContestTabs: FC<ContestTabsProps> = props => {
    const { contest } = props;
    const { id, permissions, state } = contest;
    const canRegister = !state?.participant && permissions?.includes("register_contest");
    const canObserveProblems = permissions?.includes("observe_contest_problems");
    const canObserveSolutions = permissions?.includes("observe_contest_solutions");
    const canObserveStandings = permissions?.includes("observe_contest_standings");
    const canObserveMessages = permissions?.includes("observe_contest_messages");
    const canObserveParticipants = permissions?.includes("observe_contest_participants");
    const canManage = permissions?.includes("update_contest") || permissions?.includes("delete_contest");
    return <Block className="b-contest-tabs">
        <Tabs>
            {canObserveProblems && <Tab tab="problems">
                <Link to={`/contests/${id}`}>Problems</Link>
            </Tab>}
            {canObserveSolutions && <Tab tab="solutions">
                <Link to={`/contests/${id}/solutions`}>Solutions</Link>
            </Tab>}
            {canObserveStandings && <Tab tab="standings">
                <Link to={`/contests/${id}/standings`}>Standings</Link>
            </Tab>}
            {canObserveMessages && <Tab tab="messages">
                <Link to={`/contests/${id}/messages`}>Messages</Link>
            </Tab>}
            {canObserveParticipants && <Tab tab="participants">
                <Link to={`/contests/${id}/participants`}>Participants</Link>
            </Tab>}
            {canRegister && <Tab tab="register">
                <Link to={`/contests/${id}/register`}>Register</Link>
            </Tab>}
            {canManage && <Tab tab="manage">
                <Link to={`/contests/${id}/manage`}>Manage</Link>
            </Tab>}
        </Tabs>
    </Block>;
};
