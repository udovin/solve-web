import { FC, FormEvent, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createScope, createScopeUser, deleteScope, deleteScopeUser, ErrorResponse, logoutScopeUser, observeScopes, observeScopeUsers, Scope, Scopes, ScopeUser, ScopeUsers, updateScopeUser } from "../../api";
import Alert from "../../ui/Alert";
import Block from "../../ui/Block";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import Input from "../../ui/Input";
import Tooltip from "../../ui/Tooltip";
import { LocaleContext } from "../../ui/Locale";

export const AdminScopesBlock: FC = () => {
    const { localize } = useContext(LocaleContext);
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
    return <Block title={localize("Scopes")} className="b-admin-scopes">
        {error && <Alert>{error.message}</Alert>}
        <form onSubmit={onCreate}>
            <Input name="title"
                value={form.title || ""}
                onValueChange={value => setForm({ ...form, title: value })}
                placeholder={localize("Title")}
                required />
            <Button type="submit">{localize("Add")}</Button>
        </form>
        <table className="ui-table">
            <thead>
                <tr>
                    <th className="id">#</th>
                    <th className="title">{localize("Title")}</th>
                    <th className="actions">{localize("Actions")}</th>
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
    const { localize } = useContext(LocaleContext);
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
    return <Block title={localize("Scope users") + ": " + scope.title} className="b-admin-scope-users">
        {error && <Alert>{error.message}</Alert>}
        <form onSubmit={onCreate}>
            <Input name="login"
                value={form.login || ""}
                onValueChange={value => setForm({ ...form, login: value })}
                placeholder={localize("Username")}
                required />
            <Input name="title"
                value={form.title || ""}
                onValueChange={value => setForm({ ...form, title: value })}
                placeholder={localize("Title")} />
            <Button type="submit">{localize("Add")}</Button>
        </form>
        <table className="ui-table">
            <thead>
                <tr>
                    <th className="id">#</th>
                    <th className="login">{localize("Username")}</th>
                    <th className="password">{localize("Password")}</th>
                    <th className="title">{localize("Title")}</th>
                    <th className="actions">{localize("Actions")}</th>
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
                    const onLogout = () => {
                        logoutScopeUser(scope.id, user.id)
                            .then(() => setError(undefined))
                            .catch(setError);
                    };
                    const onRegeneratePassword = () => {
                        updateScopeUser(scope.id, user.id, { generate_password: true })
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
                        <td className="password">{user.password ? user.password : <Button onClick={onRegeneratePassword} color="danger">{localize("Regenerate password")}</Button>}</td>
                        <td className="title">{user.title}</td>
                        <td className="actions">
                            <Tooltip content="Logout"><IconButton kind="backward" onClick={onLogout} /></Tooltip>
                            <Tooltip content="Delete"><IconButton kind="delete" onClick={onDelete} /></Tooltip>
                        </td>
                    </tr>
                })}
            </tbody>
        </table>
    </Block >;
};
