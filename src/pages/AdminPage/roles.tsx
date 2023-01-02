import { FC, useEffect, useState } from "react";
import { deleteRole, deleteRoleRole, ErrorResponse, observeRoleRoles, observeRoles, Role, RoleRoles, Roles } from "../../api";
import Alert from "../../ui/Alert";
import Block from "../../ui/Block";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";

export const AdminRolesBlock = () => {
    const [roles, setRoles] = useState<Roles>();
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
    return <Block
        title="Settings"
        className="b-admin-settings"
    >
        {error && <Alert>{error.message}</Alert>}
        <ul>
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
                return <li key={key}>
                    <RoleItem role={role} focused={role.id === focused} onFocused={onFocused} onDelete={onDelete} />
                </li>
            })}
        </ul>
    </Block>;
};

type RoleItemProps = {
    role: Role;
    focused: boolean;
    onFocused?(): void;
    onDelete?(): void;
};

const RoleItem: FC<RoleItemProps> = props => {
    const { role, focused, onFocused, onDelete } = props;
    const [roles, setRoles] = useState<RoleRoles>();
    const [error, setError] = useState<ErrorResponse>();
    useEffect(() => {
        setError(undefined);
        if (!focused) {
            return;
        }
        observeRoleRoles(role.id)
            .then(roles => {
                setRoles(roles);
                setError(undefined);
            })
            .catch(setError);
    }, [focused, onFocused]);
    return <>
        <Button onClick={onFocused}>{role.name}</Button>
        {!role.built_in && <IconButton kind="delete" onClick={onDelete} />}
        {error && <Alert>{error.message}</Alert>}
        {focused && <ul>
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
        </ul>}
    </>;
};
