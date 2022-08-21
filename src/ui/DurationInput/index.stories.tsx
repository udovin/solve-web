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
	<p><TestInput value={1 * 86400 + 2 * 3600 + 3 * 60 + 4} /></p>
	<p><TestInput value={4 * 86400 + 3 * 3600 + 2 * 60 + 1} disabled /></p>
</>;
