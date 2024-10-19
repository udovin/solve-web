import { FC, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Contest, ContestMessage, ContestMessages, createContestMessage, ErrorResponse, observeContestMessages, submitContestQuestion } from "../../api";
import FormBlock from "../../components/FormBlock";
import Alert from "../../ui/Alert";
import Block from "../../ui/Block";
import Button from "../../ui/Button";
import Field from "../../ui/Field";
import Input from "../../ui/Input";
import Textarea from "../../ui/Textarea";
import { ParticipantLink } from "./participants";
import { useLocale } from "../../ui/Locale";
import Latex from "../../ui/Latex";

type MessageItemProps = {
    contest: Contest;
    message: ContestMessage;
    subMessages?: ContestMessage[];
    canCreateMessage?: boolean;
    onNewMessage?(message: ContestMessage): void;
};

const MessageItem: FC<MessageItemProps> = props => {
    const { contest, message, subMessages, canCreateMessage, onNewMessage } = props;
    const { localize } = useLocale();
    const [show, setShow] = useState(false);
    const [error, setError] = useState<ErrorResponse>();
    const [description, setDescription] = useState<string>();
    const onSubmit = () => {
        if (!description) {
            return;
        }
        createContestMessage(contest.id, {
            description: description,
            parent_id: message.id,
        })
            .then(message => {
                setError(undefined);
                setDescription(undefined);
                setShow(false);
                onNewMessage && onNewMessage(message);
            })
            .catch(setError);
    };
    const canAnswer = canCreateMessage && !subMessages && message.kind === "question";
    return <div className="message-wrap">
        <div className="message">
            {message.title && <span className="title">{message.title}</span>}
            {message.description && <span className="description"><Latex content={message.description} /></span>}
            {message.participant && <span className="participant"><ParticipantLink participant={message.participant} /></span>}
            {canAnswer && <span className="answer"><Button onClick={() => setShow(!show)}>{localize("Answer")}</Button></span>}
        </div>
        {show && <div className="new-message">
            {error && error.message && <Alert>{error.message}</Alert>}
            <Field title={localize("Description") + ":"} name="description" errorResponse={error}>
                <Textarea
                    name="description" placeholder={localize("Description")}
                    value={description}
                    onValueChange={setDescription}
                    required />
            </Field>
            <Button onClick={onSubmit} disabled={!description}>{localize("Submit")}</Button>
        </div>}
        {subMessages && <div className="children">{subMessages.map((message: ContestMessage, index: number) => {
            return <div className="message-wrap">
                <div className="message" key={index}>
                    {message.title && <span className="title">{message.title}</span>}
                    {message.description && <span className="description"><Latex content={message.description} /></span>}
                </div>
            </div>;
        })}</div>}
    </div>;
};

type ContestMessagesBlockProps = {
    contest: Contest;
};

const toNumber = (n?: string | null) => {
    return (n === undefined || n === null) ? undefined : Number(n);
};

export const ContestMessagesBlock: FC<ContestMessagesBlockProps> = props => {
    const { contest } = props;
    const { id, permissions, state } = contest;
    const { localize } = useLocale();
    const canSubmitQuestion = permissions?.includes("submit_contest_question") && state?.participant;
    const canCreateMessage = permissions?.includes("create_contest_message");
    const [error, setError] = useState<ErrorResponse>();
    const [messages, setMessages] = useState<ContestMessages>();
    useEffect(() => {
        observeContestMessages(contest.id)
            .then(setMessages)
            .catch(setError);
    }, [contest]);
    const onNewMessage = (message: ContestMessage) => {
        setMessages({ ...messages, messages: [message, ...(messages?.messages ?? [])] });
    };
    let byParent: Record<number, ContestMessage[]> = {};
    let maxSeenMessage: number = toNumber(localStorage.getItem("contest_seen_message")) ?? 0;
    messages?.messages?.forEach((message: ContestMessage) => {
        if (!byParent[message.parent_id ?? 0]) {
            byParent[message.parent_id ?? 0] = [];
        }
        byParent[message.parent_id ?? 0].push(message);
        maxSeenMessage = Math.max(maxSeenMessage, message.id);
    });
    localStorage.setItem("contest_seen_message", String(maxSeenMessage));
    return <Block title={localize("Messages")} className="b-contest-messages">
        <div className="controls">
            {canSubmitQuestion && <Link to={`/contests/${id}/question`}>
                <Button>{localize("New question")}</Button>
            </Link>}
            {canCreateMessage && <Link to={`/contests/${id}/messages/create`}>
                <Button>{localize("New message")}</Button>
            </Link>}
        </div>
        {error && error.message && <Alert>{error.message}</Alert>}
        {byParent[0] && byParent[0].map((message: ContestMessage, index: number) => {
            return <MessageItem
                contest={contest}
                message={message}
                subMessages={byParent[message.id]}
                canCreateMessage={canCreateMessage}
                onNewMessage={onNewMessage}
                key={index} />
        })}
    </Block>;
};

export const SubmitContestQuestionBlock: FC<ContestMessagesBlockProps> = props => {
    const { contest } = props;
    const { localize } = useLocale();
    const [error, setError] = useState<ErrorResponse>();
    const [title, setTitle] = useState<string>();
    const [description, setDescription] = useState<string>();
    const [newMessage, setNewMessage] = useState<ContestMessage>();
    const onSubmit = (event: any) => {
        event.preventDefault();
        if (!title || !description) {
            return;
        }
        submitContestQuestion(contest.id, {
            title: title,
            description: description
        })
            .then(message => {
                setError(undefined);
                setNewMessage(message);
            })
            .catch(setError);
    };
    if (newMessage) {
        return <Navigate to={`/contests/${contest.id}/messages`} />;
    }
    return <FormBlock className="b-contest-question" title={localize("New question")} onSubmit={onSubmit} footer={<>
        <Button
            type="submit" color="primary" disabled={!title || !description}
        >{localize("Submit")}</Button>
    </>}>
        {error && error.message && <Alert>{error.message}</Alert>}
        <Field title={localize("Subject") + ":"} name="title" errorResponse={error}>
            <Input
                type="text" name="title" placeholder={localize("Subject")}
                value={title}
                onValueChange={setTitle}
                required />
        </Field>
        <Field title={localize("Question") + ":"} name="description" errorResponse={error}>
            <Textarea
                name="description" placeholder={localize("Question")}
                value={description}
                onValueChange={setDescription}
                required />
        </Field>
    </FormBlock>;
};

export const CreateContestMessageBlock: FC<ContestMessagesBlockProps> = props => {
    const { contest } = props;
    const { localize } = useLocale();
    const [error, setError] = useState<ErrorResponse>();
    const [title, setTitle] = useState<string>();
    const [description, setDescription] = useState<string>();
    const [newMessage, setNewMessage] = useState<ContestMessage>();
    const onSubmit = (event: any) => {
        event.preventDefault();
        if (!title || !description) {
            return;
        }
        createContestMessage(contest.id, {
            title: title,
            description: description
        })
            .then(message => {
                setError(undefined);
                setNewMessage(message);
            })
            .catch(setError);
    };
    if (newMessage) {
        return <Navigate to={`/contests/${contest.id}/messages`} />;
    }
    return <FormBlock className="b-contest-message" title={localize("New message")} onSubmit={onSubmit} footer={<>
        <Button
            type="submit" color="primary" disabled={!title || !description}
        >{localize("Submit")}</Button>
    </>}>
        {error && error.message && <Alert>{error.message}</Alert>}
        <Field title={localize("Title") + ":"} name="title" errorResponse={error}>
            <Input
                type="text" name="title" placeholder={localize("Title")}
                value={title}
                onValueChange={setTitle}
                required />
        </Field>
        <Field title={localize("Description") + ":"} name="description" errorResponse={error}>
            <Textarea
                name="description" placeholder={localize("Description")}
                value={description}
                onValueChange={setDescription}
                required />
        </Field>
    </FormBlock>;
};
