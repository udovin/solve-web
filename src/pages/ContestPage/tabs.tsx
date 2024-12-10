import { FC } from "react";
import { Link } from "react-router-dom";
import { Contest } from "../../api";
import { BlockProps } from "../../ui/Block";
import { Tab } from "../../ui/Tabs";
import { useLocale } from "../../ui/Locale";
import TabsBlock from "../../ui/TabsBlock";

type ContestTabsProps = BlockProps & {
    contest: Contest;
    tab?: string;
    newMessages: number;
};

export const ContestTabs: FC<ContestTabsProps> = props => {
    const { contest, tab, newMessages } = props;
    const { id, permissions, state } = contest;
    const { localize } = useLocale();
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
    return <TabsBlock value={tab}>
        {canObserveProblems && <Tab value="problems">
            <Link to={`/contests/${id}`}>{localize("Problems")}</Link>
        </Tab>}
        {canObserveSolutions && <Tab value="solutions">
            <Link to={`/contests/${id}/solutions`}>{localize("Solutions")}</Link>
        </Tab>}
        {canSubmitSolution && <Tab value="submit">
            <Link to={`/contests/${id}/submit`}>{localize("Submit")}</Link>
        </Tab>}
        {canObserveStandings && <Tab value="standings">
            <Link to={`/contests/${id}/standings`}>{localize("Standings")}</Link>
        </Tab>}
        {canObserveMessages && <Tab value="messages">
            <Link to={`/contests/${id}/messages`}>{localize("Messages")}{newMessages > 0 && <span className="counter">{newMessages}</span>}</Link>
        </Tab>}
        {canObserveParticipants && <Tab value="participants">
            <Link to={`/contests/${id}/participants`}>{localize("Participants")}</Link>
        </Tab>}
        {canRegister && <Tab value="register">
            <Link to={`/contests/${id}/register`}>{localize("Register")}</Link>
        </Tab>}
        {canManage && <Tab value="manage">
            <Link to={`/contests/${id}/manage`}>{localize("Manage")}</Link>
        </Tab>}
    </TabsBlock>;
};
