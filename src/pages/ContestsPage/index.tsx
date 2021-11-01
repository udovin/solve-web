import {FC, useEffect, useState, useContext} from "react";
import {Link} from "react-router-dom";
import {AuthContext} from "../../AuthContext";
import {ContestsResp, ErrorResp, observeContests} from "../../api";
import Alert from "../../ui/Alert";
import Button from "../../ui/Button";
import ContestsBlock from "../../components/ContestsBlock";
import Page from "../../components/Page";
import Sidebar from "../../components/Sidebar";

const ContestsPage: FC = () => {
	const [contests, setContests] = useState<ContestsResp>();
	const [error, setError] = useState<ErrorResp>();
	const {status} = useContext(AuthContext);
	useEffect(() => {
		setContests(undefined);
		observeContests()
			.then(setContests)
			.catch(setError);
	}, []);
	if (error) {
		return <Page title="Error" sidebar={<Sidebar/>}>
			{error.message && <Alert>{error.message}</Alert>}
		</Page>;
	}
	if (!contests) {
		return <Page title="Contests" sidebar={<Sidebar/>}>Loading...</Page>;
	}
	return <Page title="Contests" sidebar={<Sidebar/>}>
		{status?.roles.includes("create_contest") && <p>
			<Link to={"/contests/create"}><Button>Create</Button></Link>
		</p>}
		{contests ?
			<ContestsBlock contests={contests.contests || []}/> :
			<>Loading...</>}
	</Page>;
};

export default ContestsPage;
