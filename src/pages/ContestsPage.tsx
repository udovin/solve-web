import React, {useEffect, useState} from "react";
import Page from "../components/Page";
import ContestsBlock from "../components/ContestsBlock";
import {ContestsResp, ErrorResp, observeContests} from "../api";
import Sidebar from "../components/Sidebar";
import Alert from "../ui/Alert";

const ContestsPage = () => {
	const [contests, setContests] = useState<ContestsResp>();
	const [error, setError] = useState<ErrorResp>();
	useEffect(() => {
		observeContests()
			.then(contests => setContests(contests))
			.catch(setError);
	}, []);
	if (error) {
		return <Page title="Contests" sidebar={<Sidebar/>}>
			<Alert>{error.message}</Alert>
		</Page>;
	}
	return <Page title="Contests" sidebar={<Sidebar/>}>
		{contests ?
			<ContestsBlock contests={contests.contests || []}/> :
			<>Loading...</>}
	</Page>;
};

export default ContestsPage;
