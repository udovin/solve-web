import { FC, useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../ui/Auth";
import { Contests, ErrorResponse, Contest, observeContests } from "../../api";
import Alert from "../../ui/Alert";
import Button from "../../ui/Button";
import Page from "../../components/Page";
import Sidebar from "../../ui/Sidebar";
import Block, { BlockProps } from "../../ui/Block";
import DateTime from "../../ui/DateTime";
import Duration from "../../ui/Duration";
import { LocaleContext } from "../../ui/Locale";

import "./index.scss";

export type ContestsBlockProps = BlockProps & {
	contests: Contest[];
};

const ContestsBlock: FC<ContestsBlockProps> = props => {
	const { contests, ...rest } = props;
	const { localize } = useContext(LocaleContext);
	return <Block className="b-contests" title={localize("Contests")} {...rest}>
		<table className="ui-table">
			<thead>
				<tr>
					<th className="title">{localize("Title")}</th>
					<th className="duration">{localize("Duration")}</th>
					<th className="start">{localize("Start")}</th>
					<th className="actions">{localize("Actions")}</th>
				</tr>
			</thead>
			<tbody>
				{contests && contests.map((contest, index) => {
					const { id, title, begin_time, duration, permissions, state } = contest;
					const canObserve = permissions?.includes("observe_contest_problems");
					const canRegister = !state?.participant && permissions?.includes("register_contest");
					return <tr key={index} className="contest">
						<td className="title">
							<Link to={`/contests/${id}`}>{title}</Link>
						</td>
						<td className="duration">
							{duration ? <Duration value={duration} /> : <>&mdash;</>}
						</td>
						<td className="start" suppressHydrationWarning={true}>
							{begin_time ? <DateTime value={begin_time} /> : <>&mdash;</>}
						</td>
						<td className="actions">
							{
								(canRegister && <Link to={`/contests/${id}/register`}>{localize("Register")} &raquo;</Link>) ||
								(canObserve && <Link to={`/contests/${id}`}>{localize("Enter")} &raquo;</Link>)
							}
						</td>
					</tr>;
				})}
			</tbody>
		</table>
	</Block>
};

const ContestsPage: FC = () => {
	const [contests, setContests] = useState<Contests>();
	const [error, setError] = useState<ErrorResponse>();
	const { status } = useContext(AuthContext);
	const { localize } = useContext(LocaleContext);
	useEffect(() => {
		setContests(undefined);
		observeContests()
			.then(setContests)
			.catch(setError);
	}, []);
	if (error) {
		return <Page title="Error" sidebar={<Sidebar />}>
			{error.message && <Alert>{error.message}</Alert>}
		</Page>;
	}
	return <Page title={localize("Contests")} sidebar={<Sidebar />}>
		{status?.permissions?.includes("create_contest") && <p>
			<Link to={"/contests/create"}><Button>{localize("Create")}</Button></Link>
		</p>}
		{contests ?
			<ContestsBlock contests={contests.contests || []} /> :
			<>Loading...</>}
	</Page>;
};

export default ContestsPage;
