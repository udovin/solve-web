import { FC, useState } from "react";
import ProblemInput, { Problem, ProblemInputProps } from ".";

export default {
	title: "ProblemInput",
};

const TestProblemInput: FC<ProblemInputProps> = props => {
	const { ...rest } = props;
	const fetchProblems = (query?: string) => {
		return Promise.resolve([
			{
				"id": 1,
				"title": "A + B",
			},
			{
				"id": 2,
				"title": "A * B",
			},
			{
				"id": 3,
				"title": "A ^ B",
			},
			{
				"id": 4,
				"title": "A ^^ B",
			}
		]);
	};
	const [query, setQuery] = useState<string>();
	const [problem, setProblem] = useState<Problem | undefined>({ "id": 1, "title": "A + B" });
	return <ProblemInput
		query={query}
		onQueryChange={setQuery}
		problem={problem}
		onProblemChange={setProblem}
		fetchProblems={fetchProblems}
		{...rest}
	/>;
};

export const Index = () => <>
	<TestProblemInput />
</>;
