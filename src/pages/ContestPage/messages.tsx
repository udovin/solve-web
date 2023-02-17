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

type MessageItemProps = {
    contest: Contest;
    message: ContestMessage;
    subMessages?: ContestMessage[];
    canCreateMessage?: boolean;
    onNewMessage?(message: ContestMessage): void;
};

const MessageItem: FC<MessageItemProps> = props => {
    const { contest, message, subMessages, canCreateMessage, onNewMessage } = props;
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
            {message.description && <span className="description">{message.description}</span>}
            {message.participant && <span className="participant"><ParticipantLink participant={message.participant} /></span>}
            {canAnswer && <span className="answer"><Button onClick={() => setShow(!show)}>Answer</Button></span>}
        </div>
        {show && <div className="new-message">
            {error && error.message && <Alert>{error.message}</Alert>}
            <Field title="Description:" name="description" errorResponse={error}>
                <Textarea
                    name="description" placeholder="Description"
                    value={description}
                    onValueChange={setDescription}
                    required />
            </Field>
            <Button onClick={onSubmit} disabled={!description}>Submit</Button>
        </div>}
        {subMessages && <div className="children">{subMessages.map((message: ContestMessage, index: number) => {
            return <div className="message-wrap">
                <div className="message" key={index}>
                    {message.title && <span className="title">{message.title}</span>}
                    {message.description && <span className="description">{message.description}</span>}
                </div>
            </div>;
        })}</div>}
    </div>;
};

type ContestMessagesBlockProps = {
    contest: Contest;
};

export const ContestMessagesBlock: FC<ContestMessagesBlockProps> = props => {
    const { contest } = props;
    const { id, permissions, state } = contest;
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
    messages?.messages?.forEach((message: ContestMessage) => {
        if (!byParent[message.parent_id ?? 0]) {
            byParent[message.parent_id ?? 0] = [];
        }
        byParent[message.parent_id ?? 0].push(message);
    });
    return <Block title="Messages" className="b-contest-messages">
        <div className="controls">
            {canSubmitQuestion && <Link to={`/contests/${id}/question`}>
                <Button>New question</Button>
            </Link>}
            {canCreateMessage && <Link to={`/contests/${id}/messages/create`}>
                <Button>New message</Button>
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
    return <FormBlock className="b-contest-question" title="New question" onSubmit={onSubmit} footer={<>
        <Button
            type="submit" color="primary" disabled={!title || !description}
        >Submit</Button>
    </>}>
        {error && error.message && <Alert>{error.message}</Alert>}
        <Field title="Title:" name="title" errorResponse={error}>
            <Input
                type="text" name="title" placeholder="Title"
                value={title}
                onValueChange={setTitle}
                required />
        </Field>
        <Field title="Description:" name="description" errorResponse={error}>
            <Textarea
                name="description" placeholder="Description"
                value={description}
                onValueChange={setDescription}
                required />
        </Field>
    </FormBlock>;
};

export const CreateContestMessageBlock: FC<ContestMessagesBlockProps> = props => {
    const { contest } = props;
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
    return <FormBlock className="b-contest-message" title="New message" onSubmit={onSubmit} footer={<>
        <Button
            type="submit" color="primary" disabled={!title || !description}
        >Submit</Button>
    </>}>
        {error && error.message && <Alert>{error.message}</Alert>}
        <Field title="Title:" name="title" errorResponse={error}>
            <Input
                type="text" name="title" placeholder="Title"
                value={title}
                onValueChange={setTitle}
                required />
        </Field>
        <Field title="Description:" name="description" errorResponse={error}>
            <Textarea
                name="description" placeholder="Description"
                value={description}
                onValueChange={setDescription}
                required />
        </Field>
    </FormBlock>;
};
