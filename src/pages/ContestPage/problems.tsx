import { FC, FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Contest, ContestProblem, ContestProblems, createContestProblem, deleteContestProblem, ErrorResponse, observeContestProblems } from "../../api";
import Alert from "../../ui/Alert";
import Block from "../../ui/Block";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import Input from "../../ui/Input";

type ContestProblemsBlockParams = {
    contest: Contest;
};

export const ContestProblemsBlock: FC<ContestProblemsBlockParams> = props => {
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
        })
            .then(problem => {
                setProblems({ ...problems, problems: [...(problems?.problems ?? []), problem] });
                setForm({});
                setError(undefined);
            })
            .catch(setError);
    };
    const canCreateProblem = contest.permissions?.includes("create_contest_problem");
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
                    const { code, title, statement } = problem;
                    const deleteProblem = () => {
                        deleteContestProblem(contest.id, code)
                            .then(problem => {
                                const contestProblems = [...(problems?.problems ?? [])];
                                const pos = contestProblems.findIndex(value => value.code === problem.code && value.title === problem.title);
                                if (pos >= 0) {
                                    contestProblems.splice(pos, 1);
                                }
                                setProblems({ ...problems, problems: contestProblems });
                                setForm({});
                                setError(undefined);
                            })
                            .catch(setError);
                    };
                    return <tr key={key} className="problem">
                        <td className="code">
                            <Link to={`/contests/${contest.id}/problems/${code}`}>{code}</Link>
                        </td>
                        <td className="title">
                            <Link to={`/contests/${contest.id}/problems/${code}`}>{statement?.title ?? title}</Link>
                        </td>
                        <td className="actions">{canDeleteProblem && <IconButton kind="delete" onClick={deleteProblem} />}</td>
                    </tr>;
                })}
            </tbody>
        </table>
    </Block>;
};
