import { FC, useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../AuthContext";
import { Contests, ErrorResponse, Contest, observeContests } from "../../api";
import Alert from "../../ui/Alert";
import Button from "../../ui/Button";
import Page from "../../components/Page";
import Sidebar from "../../ui/Sidebar";
import Block, { BlockProps } from "../../ui/Block";

import "./index.scss";

export type ContestsBlockProps = BlockProps & {
	contests: Contest[];
};

const ContestsBlock: FC<ContestsBlockProps> = props => {
	const { contests, ...rest } = props;
	return <Block className="b-contests" title="Contests" {...rest}>
		<table className="ui-table">
			<thead>
				<tr>
					<th className="title">Title</th>
				</tr>
			</thead>
			<tbody>
				{contests && contests.map((contest, index) => {
					const { id, title } = contest;
					return <tr key={index} className="contest">
						<td className="title">
							<Link to={`/contests/${id}`}>{title}</Link>
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
	return <Page title="Contests" sidebar={<Sidebar />}>
		{status?.permissions?.includes("create_contest") && <p>
			<Link to={"/contests/create"}><Button>Create</Button></Link>
		</p>}
		{contests ?
			<ContestsBlock contests={contests.contests || []} /> :
			<>Loading...</>}
	</Page>;
};

export default ContestsPage;
