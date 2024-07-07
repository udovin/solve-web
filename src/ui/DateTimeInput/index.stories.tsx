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
	<p><TestDateTimeInput value={(new Date(1577970855000)).getTime() / 1000} /></p>
	<p><TestDateTimeInput value={(new Date()).getTime() / 1000} /></p>
	<p><TestDateTimeInput value={(new Date(1577970855000)).getTime() / 1000} disabled /></p>
</>;
