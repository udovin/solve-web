import { FC, FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Contest, ContestProblem, ContestProblems, createContestProblem, deleteContestProblem, ErrorResponse, observeContestProblems, observeProblems, updateContestProblem, UpdateContestProblemForm } from "../../api";
import FormBlock from "../../components/FormBlock";
import Alert from "../../ui/Alert";
import Block from "../../ui/Block";
import Button from "../../ui/Button";
import Checkbox from "../../ui/Checkbox";
import Dialog from "../../ui/Dialog";
import Field from "../../ui/Field";
import IconButton from "../../ui/IconButton";
import Input from "../../ui/Input";
import NumberInput from "../../ui/NumberInput";
import { useLocale } from "../../ui/Locale";
import ProblemInput, { Problem as FormProblem } from "../../ui/ProblemInput";

type ContestProblemRowProps = {
    contest: Contest;
    problem: ContestProblem;
    onUpdate?: (form: UpdateContestProblemForm, close: () => void, setError: (error: ErrorResponse) => void) => void;
    onDelete?: () => void;
};

const ContestProblemRow: FC<ContestProblemRowProps> = props => {
    const { contest, problem: contestProblem, onUpdate, onDelete } = props;
    const { code, problem, solved, points, locales } = contestProblem;
    const { title, statement } = problem;
    const { localize } = useLocale();
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<ErrorResponse>();
    const [newCode, setNewCode] = useState(code);
    const [newPoints, setNewPoints] = useState(points);
    const [ruLocale, setRuLocale] = useState(locales?.includes("ru") ?? false);
    const [enLocale, setEnLocale] = useState(locales?.includes("en") ?? false);
    useEffect(() => {
        setError(undefined);
        setNewCode(code);
        setNewPoints(points);
        setRuLocale(locales?.includes("ru") ?? false);
        setEnLocale(locales?.includes("en") ?? false);
    }, [open, code, points, locales]);
    return <tr className={`problem${solved === true ? " solved" : (solved === false ? " not-solved" : "")}`}>
        <td className="code">
            <Link to={`/contests/${contest.id}/problems/${code}`}>{code}</Link>
        </td>
        <td className="title">
            <Link to={`/contests/${contest.id}/problems/${code}`}>{statement?.title ?? title}</Link>
            {points && <span className="points">({localize("Points")}: {points})</span>}
        </td>
        <td className="actions">
            {onUpdate && <IconButton kind="edit" onClick={() => setOpen(true)} />}
            {onDelete && <IconButton kind="delete" onClick={onDelete} />}
            {onUpdate && <Dialog open={open} onClose={() => setOpen(false)}>
                <FormBlock title={localize("Edit problem")} onSubmit={(event: FormEvent) => {
                    event.preventDefault();
                    let newLocales: string[] = [];
                    if (ruLocale) {
                        newLocales.push("ru");
                    }
                    if (enLocale) {
                        newLocales.push("en");
                    }
                    onUpdate({ code: newCode, points: newPoints ?? 0, locales: newLocales }, () => setOpen(false), setError);
                }} footer={
                    <Button type="submit">{localize("Update")}</Button>
                }>
                    {error && <Alert>{error.message}</Alert>}
                    <Field title={localize("Code") + ":"} name="code" errorResponse={error}>
                        <Input value={newCode} onValueChange={setNewCode} placeholder={localize("Code")} />
                    </Field>
                    <Field title={localize("Points") + ":"} name="points" errorResponse={error}>
                        <NumberInput value={newPoints} onValueChange={setNewPoints} placeholder={localize("Points")} />
                    </Field>
                    <Field>
                        <Checkbox value={ruLocale} onValueChange={setRuLocale} />
                        <span className="label">Русский</span>
                    </Field>
                    <Field>
                        <Checkbox value={enLocale} onValueChange={setEnLocale} />
                        <span className="label">English</span>
                    </Field>
                </FormBlock>
            </Dialog>}
        </td>
    </tr>;
};

type ContestProblemsBlockProps = {
    contest: Contest;
};

export const ContestProblemsBlock: FC<ContestProblemsBlockProps> = props => {
    const { contest } = props;
    const { localize } = useLocale();
    const [error, setError] = useState<ErrorResponse>();
    const [problems, setProblems] = useState<ContestProblems>();
    const [code, setCode] = useState<string>();
    const [problem, setProblem] = useState<FormProblem>();
    const [problemQuery, setProblemQuery] = useState<string>();
    const [points, setPoints] = useState<number>();
    useEffect(() => {
        observeContestProblems(contest.id)
            .then(problems => {
                setProblems(problems)
                setError(undefined)
            })
            .catch(setError)
    }, [contest.id]);
    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (!code || !problem) {
            return;
        }
        createContestProblem(contest.id, {
            code: code,
            problem_id: problem.id,
            points: points,
        })
            .then(problem => {
                setProblems({ ...problems, problems: [...(problems?.problems ?? []), problem] });
                setCode(undefined);
                setProblem(undefined);
                setProblemQuery(undefined);
                setPoints(undefined);
                setError(undefined);
            })
            .catch(setError);
    };
    const canCreateProblem = contest.permissions?.includes("create_contest_problem");
    const canUpdateProblem = contest.permissions?.includes("update_contest_problem");
    const canDeleteProblem = contest.permissions?.includes("delete_contest_problem");
    if (!problems) {
        return <Block title={localize("Problems")} className="b-contest-problems">
            {error ? <Alert>{error.message}</Alert> : "Loading..."}
        </Block>;
    }
    let contestProblems: ContestProblem[] = problems.problems ?? [];
    contestProblems.sort((a, b: ContestProblem) => {
        return String(a.code).localeCompare(b.code);
    });
    const fetchProblems = (query?: string) => {
        return observeProblems({ query: query }).then(problems => {
            return problems?.problems?.map(problem => {
                return {
                    id: problem.id,
                    name: problem.title,
                    title: problem.statement?.title,
                };
            }) ?? [];
        });
    };
    return <Block
        title={localize("Problems")}
        className="b-contest-problems"
        footer={canCreateProblem && <form onSubmit={onSubmit}>
            <Input name="code"
                value={code || ""}
                onValueChange={setCode}
                placeholder={localize("Code")}
                required />
            <ProblemInput
                problem={problem}
                onProblemChange={setProblem}
                query={problemQuery}
                onQueryChange={setProblemQuery}
                fetchProblems={fetchProblems}
                placeholder={localize("Problem")} />
            <NumberInput name="points"
                value={points}
                onValueChange={setPoints}
                placeholder={localize("Points")} />
            <Button type="submit" disabled={!code || !problem}>{localize("Add")}</Button>
        </form>}
    >
        {error && <Alert>{error.message}</Alert>}
        <table className="ui-table">
            <thead>
                <tr>
                    <th className="code">#</th>
                    <th className="title">{localize("Title")}</th>
                    <th className="actions">{localize("Actions")}</th>
                </tr>
            </thead>
            <tbody>
                {contestProblems.map((problem: ContestProblem, key: number) => {
                    const { code } = problem;
                    const onDeleteProblem = () => {
                        deleteContestProblem(contest.id, code)
                            .then(problem => {
                                const contestProblems = [...(problems?.problems ?? [])];
                                const pos = contestProblems.findIndex(value => value.id === problem.id);
                                if (pos >= 0) {
                                    contestProblems.splice(pos, 1);
                                }
                                setProblems({ ...problems, problems: contestProblems });
                                setError(undefined);
                            })
                            .catch(setError);
                    };
                    const onUpdateProblem = (form: UpdateContestProblemForm, close: () => void, setError: (error: ErrorResponse) => void) => {
                        updateContestProblem(contest.id, code, form)
                            .then(problem => {
                                const contestProblems = [...(problems?.problems ?? [])];
                                const pos = contestProblems.findIndex(value => value.id === problem.id);
                                contestProblems[pos] = problem;
                                setProblems({ ...problems, problems: contestProblems });
                                close();
                            })
                            .catch(setError);
                    };
                    return <ContestProblemRow
                        contest={contest}
                        problem={problem}
                        onUpdate={canUpdateProblem ? onUpdateProblem : undefined}
                        onDelete={canDeleteProblem ? onDeleteProblem : undefined}
                        key={key} />;
                })}
            </tbody>
        </table>
    </Block>;
};

type ContestProblemsSideBlockProps = {
    contest: Contest;
};

export const ContestProblemsSideBlock: FC<ContestProblemsSideBlockProps> = props => {
    const { contest } = props;
    const { problem_code } = useParams();
    const { localize } = useLocale();
    const [error, setError] = useState<ErrorResponse>();
    const [problems, setProblems] = useState<ContestProblems>();
    useEffect(() => {
        observeContestProblems(contest.id)
            .then(problems => {
                setProblems(problems)
                setError(undefined)
            })
            .catch(setError)
    }, [contest.id]);
    if (!problems) {
        return <></>;
    }
    let contestProblems: ContestProblem[] = problems.problems ?? [];
    contestProblems.sort((a, b: ContestProblem) => {
        return String(a.code).localeCompare(b.code);
    });
    return <Block className="b-contest-side-problems">
        {error && <Alert>{error.message}</Alert>}
        <table className="ui-table">
            <tbody>
                {contestProblems.map((contestProblem: ContestProblem, key: number) => {
                    const { code, problem, points, solved } = contestProblem;
                    const { title, statement } = problem;
                    return <tr className={`problem${solved === true ? " solved" : (solved === false ? " not-solved" : "")}`} key={key}>
                        <td className="code">
                            {code === problem_code ? <>{code}</> : <Link to={`/contests/${contest.id}/problems/${code}`}>{code}</Link>}
                        </td>
                        <td className="title">
                            {code === problem_code ? <>{statement?.title ?? title}</> : <Link to={`/contests/${contest.id}/problems/${code}`}>{statement?.title ?? title}</Link>}
                            {points && <span className="points">({localize("Points")}: {points})</span>}
                        </td>
                    </tr>;
                })}
            </tbody>
        </table>
    </Block>;
};

