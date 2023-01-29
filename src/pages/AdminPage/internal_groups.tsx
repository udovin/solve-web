import { FormEvent, useEffect, useState } from "react";
import { createInternalGroup, deleteInternalGroup, ErrorResponse, InternalGroup, InternalGroups, observeInternalGroups } from "../../api";
import Alert from "../../ui/Alert";
import Block from "../../ui/Block";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import Input from "../../ui/Input";

export const AdminInternalGroupsBlock = () => {
    const [groups, setGroups] = useState<InternalGroups>();
    const [form, setForm] = useState<{ [key: string]: string }>({});
    const [error, setError] = useState<ErrorResponse>();
    useEffect(() => {
        observeInternalGroups()
            .then(groups => {
                setGroups(groups);
                setError(undefined);
            })
            .catch(setError);
    }, []);
    const onCreate = (event: FormEvent) => {
        event.preventDefault();
        createInternalGroup({
            title: form.title,
        })
            .then(group => {
                setGroups({ ...groups, groups: [...(groups?.groups ?? []), group] });
                setForm({});
                setError(undefined);
            })
            .catch(setError);
    };
    return <Block title="Internal groups" className="b-admin-internal-groups">
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
                {groups?.groups && groups.groups.map((group: InternalGroup, key: number) => {
                    const onDelete = () => {
                        deleteInternalGroup(group.id)
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
                        <td className="title">{group.title}</td>
                        <td className="actions">{<IconButton kind="delete" onClick={onDelete} />}</td>
                    </tr>
                })}
            </tbody>
        </table>
    </Block>;
};
