import { FC, useEffect, useState } from "react";
import { ErrorResponse, observeRoleRoles, observeRoles, Role, RoleRoles, Roles } from "../../api";
import Alert from "../../ui/Alert";
import Block from "../../ui/Block";
import Button from "../../ui/Button";

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
                return <li key={key}>
                    <RoleItem role={role} focused={role.id === focused} onFocused={onFocused} />
                </li>
            })}
        </ul>
    </Block>;
};

type RoleItemProps = {
    role: Role;
    focused: boolean;
    onFocused?(): void;
};

const RoleItem: FC<RoleItemProps> = props => {
    const { role, focused, onFocused } = props;
    const [roles, setRoles] = useState<RoleRoles>();
    useEffect(() => {
        if (!focused) {
            return;
        }
        observeRoleRoles(role.id)
            .then(setRoles);
    }, [focused, onFocused]);
    return <>
        <Button onClick={onFocused}>{role.name}</Button>
        {focused && <ul>
            {roles?.roles && roles.roles.map((child: Role, key: number) => {
                return <li key={key}>{child.name}</li>;
            })}
        </ul>}
    </>;
};
