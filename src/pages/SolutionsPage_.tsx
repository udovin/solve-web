import { useEffect, useState } from "react";
import Page from "../components/Page";
import { ErrorResponse, Solutions, observeSolutions } from "../api";
import { SolutionsBlock } from "../components/solutions";
import Alert from "../ui/Alert";
import Sidebar from "../components/Sidebar";
// import "./ContestPage.scss";


const SolutionsPage = () => {
	const [solutions, setSolutions] = useState<Solutions>();
	const [error, setError] = useState<ErrorResponse>();
	useEffect(() => {
		observeSolutions()
			.then(solutions => setSolutions(solutions))
			.catch(setError);
	}, []);
	if (error) {
		return <Page title="Solutions" sidebar={<Sidebar />}>
			<Alert>{error.message}</Alert>
		</Page>;
	}
	return <Page title="Solutions" sidebar={<Sidebar />}>
		{solutions ?
			<SolutionsBlock title="Solutions" solutions={solutions.solutions || []} /> :
			<>Loading...</>}
	</Page>;
};

export default SolutionsPage;
