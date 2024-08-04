import { FC, FormEvent, useContext, useEffect, useState } from "react";
import { createRole, createRoleRole, deleteRole, deleteRoleRole, ErrorResponse, observeRoleRoles, observeRoles, Role, RoleRoles, Roles } from "../../api";
import { Collapse, CollapseContent, CollapseHeader } from "../../ui/Collapse";
import Alert from "../../ui/Alert";
import Block from "../../ui/Block";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import Input from "../../ui/Input";
import { LocaleContext } from "../../ui/Locale";

export const AdminRolesBlock = () => {
    const { localize } = useContext(LocaleContext);
    const [roles, setRoles] = useState<Roles>();
    const [form, setForm] = useState<{ [key: string]: string }>({});
    const [error, setError] = useState<ErrorResponse>();
    const [focused, setFocused] = useState<number>();
    useEffect(() => {
        observeRoles()
            .then(roles => {
                setRoles(roles);
                setError(undefined);
            })
            .catch(setError);
    }, []);
    const onCreate = (event: FormEvent) => {
        event.preventDefault();
        createRole({
            name: form.name,
        })
            .then(role => {
                setRoles({ ...roles, roles: [role, ...(roles?.roles ?? [])] });
                setForm({});
                setError(undefined);
            })
            .catch(setError);
    };
    return <Block
        title={localize("Roles")}
        className="b-admin-roles"
    >
        {error && <Alert>{error.message}</Alert>}
        <form onSubmit={onCreate}>
            <Input name="name"
                value={form.name || ""}
                onValueChange={value => setForm({ ...form, name: value })}
                placeholder={localize("Name")}
                required />
            <Button type="submit">{localize("Add")}</Button>
        </form>
        {roles?.roles && roles.roles.map((role: Role, key: number) => {
            const onFocused = () => {
                setFocused(role.id !== focused ? role.id : undefined);
            };
            const onDelete = () => {
                deleteRole(role.id)
                    .then(role => {
                        const newRoles = [...(roles?.roles ?? [])];
                        const pos = newRoles.findIndex(value => value.id === role.id);
                        if (pos >= 0) {
                            newRoles.splice(pos, 1);
                        }
                        setRoles({ ...roles, roles: newRoles });
                        setError(undefined);
                    })
                    .catch(setError);
            };
            return <Collapse expanded={focused === role.id} onChange={onFocused} key={key}>
                <CollapseHeader>
                    {role.name}
                    {!role.built_in && <IconButton kind="delete" onClick={onDelete} />}
                </CollapseHeader>
                <CollapseContent>
                    <RoleItem role={role} />
                </CollapseContent>
            </Collapse>;
        })}
    </Block>;
};

type RoleItemProps = {
    role: Role;
};

const RoleItem: FC<RoleItemProps> = props => {
    const { role } = props;
    const { localize } = useContext(LocaleContext);
    const [roles, setRoles] = useState<RoleRoles>();
    const [error, setError] = useState<ErrorResponse>();
    const [form, setForm] = useState<{ [key: string]: string }>({});
    useEffect(() => {
        observeRoleRoles(role.id)
            .then(roles => {
                setRoles(roles);
                setError(undefined);
            });
    }, [role.id]);
    const onCreate = (event: FormEvent) => {
        event.preventDefault();
        createRoleRole(role.id, form.name)
            .then(role => {
                setRoles({ ...roles, roles: [role, ...(roles?.roles ?? [])] });
                setForm({});
                setError(undefined);
            })
            .catch(setError);
    };
    return <>
        {error && <Alert>{error.message}</Alert>}
        <form onSubmit={onCreate}>
            <Input name="name"
                value={form.name || ""}
                onValueChange={value => setForm({ ...form, name: value })}
                placeholder={localize("Name")}
                required />
            <Button type="submit">{localize("Add")}</Button>
        </form>
        <ul>
            {roles?.roles && roles.roles.map((child: Role, key: number) => {
                const onDelete = () => {
                    deleteRoleRole(role.id, child.id)
                        .then(role => {
                            const newRoles = [...(roles?.roles ?? [])];
                            const pos = newRoles.findIndex(value => value.id === role.id);
                            if (pos >= 0) {
                                newRoles.splice(pos, 1);
                            }
                            setRoles({ ...roles, roles: newRoles });
                            setError(undefined);
                        })
                        .catch(setError);
                };
                return <li key={key}>{child.name}<IconButton kind="delete" onClick={onDelete} /></li>;
            })}
        </ul>
    </>;
};
