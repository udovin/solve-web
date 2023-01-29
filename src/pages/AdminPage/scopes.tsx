import { FC, FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createScope, createScopeUser, deleteScope, deleteScopeUser, ErrorResponse, observeScopes, observeScopeUser, observeScopeUsers, Scope, Scopes, ScopeUser, ScopeUsers } from "../../api";
import Alert from "../../ui/Alert";
import Block from "../../ui/Block";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import Input from "../../ui/Input";

export const AdminScopesBlock: FC = () => {
    const [scopes, setScopes] = useState<Scopes>();
    const [form, setForm] = useState<{ [key: string]: string }>({});
    const [error, setError] = useState<ErrorResponse>();
    useEffect(() => {
        observeScopes()
            .then(scopes => {
                setScopes(scopes);
                setError(undefined);
            })
            .catch(setError);
    }, []);
    const onCreate = (event: FormEvent) => {
        event.preventDefault();
        createScope({
            title: form.title,
        })
            .then(scope => {
                setScopes({ ...scopes, scopes: [...(scopes?.scopes ?? []), scope] });
                setForm({});
                setError(undefined);
            })
            .catch(setError);
    };
    return <Block title="Scopes" className="b-admin-scopes">
        {error && <Alert>{error.message}</Alert>}
        <form onSubmit={onCreate}>
            <Input name="title"
                value={form.title || ""}
                onValueChange={value => setForm({ ...form, title: value })}
                placeholder="Title"
                required />
            <Button type="submit">Add</Button>
        </form>
        <table className="ui-table">
            <thead>
                <tr>
                    <th className="id">#</th>
                    <th className="title">Title</th>
                    <th className="actions">Actions</th>
                </tr>
            </thead>
            <tbody>
                {scopes?.scopes && scopes.scopes.map((scope: Scope, key: number) => {
                    const onDelete = () => {
                        deleteScope(scope.id)
                            .then(scope => {
                                const newScopes = [...(scopes?.scopes ?? [])];
                                const pos = newScopes.findIndex(value => value.id === scope.id);
                                if (pos >= 0) {
                                    newScopes.splice(pos, 1);
                                }
                                setScopes({ ...scopes, scopes: newScopes });
                                setError(undefined);
                            })
                            .catch(setError);
                    };
                    return <tr key={key}>
                        <td className="id">{scope.id}</td>
                        <td className="title"><Link to={`/admin/scopes/${scope.id}`}>{scope.title}</Link></td>
                        <td className="actions">{<IconButton kind="delete" onClick={onDelete} />}</td>
                    </tr>
                })}
            </tbody>
        </table>
    </Block>;
};

type AdminScopeBlockProps = {
    scope: Scope;
};

export const AdminScopeBlock: FC<AdminScopeBlockProps> = props => {
    const { scope } = props;
    const [users, setUsers] = useState<ScopeUsers>();
    const [form, setForm] = useState<{ [key: string]: string }>({});
    const [error, setError] = useState<ErrorResponse>();
    useEffect(() => {
        observeScopeUsers(scope.id)
            .then(users => {
                setUsers(users);
                setError(undefined);
            })
            .catch(setError);
    }, [scope.id]);
    const onCreate = (event: FormEvent) => {
        event.preventDefault();
        createScopeUser(scope.id, {
            login: form.login,
            title: form.title,
        })
            .then(user => {
                setUsers({ ...users, users: [...(users?.users ?? []), user] });
                setForm({});
                setError(undefined);
            })
            .catch(setError);
    };
    return <Block title={`Scope users: ${scope.title}`} className="b-admin-scope-users">
        {error && <Alert>{error.message}</Alert>}
        <form onSubmit={onCreate}>
            <Input name="login"
                value={form.login || ""}
                onValueChange={value => setForm({ ...form, login: value })}
                placeholder="Login"
                required />
            <Input name="title"
                value={form.title || ""}
                onValueChange={value => setForm({ ...form, title: value })}
                placeholder="Title" />
            <Button type="submit">Add</Button>
        </form>
        <table className="ui-table">
            <thead>
                <tr>
                    <th className="id">#</th>
                    <th className="login">Login</th>
                    <th className="password">Password</th>
                    <th className="title">Title</th>
                    <th className="actions">Actions</th>
                </tr>
            </thead>
            <tbody>
                {users?.users && users.users.map((user: ScopeUser, key: number) => {
                    const onDelete = () => {
                        deleteScopeUser(scope.id, user.id)
                            .then(user => {
                                const newUsers = [...(users?.users ?? [])];
                                const pos = newUsers.findIndex(value => value.id === user.id);
                                if (pos >= 0) {
                                    newUsers.splice(pos, 1);
                                }
                                setUsers({ ...users, users: newUsers });
                                setError(undefined);
                            })
                            .catch(setError);
                    };
                    const onShowPassword = () => {
                        observeScopeUser(scope.id, user.id, true)
                            .then(user => {
                                const newUsers = [...(users?.users ?? [])];
                                const pos = newUsers.findIndex(value => value.id === user.id);
                                if (pos >= 0) {
                                    newUsers[pos] = user;
                                }
                                setUsers({ ...users, users: newUsers });
                                setError(undefined);
                            })
                            .catch(setError);
                    };
                    return <tr key={key}>
                        <td className="id">{user.id}</td>
                        <td className="login">{user.login}</td>
                        <td className="password">{user.password ? user.password : <Button onClick={onShowPassword}>Show password</Button>}</td>
                        <td className="title">{user.title}</td>
                        <td className="actions">{<IconButton kind="delete" onClick={onDelete} />}</td>
                    </tr>
                })}
            </tbody>
        </table>
    </Block >;
};
