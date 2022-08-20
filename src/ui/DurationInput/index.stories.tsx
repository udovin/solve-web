import { FC, useState } from "react";
import DurationInput, { DurationInputProps } from ".";

export default {
	title: "Duration input",
};

const TestInput: FC<DurationInputProps> = props => {
	const { value, ...rest } = props;
	const [newValue, setNewValue] = useState<number>(value || 0);
	return <DurationInput value={newValue} onValueChange={setNewValue} {...rest} />
};

export const Index = () => <>
	<p><TestInput value={123} /></p>
	<p><TestInput value={456} disabled /></p>
</>;
