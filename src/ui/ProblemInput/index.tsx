import { CSSProperties, FC, useCallback, useEffect, useRef, useState } from "react";
import Input from "../Input";
import Portal from "../Portal";
import { useDebounce } from "../../utils/debounce";

import "../AccountInput/index.scss";

export type Problem = {
	id: number;
	name?: string;
	title?: string;
};

export type ProblemInputProps = {
	placeholder?: string;
	disabled?: boolean;
	query?: string;
	onQueryChange?(query?: string): void;
	problem?: Problem;
	onProblemChange?(problem?: Problem): void;
	fetchProblems?(query?: string): Promise<Problem[]>;
};

const ProblemInput: FC<ProblemInputProps> = props => {
	const { placeholder, disabled, query, onQueryChange, problem, onProblemChange, fetchProblems } = props;
	const ref = useRef<HTMLInputElement>(null);
	const [focused, setFocused] = useState(false);
	const [style, setStyle] = useState<CSSProperties>({});
	const [problems, setProblems] = useState<Problem[]>([]);
	if (problem && !query && onQueryChange) {
		onQueryChange(problem.name ?? problem.id.toString());
	}
	const updateStyle = () => {
		if (!ref.current) {
			return;
		}
		const element = ref.current;
		setStyle({
			top: element.getBoundingClientRect().top + window.scrollY + element.offsetHeight,
			left: element.getBoundingClientRect().left + window.scrollX,
			minWidth: element.offsetWidth,
		});
	};
	useEffect(() => {
		if (!ref.current) {
			return;
		}
		updateStyle();
		window.addEventListener("resize", updateStyle);
		window.addEventListener("scroll", updateStyle, true);
		return () => {
			window.removeEventListener("resize", updateStyle);
			window.removeEventListener("scroll", updateStyle, true);
		};
	}, [ref, focused]);
	const updateQuery = (query: string) => {
		if (onQueryChange) {
			onQueryChange(query);
		}
		if (onProblemChange) {
			onProblemChange(undefined);
		}
	};
	const updateProblem = (problem: Problem) => {
		if (onQueryChange) {
			onQueryChange(problem.name ?? problem.id.toString());
		}
		if (onProblemChange) {
			onProblemChange(problem);
		}
	};
	const debouncedQuery = useDebounce(query, 300);
	const updateProblems = useCallback(() => {
		if (fetchProblems) {
			fetchProblems(debouncedQuery).then(setProblems).catch(console.log);
		}
	}, [debouncedQuery, fetchProblems]);
	useEffect(() => {
		if (focused) {
			updateProblems();
		}
	}, [focused, updateProblems]);
	return <>
		<Input
			value={query}
			onValueChange={updateQuery}
			placeholder={placeholder}
			disabled={disabled}
			onFocus={() => setFocused(true)}
			onBlur={() => setFocused(false)}
			ref={ref} />
		{focused && !disabled && <Portal>
			<div className="ui-search-portal" style={style} onMouseDown={(event) => { event.preventDefault(); }}>
				<div className="search-box">
					<ul className="items">
						{problems && problems.map((item: Problem, key: number) => {
							return <li
								className={item.id === problem?.id ? "selected" : undefined}
								onClick={() => updateProblem(item)}
								key={key}
							>
								<span className="title">{item.title ?? item.name ?? item.id}</span>
								{item.title && item.name && <span className="subtitle">{item.name}</span>}
							</li>;
						})}
					</ul>
				</div>
			</div>
		</Portal>}
	</>;
};

export default ProblemInput;
