import React, {useEffect, useState} from "react";
import Page from "../components/Page";
import {ErrorResp, observeSolutions, SolutionsResp} from "../api";
import {SolutionsBlock} from "../components/solutions";
import Alert from "../ui/Alert";
import Sidebar from "../components/Sidebar";
import "./ContestPage.scss";


const SolutionsPage = () => {
	const [solutions, setSolutions] = useState<SolutionsResp>();
	const [error, setError] = useState<ErrorResp>();
	useEffect(() => {
		observeSolutions()
			.then(solutions => setSolutions(solutions))
			.catch(setError);
	}, []);
	if (error) {
		return <Page title="Solutions" sidebar={<Sidebar/>}>
			<Alert>{error.message}</Alert>
		</Page>;
	}
	return <Page title="Solutions" sidebar={<Sidebar/>}>
		{solutions ?
			<SolutionsBlock title="Solutions" solutions={solutions.solutions || []}/> :
			<>Loading...</>}
	</Page>;
};

export default SolutionsPage;
