import { FC, FormEvent, useEffect, useState } from "react";
import { Contest, ContestParticipant, ContestParticipants, createContestParticipant, CreateContestParticipantForm, deleteContestParticipant, ErrorResponse, observeContestParticipants } from "../../api";
import Alert from "../../ui/Alert";
import Block from "../../ui/Block";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import Input from "../../ui/Input";
import Select from "../../ui/Select";
import { AccountLink } from "../SolutionsPage";
import { strings } from "../../Locale";

type ParticipantLinkProps = {
    participant: ContestParticipant;
    disabled?: boolean;
};

const getKinds = (): Record<string, string> => {
    return {
        "regular": strings.participantRegular,
        "upsolving": strings.participantUpsolving,
        "manager": strings.participantManager,
        "observer": strings.participantObserver,
    };
};

export const ParticipantLink: FC<ParticipantLinkProps> = props => {
    const { participant, disabled } = props;
    const { kind } = participant;
    return <>
        {(!!participant.kind && participant.kind !== "regular") && <span className="kind">{getKinds()[kind] ?? kind}: </span>}
        <AccountLink account={participant} disabled={disabled} />
    </>
};

type ContestParticipantsBlockProps = {
    contest: Contest;
};

export const ContestParticipantsBlock: FC<ContestParticipantsBlockProps> = props => {
    const { contest } = props;
    const [error, setError] = useState<ErrorResponse>();
    const [participants, setParticipants] = useState<ContestParticipants>();
    const [form, setForm] = useState<{ [key: string]: string }>({});
    useEffect(() => {
        observeContestParticipants(contest.id)
            .then(participants => {
                setParticipants(participants);
                setError(undefined);
            })
            .catch(setError);
    }, [contest.id]);
    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        let createForm: CreateContestParticipantForm = {
            user_id: Number(form.user_id ?? 0),
            user_login: form.user_id,
            kind: form.kind ?? "regular",
        };
        if (form.user_id && form.user_id.length > 0) {
            if (form.user_id[0] === '#') {
                createForm.user_id = undefined;
                createForm.user_login = undefined;
                createForm.scope_user_id = Number((form.user_id ?? 0).substring(1));
            } else if (form.user_id[0] === '@') {
                createForm.user_id = undefined;
                createForm.user_login = undefined;
                createForm.scope_id = Number((form.user_id ?? 0).substring(1));
            }
        }
        createContestParticipant(contest.id, createForm)
            .then(participant => {
                setParticipants({ ...participants, participants: [...(participants?.participants ?? []), participant] });
                setForm({});
                setError(undefined);
            })
            .catch(setError);
    };
    const canCreateParticipant = contest.permissions?.includes("create_contest_participant");
    const canDeleteParticipant = contest.permissions?.includes("delete_contest_participant");
    if (!participants) {
        return <Block title="Participants" className="b-contest-participants">
            {error ? <Alert>{error.message}</Alert> : "Loading..."}
        </Block>;
    }
    let contestParticipants: ContestParticipant[] = participants.participants ?? [];
    contestParticipants.sort((a, b: ContestParticipant) => {
        return (a.id ?? 0) - (b.id ?? 0);
    });
    return <Block
        title="Participants" className="b-contest-participants"
        footer={canCreateParticipant && <form onSubmit={onSubmit}>
            <Input name="user_id"
                value={form.user_id || ""}
                onValueChange={value => setForm({ ...form, user_id: value })}
                placeholder="User ID"
                required />
            <Select
                name="kind"
                value={form.kind || "regular"}
                options={getKinds()}
                onValueChange={value => setForm({ ...form, kind: value })}
            />
            <Button type="submit">Create</Button>
        </form>}
    >
        {error && <Alert>{error.message}</Alert>}
        <table className="ui-table">
            <thead>
                <tr>
                    <th className="id">#</th>
                    <th className="login">Login</th>
                    <th className="kind">Kind</th>
                    <th className="actions">Actions</th>
                </tr>
            </thead>
            <tbody>
                {contestParticipants.map((participant: ContestParticipant, key: number) => {
                    const { id, kind } = participant;
                    if (!id) {
                        return <></>;
                    }
                    const deleteParticipant = () => {
                        deleteContestParticipant(contest.id, id)
                            .then(participant => {
                                const contestParticipants = [...(participants?.participants ?? [])];
                                const pos = contestParticipants.findIndex(value => value.id === participant.id);
                                if (pos >= 0) {
                                    contestParticipants.splice(pos, 1);
                                }
                                setParticipants({ ...participants, participants: contestParticipants });
                                setForm({});
                                setError(undefined);
                            })
                            .catch(setError);
                    };
                    return <tr key={key} className="participant">
                        <td className="id">{id}</td>
                        <td className="login"><AccountLink account={participant} /></td>
                        <td className="kind">{getKinds()[kind] ?? kind}</td>
                        <td className="actions">{canDeleteParticipant && <IconButton kind="delete" onClick={deleteParticipant} />}</td>
                    </tr>;
                })}
            </tbody>
        </table>
    </Block>;
};
