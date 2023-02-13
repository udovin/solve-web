import { FC, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Contest, ContestMessage, ErrorResponse, submitContestQuestion } from "../../api";
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
    const { id, permissions } = contest;
    const canSubmitQuestion = permissions?.includes("submit_contest_question");
    return <Block title="Messages" className="b-contest-messages">
        {canSubmitQuestion && <Link to={`/contests/${id}/question`}>
            <Button>New question</Button>
        </Link>}
    </Block >;
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
    return <FormBlock className="b-contest-question" title="Ask question" onSubmit={onSubmit} footer={<>
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
