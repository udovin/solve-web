import { FC, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Contest, ContestMessage, ContestMessages, ErrorResponse, observeContestMessages, submitContestQuestion } from "../../api";
import FormBlock from "../../components/FormBlock";
import Alert from "../../ui/Alert";
import Block from "../../ui/Block";
import Button from "../../ui/Button";
import Field from "../../ui/Field";
import Input from "../../ui/Input";
import Textarea from "../../ui/Textarea";

type ContestMessagesBlockProps = {
    contest: Contest;
};

export const ContestMessagesBlock: FC<ContestMessagesBlockProps> = props => {
    const { contest } = props;
    const { id, permissions, state } = contest;
    const canSubmitQuestion = permissions?.includes("submit_contest_question") && state?.participant;
    const [error, setError] = useState<ErrorResponse>();
    const [messages, setMessages] = useState<ContestMessages>();
    useEffect(() => {
        observeContestMessages(contest.id)
            .then(setMessages)
            .catch(setError);
    }, [contest]);
    let byParent: Record<number, ContestMessage[]> = {};
    messages?.messages?.forEach((message: ContestMessage) => {
        if (!byParent[message.parent_id ?? 0]) {
            byParent[message.parent_id ?? 0] = [];
        }
        byParent[message.parent_id ?? 0].push(message);
    });
    const buildMessages = (messages: ContestMessage[]) => {
        return messages && messages.map((message: ContestMessage, index: number) => {
            return <div className="message-wrap" key={index}>
                <div className="message">
                    {message.title && <span className="title">{message.title}</span>}
                    {message.description && <span className="description">{message.description}</span>}
                </div>
                {byParent[message.id] && buildMessages(byParent[message.id])}
            </div>;
        });
    };
    return <Block title="Messages" className="b-contest-messages">
        <div className="controls">
            {canSubmitQuestion && <Link to={`/contests/${id}/question`}>
                <Button>New question</Button>
            </Link>}
        </div>
        {error && error.message && <Alert>{error.message}</Alert>}
        {byParent[0] && buildMessages(byParent[0])}
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
