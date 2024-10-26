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
				"name": "add",
				"title": "A + B",
			},
			{
				"id": 2,
				"name": "mul",
				"title": "A * B",
			},
			{
				"id": 3,
				"name": "pow",
				"title": "A ^ B",
			},
			{
				"id": 4,
				"name": "tet",
				"title": "A ^^ B",
			},
			{
				"id": 5,
				"name": "broken",
			}
		]);
	};
	const [query, setQuery] = useState<string>();
	const [problem, setProblem] = useState<Problem | undefined>({ "id": 1, "name": "add", "title": "A + B" });
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
