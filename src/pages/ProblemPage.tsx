import { FC, useEffect, useState } from "react";
import Page from "../components/Page";
import { Problem } from "../api";
import Block from "../ui/Block";
import { useParams } from "react-router-dom";

type ProblemPageParams = {
	ProblemID: string;
}

const ProblemPage: FC = () => {
	const params = useParams();
	const { ProblemID } = params;
	const [problem, setProblem] = useState<Problem>();
	useEffect(() => {
		fetch("/api/v0/problems/" + ProblemID)
			.then(result => result.json())
			.then(result => setProblem(result));
	}, [ProblemID]);
	if (!problem) {
		return <>Loading...</>;
	}
	return <Page title={problem.title}>
		<Block title={problem.title}>
			{/* <div className="problem-statement" dangerouslySetInnerHTML={{__html: problem.Description}}/> */}
		</Block>
	</Page>;
};

export default ProblemPage;
