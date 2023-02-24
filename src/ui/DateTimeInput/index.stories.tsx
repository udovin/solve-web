import { FC, useState } from "react";
import DateTimeInput, { DateTimeInputProps } from ".";

export default {
	title: "DateTime input",
};

const TestDateTimeInput: FC<DateTimeInputProps> = props => {
	const { value, ...rest } = props;
	const [newValue, setNewValue] = useState<number | undefined>(value);
	return <DateTimeInput value={newValue} onValueChange={setNewValue} {...rest} />
};

export const Index = () => <>
	<TestDateTimeInput value={(new Date()).getTime() / 1000} />
</>;
