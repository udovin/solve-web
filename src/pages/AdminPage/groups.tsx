import { FC, FormEvent, useEffect, useState } from "react";
import { useLocale } from "../../ui/Locale";
import { Account, createGroup, createGroupMember, deleteGroup, deleteGroupMember, ErrorResponse, Group, GroupMember, GroupMembers, Groups, observeAccounts, observeGroupMembers, observeGroups } from "../../api";
import Block from "../../ui/Block";
import Alert from "../../ui/Alert";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import { Link } from "react-router-dom";
import Tooltip from "../../ui/Tooltip";
import AccountInput from "../../ui/AccountInput";
import Select from "../../ui/Select";
import { AccountLink } from "../SolutionsPage";

export const AdminGroupsBlock: FC = () => {
    const { localize } = useLocale();
    const [groups, setGroups] = useState<Groups>();
    const [form, setForm] = useState<{ [key: string]: string }>({});
    const [error, setError] = useState<ErrorResponse>();
    useEffect(() => {
        observeGroups()
            .then(groups => {
                setGroups(groups);
                setError(undefined);
            })
            .catch(setError);
    }, []);
    const onCreate = (event: FormEvent) => {
        event.preventDefault();
        createGroup({
            title: form.title,
        })
            .then(group => {
                setGroups({ ...groups, groups: [...(groups?.groups ?? []), group] });
                setForm({});
                setError(undefined);
            })
            .catch(setError);
    };
    return <Block title={localize("Groups")} className="b-admin-groups">
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
                {groups?.groups && groups.groups.map((group: Group, key: number) => {
                    const onDelete = () => {
                        deleteGroup(group.id)
                            .then(group => {
                                const newGroups = [...(groups?.groups ?? [])];
                                const pos = newGroups.findIndex(value => value.id === group.id);
                                if (pos >= 0) {
                                    newGroups.splice(pos, 1);
                                }
                                setGroups({ ...groups, groups: newGroups });
                                setError(undefined);
                            })
                            .catch(setError);
                    };
                    return <tr key={key}>
                        <td className="id">{group.id}</td>
                        <td className="title"><Link to={`/admin/groups/${group.id}`}>{group.title}</Link></td>
                        <td className="actions">{<IconButton kind="delete" onClick={onDelete} />}</td>
                    </tr>
                })}
            </tbody>
        </table>
    </Block>;
};

type AdminGroupBlockProps = {
    group: Group;
};

const KINDS: Record<string, string | undefined> = {
    "regular": "Member",
    "manager": "Manager",
};

export const AdminGroupBlock: FC<AdminGroupBlockProps> = props => {
    const { group } = props;
    const { localize, localizeKey } = useLocale();
    const [members, setMembers] = useState<GroupMembers>();
    const [account, setAccount] = useState<Account>();
    const [kind, setKind] = useState<string>("regular");
    const [error, setError] = useState<ErrorResponse>();
    useEffect(() => {
        observeGroupMembers(group.id)
            .then(members => {
                setMembers(members);
                setError(undefined);
            })
            .catch(setError);
    }, [group.id]);
    const onCreate = (event: FormEvent) => {
        event.preventDefault();
        if (!account) {
            return;
        }
        createGroupMember(group.id, {
            account_id: account.id,
            kind: kind,
        })
            .then(member => {
                setMembers({ ...members, members: [...(members?.members ?? []), member] });
                setAccount(undefined);
                setKind("regular");
                setError(undefined);
            })
            .catch(setError);
    };
    const fetchAccounts = (kind?: string, query?: string) => {
        return observeAccounts({ kind, query }).then(accounts => {
            return accounts?.accounts?.map(account => {
                return {
                    id: account.id,
                    kind: account.kind,
                    title: account.user?.login ?? account.scope_user?.title ?? account.scope?.title ?? account.group?.title,
                };
            }) ?? [];
        });
    };
    return <Block title={localize("Group members") + ": " + group.title} className="b-admin-group-members">
        {error && <Alert>{error.message}</Alert>}
        <form onSubmit={onCreate}>
            <AccountInput
                placeholder={localize("Participant")}
                account={account}
                onAccountChange={setAccount}
                kinds={["user"]}
                fetchAccounts={fetchAccounts} />
            <Select
                name="kind"
                value={kind}
                options={Object.fromEntries(Object.entries(KINDS).map(([key, value]) => [key, localizeKey(`member_${key}`, value ?? key)]))}
                onValueChange={setKind}
            />
            <Button type="submit">{localize("Add")}</Button>
        </form>
        <table className="ui-table">
            <thead>
                <tr>
                    <th className="id">#</th>
                    <th className="login">{localize("Member")}</th>
                    <th className="kind">{localize("Kind")}</th>
                    <th className="actions">{localize("Actions")}</th>
                </tr>
            </thead>
            <tbody>
                {members?.members && members.members.map((member: GroupMember, key: number) => {
                    const onDelete = () => {
                        deleteGroupMember(group.id, member.id)
                            .then(member => {
                                const newMembers = [...(members?.members ?? [])];
                                const pos = newMembers.findIndex(value => value.id === member.id);
                                if (pos >= 0) {
                                    newMembers.splice(pos, 1);
                                }
                                setMembers({ ...members, members: newMembers });
                                setError(undefined);
                            })
                            .catch(setError);
                    };
                    return <tr key={key}>
                        <td className="id">{member.id}</td>
                        <td className="login"><AccountLink account={{ user: member.account?.user }} /></td>
                        <td className="kind">{localizeKey(`member_${kind}`, KINDS[kind] ?? kind)}</td>
                        <td className="actions">
                            <Tooltip content="Delete"><IconButton kind="delete" onClick={onDelete} /></Tooltip>
                        </td>
                    </tr>
                })}
            </tbody>
        </table>
    </Block>;
};
