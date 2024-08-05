import { FC, useCallback, useContext, useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Compilers, Contest, ContestParticipants, ContestProblems, ContestSolution, ContestSolutions, ErrorResponse, observeCompilers, observeContestParticipants, observeContestProblems, observeContestSolution, observeContestSolutions, rejudgeContestSolution, Solution, submitContestSolution } from "../../api";
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
import { LocaleContext } from "../../ui/Locale";

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
    participantFilter?: number;
    problemFilter?: number;
};

const needUpdateSolution = (solution: ContestSolution) => {
    return solution.solution.report?.verdict === "queued" || solution.solution.report?.verdict === "running";
};

export const ContestSolutionsBlock: FC<ContestSolutionsBlockProps> = props => {
    const { contest } = props;
    const { localize } = useContext(LocaleContext);
    const [error, setError] = useState<ErrorResponse>();
    const [solutions, setSolutions] = useState<ContestSolutions>();
    const [loading, setLoading] = useState(false);
    const [participantFilter, setParticipantFilter] = useState<number>();
    const [problemFilter, setProblemFilter] = useState<number>();
    const [problems, setProblems] = useState<ContestProblems>();
    const [participants, setParticipants] = useState<ContestParticipants>();
    const canObserveProblems = contest?.permissions?.includes("observe_contest_problems");
    const canObserveParticipants = contest?.permissions?.includes("observe_contest_participants");
    useEffect(() => {
        setLoading(true);
        setSolutions(undefined);
        observeContestSolutions(contest.id, {
            begin_id: 0,
            participant_id: participantFilter,
            problem_id: problemFilter,
        })
            .then(setSolutions)
            .catch(setError)
            .finally(() => setLoading(false));
    }, [contest.id, participantFilter, problemFilter]);
    useEffect(() => {
        setParticipants(undefined);
        if (!canObserveProblems || !canObserveParticipants) {
            return;
        }
        observeContestParticipants(contest.id)
            .then(setParticipants)
            .catch(setError);
    }, [contest.id, canObserveProblems, canObserveParticipants]);
    useEffect(() => {
        setProblems(undefined);
        if (!canObserveProblems || !canObserveParticipants) {
            return;
        }
        observeContestProblems(contest.id)
            .then(setProblems)
            .catch(setError);
    }, [contest.id, canObserveProblems, canObserveParticipants]);
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
        const mergeSolutions = (newSolutions: ContestSolution[]) => {
            let solutionPos: Record<number, number | undefined> = {};
            newSolutions.forEach((solution, index) => {
                solutionPos[solution.id] = index;
            });
            let mergedSolutions = solutions.solutions?.map(solution => {
                let index = solutionPos[solution.id];
                return index !== undefined ? newSolutions[index] : solution;
            });
            setSolutions({
                solutions: mergedSolutions || [],
                next_begin_id: solutions.next_begin_id,
            });
        };
        const updateSolutions = () => {
            observeContestSolutions(contest.id, {
                begin_id: 0,
                participant_id: participantFilter,
                problem_id: problemFilter,
            })
                .then(result => mergeSolutions(result?.solutions ?? []))
                .catch(setError);
        };
        const interval = setInterval(updateSolutions, 2000);
        return () => clearInterval(interval);
    }, [contest.id, solutions, participantFilter, problemFilter]);
    const loadMoreSolutions = useCallback(() => {
        if (loading) {
            return;
        }
        setLoading(true);
        observeContestSolutions(contest.id, {
            begin_id: solutions?.next_begin_id ?? 0,
            participant_id: participantFilter,
            problem_id: problemFilter,
        })
            .then(result => setSolutions({
                solutions: [...(solutions?.solutions ?? []), ...(result.solutions ?? [])],
                next_begin_id: result.next_begin_id,
            }))
            .catch(setError)
            .finally(() => setLoading(false));
    }, [contest, loading, solutions, participantFilter, problemFilter]);
    useEffect(() => {
        if (!document || !document.scrollingElement) {
            return;
        }
        if (loading || !solutions?.next_begin_id) {
            return;
        }
        const checkAutoload = () => {
            if (!document || !document.scrollingElement) {
                return;
            }
            if (window.innerHeight + document.documentElement.scrollTop + 150 >= document.scrollingElement.scrollHeight) {
                loadMoreSolutions();
            }
        };
        const interval = setInterval(checkAutoload, 100);
        window.addEventListener("resize", checkAutoload);
        window.addEventListener("scroll", checkAutoload, true);
        return () => {
            clearInterval(interval);
            window.removeEventListener("resize", checkAutoload);
            window.removeEventListener("scroll", checkAutoload, true);
        };
    }, [loading, loadMoreSolutions, solutions]);
    let contestSolutions = solutions?.solutions ?? [];
    let nextBeginID = solutions?.next_begin_id ?? 0;
    return <Block header={<>
        <span className="title">{localize("Solutions")}</span>
        {problems?.problems && <Select name="problem" options={problems?.problems?.reduce((options, problem) => {
            let title = `${problem.code}. ${problem.problem.statement?.title ?? problem.problem.title}`;
            return { ...options, [problem.id]: title };
        }, { "0": localize("Any problem") }) ?? {}} value={String(problemFilter ?? 0)} onValueChange={v => setProblemFilter(Number(v))} />}
        {participants?.participants && <Select name="participant" options={participants?.participants?.reduce((options, participant) => {
            if (participant.scope || participant.group) {
                return options;
            }
            let title = <ParticipantLink participant={participant} disabled />;
            return { ...options, [participant.id ?? 0]: title };
        }, { "0": localize("Any participant") }) ?? {}} value={String(participantFilter ?? 0)} onValueChange={v => setParticipantFilter(Number(v))} />}
    </>
    } className="b-contest-solutions" > {
            error ?
                <Alert>{error.message}</Alert> :
                <table className="ui-table">
                    <thead>
                        <tr>
                            <th className="id">#</th>
                            <th className="date">{localize("Time")}</th>
                            <th className="participant">{localize("Participant")}</th>
                            <th className="problem">{localize("Problem")}</th>
                            <th className="compiler">{localize("Compiler")}</th>
                            <th className="verdict">{localize("Verdict")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contestSolutions.map((solution: ContestSolution, key: number) => {
                            return <ContestSolutionRow contest={contest} solution={solution} key={key} />;
                        })}
                        {loading && <tr><td colSpan={6}>Loading...</td></tr>}
                        {!!nextBeginID && !loading && <tr>
                            <td colSpan={6}>
                                <Button onClick={loadMoreSolutions}>Load more</Button>
                            </td>
                        </tr>}
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
    const { localize } = useContext(LocaleContext);
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
        <Block title={localize("Solution") + " #" + id} className="b-contest-solutions">
            {error && <Alert>{error.message}</Alert>}
            <table className="ui-table">
                <thead>
                    <tr>
                        <th className="id">#</th>
                        <th className="date">{localize("Time")}</th>
                        <th className="participant">{localize("Participant")}</th>
                        <th className="problem">{localize("Problem")}</th>
                        <th className="compiler">{localize("Compiler")}</th>
                        <th className="verdict">{localize("Verdict")}</th>
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
        {content && <CollapseBlock title={localize("Source code")} className="b-contest-solution-content">
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
    const { localize } = useContext(LocaleContext);
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
    return <FormBlock onSubmit={onSubmit} title={localize("Submit solution")} className="b-contest-submit" footer={
        <Button
            type="submit"
            color="primary"
            disabled={!canSubmitSolution || uploading || (!file && !content) || !problem || !compilerInfo}
        >{localize("Submit")}</Button>
    }>
        {errorMessage && <Alert>{errorMessage}</Alert>}
        <Field title={localize("Problem") + ":"} name="problem_code" errorResponse={error}>
            <Select
                name="problem_code"
                value={String(problem ?? localize("Select problem"))}
                onValueChange={setProblem}
                options={problems?.problems?.reduce((options, problem) => {
                    let title = `${problem.code}. ${problem.problem.statement?.title ?? problem.problem.title}`;
                    return { ...options, [problem.code]: title };
                }, {}) ?? {}}
                disabled={!canSubmitSolution || !problems?.problems}
            />
        </Field>
        <Field title={localize("Compiler") + ":"} name="compiler_id" errorResponse={error}>
            <Select
                name="compiler_id"
                value={String(compilerInfo?.id ?? localize("Select compiler"))}
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
        <Field title={localize("Source code") + ":"} name="content">
            <Code
                editable={true}
                language={compilerInfo?.config?.extensions?.at(0)}
                value={content}
                onValueChange={setContent} />
        </Field>
        <Field title={localize("Solution file") + ":"} name="file" errorResponse={error}>
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
