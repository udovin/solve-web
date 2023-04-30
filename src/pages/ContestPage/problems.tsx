import { FC, FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Contest, ContestProblem, ContestProblems, createContestProblem, deleteContestProblem, ErrorResponse, observeContestProblems, updateContestProblem, UpdateContestProblemForm } from "../../api";
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
        </td>
        <td className="actions">
            {onUpdate && <IconButton kind="edit" onClick={() => setOpen(true)} />}
            {onDelete && <IconButton kind="delete" onClick={onDelete} />}
            {onUpdate && <Dialog open={open} onClose={() => setOpen(false)}>
                <FormBlock title="Edit problem" onSubmit={(event: FormEvent) => {
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
                    <Button type="submit">Update</Button>
                }>
                    {error && <Alert>{error.message}</Alert>}
                    <Field title="Code:" name="code" errorResponse={error}>
                        <Input value={newCode} onValueChange={setNewCode} placeholder="Code" />
                    </Field>
                    <Field title="Points:" name="points" errorResponse={error}>
                        <NumberInput value={newPoints} onValueChange={setNewPoints} placeholder="Code" />
                    </Field>
                    <Field>
                        <Checkbox value={ruLocale} onValueChange={setRuLocale} />
                        <span className="label">Russian</span>
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
    const [error, setError] = useState<ErrorResponse>();
    const [problems, setProblems] = useState<ContestProblems>();
    const [form, setForm] = useState<{ [key: string]: string }>({});
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
        createContestProblem(contest.id, {
            code: form.code ?? "",
            problem_id: Number(form.problem_id ?? 0),
            points: form.points ? Number(form.points) : undefined,
        })
            .then(problem => {
                setProblems({ ...problems, problems: [...(problems?.problems ?? []), problem] });
                setForm({});
                setError(undefined);
            })
            .catch(setError);
    };
    const canCreateProblem = contest.permissions?.includes("create_contest_problem");
    const canUpdateProblem = contest.permissions?.includes("update_contest_problem");
    const canDeleteProblem = contest.permissions?.includes("delete_contest_problem");
    if (!problems) {
        return <Block title="Problems" className="b-contest-problems">
            {error ? <Alert>{error.message}</Alert> : "Loading..."}
        </Block>;
    }
    let contestProblems: ContestProblem[] = problems.problems ?? [];
    contestProblems.sort((a, b: ContestProblem) => {
        return String(a.code).localeCompare(b.code);
    });
    return <Block
        title="Problems"
        className="b-contest-problems"
        footer={canCreateProblem && <form onSubmit={onSubmit}>
            <Input name="code"
                value={form.code || ""}
                onValueChange={value => setForm({ ...form, code: value })}
                placeholder="Code"
                required />
            <Input name="problem_id"
                value={form.problem_id || ""}
                onValueChange={value => setForm({ ...form, problem_id: value })}
                placeholder="Problem ID"
                required />
            <NumberInput name="points"
                value={form.points ? Number(form.points) : undefined}
                onValueChange={value => setForm({ ...form, points: String(value ?? "") })}
                placeholder="Points" />
            <Button type="submit">Create</Button>
        </form>}
    >
        {error && <Alert>{error.message}</Alert>}
        <table className="ui-table">
            <thead>
                <tr>
                    <th className="code">#</th>
                    <th className="title">Title</th>
                    <th className="actions">Actions</th>
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
                                setForm({});
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
