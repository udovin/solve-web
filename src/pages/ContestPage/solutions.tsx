import { FC, useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Compilers, Contest, ContestProblems, ContestSolution, ContestSolutions, ErrorResponse, observeCompilers, observeContestProblems, observeContestSolution, observeContestSolutions, rejudgeContestSolution, Solution, submitContestSolution } from "../../api";
import FormBlock from "../../components/FormBlock";
import Alert from "../../ui/Alert";
import Block from "../../ui/Block";
import Button from "../../ui/Button";
import Code from "../../ui/Code";
import CollapseBlock from "../../ui/CollapseBlock";
import DateTime from "../../ui/DateTime";
import Field from "../../ui/Field";
import FileInput from "../../ui/FileInput";
import IconButton from "../../ui/IconButton";
import Select from "../../ui/Select";
import Tooltip from "../../ui/Tooltip";
import Verdict from "../../ui/Verdict";
import { SolutionReportBlock } from "../SolutionPage";
import { ParticipantLink } from "./participants";

type ContestSolutionRowProps = {
    contest: Contest;
    solution: ContestSolution;
    onUpdateSolution?(solution: ContestSolution): void;
};

const ContestSolutionRow: FC<ContestSolutionRowProps> = props => {
    const { solution, onUpdateSolution, contest } = props;
    const { id, solution: baseSolution, participant, problem } = solution;
    const { create_time, compiler, report } = baseSolution;
    const baseProblem = problem?.problem;
    const statement = baseProblem?.statement;
    let compilerName = compiler?.name;
    if (compiler?.config?.language) {
        compilerName = compiler.config.language;
        if (compiler.config.compiler) {
            compilerName += ` (${compiler.config.compiler})`;
        }
    }
    const rejudgeSolution = () => {
        rejudgeContestSolution(contest.id, solution.id)
            .then(solution => onUpdateSolution && onUpdateSolution(solution));
    };
    const canUpdateSolution = onUpdateSolution && contest.permissions?.includes("update_contest_solution") && report?.verdict !== "queued";
    return <tr className="problem">
        <td className="id">
            <Link to={`/contests/${contest.id}/solutions/${id}`}>{id}</Link>
        </td>
        <td className="date">
            <DateTime value={create_time} />
        </td>
        <td className="participant">
            {!!participant && <ParticipantLink participant={participant} />}
        </td>
        <td className="problem">
            {baseProblem ? <Link to={`/contests/${contest.id}/problems/${problem.code}`}>{`${problem.code}. ${statement?.title ?? baseProblem.title}`}</Link> : <>&mdash;</>}
        </td>
        <td className="compiler">
            {compilerName ?? <>&mdash;</>}
        </td>
        <td className="verdict">
            <Verdict report={report} />
            {canUpdateSolution && <Tooltip className="rejudge" content="Rejudge"><IconButton kind={"reload"} onClick={rejudgeSolution} /></Tooltip>}
        </td>
    </tr>;
};

type ContestSolutionsBlockProps = {
    contest: Contest;
};

const needUpdateSolution = (solution: ContestSolution) => {
    return solution.solution.report?.verdict === "queued" || solution.solution.report?.verdict === "running";
};

export const ContestSolutionsBlock: FC<ContestSolutionsBlockProps> = props => {
    const { contest } = props;
    const [error, setError] = useState<ErrorResponse>();
    const [solutions, setSolutions] = useState<ContestSolutions>();
    useEffect(() => {
        observeContestSolutions(contest.id)
            .then(result => setSolutions(result || []))
            .catch(setError);
    }, [contest.id]);
    useEffect(() => {
        if (!solutions) {
            return;
        }
        let needUpdate = false;
        solutions.solutions?.forEach(solution => {
            needUpdate = needUpdate || needUpdateSolution(solution);
        });
        if (!needUpdate) {
            return;
        }
        const updateSolutions = () => {
            observeContestSolutions(contest.id)
                .then(result => setSolutions(result || []))
                .catch(setError);
        };
        const interval = setInterval(updateSolutions, 2000);
        return () => clearInterval(interval);
    }, [contest.id, solutions]);
    if (!solutions) {
        return <Block title="Solutions" className="b-contest-solutions">
            {error ? <Alert>{error.message}</Alert> : "Loading..."}
        </Block>;
    }
    let contestSolutions: ContestSolution[] = solutions.solutions ?? [];
    return <Block title="Solutions" className="b-contest-solutions">{error ?
        <Alert>{error.message}</Alert> :
        <table className="ui-table">
            <thead>
                <tr>
                    <th className="id">#</th>
                    <th className="date">Date</th>
                    <th className="participant">Participant</th>
                    <th className="problem">Problem</th>
                    <th className="compiler">Compiler</th>
                    <th className="verdict">Verdict</th>
                </tr>
            </thead>
            <tbody>
                {contestSolutions.map((solution: ContestSolution, key: number) => {
                    return <ContestSolutionRow contest={contest} solution={solution} key={key} />;
                })}
            </tbody>
        </table>
    }</Block>;
};

type ContestSolutionBlockProps = {
    contest: Contest;
    solutionID: number;
};

export const ContestSolutionBlock: FC<ContestSolutionBlockProps> = props => {
    const { contest, solutionID } = props;
    const [error, setError] = useState<ErrorResponse>();
    const [solution, setSolution] = useState<ContestSolution>();
    useEffect(() => {
        observeContestSolution(contest.id, solutionID)
            .then(setSolution)
            .catch(setError);
    }, [contest.id, solutionID]);
    useEffect(() => {
        if (!solution || !needUpdateSolution(solution)) {
            return;
        }
        const updateSolution = () => {
            observeContestSolution(contest.id, solution.id)
                .then(setSolution)
                .catch(setError);
        };
        const interval = setInterval(updateSolution, 2000);
        return () => clearInterval(interval);
    }, [contest.id, solution]);
    if (!solution) {
        return <Block title="Solution" className="b-contest-solutions">
            {error ? <Alert>{error.message}</Alert> : "Loading..."}
        </Block>;
    }
    const { id, solution: baseSolution } = solution;
    const { content, compiler, report } = baseSolution;
    return <>
        <Block title={`Solution #${id}`} className="b-contest-solutions">
            {error && <Alert>{error.message}</Alert>}
            <table className="ui-table">
                <thead>
                    <tr>
                        <th className="id">#</th>
                        <th className="date">Date</th>
                        <th className="participant">Participant</th>
                        <th className="problem">Problem</th>
                        <th className="compiler">Compiler</th>
                        <th className="verdict">Verdict</th>
                    </tr>
                </thead>
                <tbody>
                    <ContestSolutionRow
                        contest={contest}
                        solution={solution}
                        onUpdateSolution={setSolution}
                    />
                </tbody>
            </table>
        </Block>
        {content && <CollapseBlock title="Content" className="b-contest-solution-content">
            <Code value={content} language={compiler?.config?.extensions?.at(0)} readOnly={true} />
        </CollapseBlock>}
        {!!report?.tests && <SolutionReportBlock report={report} />}
    </>;
};

type ContestSubmitSolutionBlockProps = {
    contest: Contest;
};

export const ContestSubmitSolutionBlock: FC<ContestSubmitSolutionBlockProps> = props => {
    const { contest } = props;
    const { search } = useLocation();
    const query = new URLSearchParams(search);
    const queryProblem = query.get("problem") || undefined;
    const [newSolution, setNewSolution] = useState<Solution>();
    const [problem, setProblem] = useState<string | undefined>(queryProblem);
    const [compiler, setCompiler] = useState<number>();
    const [content, setContent] = useState<string>();
    const [file, setFile] = useState<File>();
    const [error, setError] = useState<ErrorResponse>();
    const [compilers, setCompilers] = useState<Compilers>();
    const [problems, setProblems] = useState<ContestProblems>();
    const [uploading, setUploading] = useState<boolean>(false);
    const selectedCompiler = compiler ?? toNumber(localStorage.getItem("last_compiler"));
    const compilerInfo = compilers?.compilers?.find(compiler => compiler.id === selectedCompiler);
    const extensions = compilerInfo?.config?.extensions?.map(ext => `.${ext}`).join(",");
    const canSubmitSolution = contest.permissions?.includes("submit_contest_solution");
    const onSubmit = (event: any) => {
        event.preventDefault();
        if (uploading || (!file && !content) || !compilerInfo || !problem) {
            return;
        }
        setUploading(true);
        setError(undefined);
        const fileResult = file ?? content ?? "";
        submitContestSolution(Number(contest.id), problem, {
            compiler_id: compilerInfo.id,
            file: fileResult,
        })
            .then(solution => {
                setNewSolution(solution);
                setContent(undefined);
                setFile(undefined);
                setError(undefined);
                localStorage.setItem("last_compiler", String(compilerInfo.id));
            })
            .catch(setError)
            .finally(() => setUploading(false));
    };
    useEffect(() => {
        observeContestProblems(contest.id)
            .then(setProblems)
            .catch(setError);
        observeCompilers()
            .then(setCompilers)
            .catch(setError);
    }, [contest]);
    if (newSolution) {
        return <Navigate to={`/contests/${contest.id}/solutions`} />
    }
    const errorMessage = error && error.message;
    return <FormBlock onSubmit={onSubmit} title="Submit solution" className="b-contest-submit" footer={
        <Button
            type="submit"
            color="primary"
            disabled={!canSubmitSolution || uploading || (!file && !content) || !problem || !compilerInfo}
        >Submit</Button>
    }>
        {errorMessage && <Alert>{errorMessage}</Alert>}
        <Field title="Problem:" name="problem_code" errorResponse={error}>
            <Select
                name="problem_code"
                value={String(problem ?? "Select problem")}
                onValueChange={setProblem}
                options={problems?.problems?.reduce((options, problem) => {
                    let title = `${problem.code}. ${problem.problem.statement?.title ?? problem.problem.title}`;
                    return { ...options, [problem.code]: title };
                }, {}) ?? {}}
                disabled={!canSubmitSolution || !problems?.problems}
            />
        </Field>
        <Field title="Compiler:" name="compiler_id" errorResponse={error}>
            <Select
                name="compiler_id"
                value={String(compilerInfo?.id ?? "Select compiler")}
                onValueChange={value => setCompiler(Number(value))}
                options={compilers?.compilers?.reduce((options, compiler) => {
                    let name = compiler.name;
                    if (compiler.config?.language) {
                        name = compiler.config.language;
                        if (compiler.config.compiler) {
                            name += ` (${compiler.config.compiler})`;
                        }
                    }
                    return { ...options, [compiler.id]: name };
                }, {}) ?? {}}
                disabled={!canSubmitSolution || !compilers?.compilers}
            />
        </Field>
        <Field title="Solution content:" name="content">
            <Code
                editable={true}
                language={compilerInfo?.config?.extensions?.at(0)}
                value={content}
                onValueChange={setContent} />
        </Field>
        <Field title="Solution file:" name="file" errorResponse={error}>
            <FileInput
                name="file"
                accept={extensions}
                file={file}
                onFileChange={setFile}
                disabled={!canSubmitSolution} />
        </Field>
    </FormBlock>;
};

const toNumber = (n?: string | null) => {
    return (n === undefined || n === null) ? undefined : Number(n);
};
