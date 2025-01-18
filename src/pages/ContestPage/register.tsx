import { FC, useState } from "react";
import { Contest, ErrorResponse, registerContest } from "../../api";
import FormBlock from "../../components/FormBlock";
import Alert from "../../ui/Alert";
import Button from "../../ui/Button";
import Field from "../../ui/Field";
import { useLocale } from "../../ui/Locale";
import DateTimeInput from "../../ui/DateTimeInput";
import Select from "../../ui/Select";

type ContestRegisterBlockProps = {
    contest: Contest;
};

export const ContestRegisterBlock: FC<ContestRegisterBlockProps> = props => {
    const { contest } = props;
    const { title } = contest;
    const { localize, localizeKey } = useLocale();
    const [error, setError] = useState<ErrorResponse>();
    const canVirtual = contest.permissions?.includes("register_contest_virtual") ?? false;
    const [kind, setKind] = useState<string>(canVirtual ? "virtual" : "regular");
    const [beginTime, setBeginTime] = useState<number>();
    const onSubmit = (event: any) => {
        event.preventDefault();
        registerContest(contest.id, { kind: kind, begin_time: beginTime })
            .catch(setError);
    };
    const kinds: Record<string, string> = {};
    if (contest.permissions?.includes("register_contest")) {
        kinds["regular"] = "Participant";
    }
    if (canVirtual) {
        kinds["virtual"] = "Virtual";
    }
    return <FormBlock
        className="b-contest-register"
        title={`Register contest: ${title}`}
        onSubmit={onSubmit}
        footer={<>
            <Button type="submit" color="primary">Register</Button>
        </>}
    >
        {error && error.message && <Alert>{error.message}</Alert>}
        <Select
            name="kind"
            value={kind}
            options={Object.fromEntries(Object.entries(kinds).map(([key, value]) => [key, localizeKey(`participant_${key}`, value ?? key)]))}
            onValueChange={setKind}
        />
        {kind === "virtual" &&
            <Field name="begin_time" title={localize("Begin time") + ":"} errorResponse={error}>
                <DateTimeInput
                    value={beginTime}
                    onValueChange={setBeginTime} />
            </Field>}
    </FormBlock>;
};
