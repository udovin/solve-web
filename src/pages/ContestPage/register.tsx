import { FC, useState } from "react";
import { Contest, ErrorResponse, registerContest } from "../../api";
import FormBlock from "../../components/FormBlock";
import Alert from "../../ui/Alert";
import Button from "../../ui/Button";

type ContestRegisterBlockProps = {
    contest: Contest;
};

export const ContestRegisterBlock: FC<ContestRegisterBlockProps> = props => {
    const { contest } = props;
    const { title } = contest;
    const [error, setError] = useState<ErrorResponse>();
    const onSubmit = (event: any) => {
        event.preventDefault();
        registerContest(contest.id)
            .catch(setError);
    };
    return <FormBlock
        className="b-contest-register"
        title={`Register contest: ${title}`}
        onSubmit={onSubmit}
        footer={<>
            <Button type="submit" color="primary">Register</Button>
        </>}
    >
        {error && error.message && <Alert>{error.message}</Alert>}
    </FormBlock>;
};
