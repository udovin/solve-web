import { FC } from "react";
import NumberInput from "../NumberInput";

import "./index.scss";

export type DurationInputProps = {
    disabled?: boolean;
    value?: number;
    onValueChange?(value?: number): void;
};

const replace = (value: number, shift: number, max: number, newValue: number) => {
    const suffix = value % shift;
    const prefix = (value - suffix) / shift;
    return (prefix - (prefix % max) + newValue % max) * shift + suffix;
};

const DurationInput: FC<DurationInputProps> = props => {
    const { value, onValueChange } = props;
    return <span className="ui-duration-input">
        <input type="number" value={String(value || 0)} onChange={() => { }} className="hidden" />
        <NumberInput
            className="days"
            value={Math.trunc((value || 0) / 86400)}
            onValueChange={newValue => onValueChange && onValueChange(replace(value || 0, 86400, 366, Number(newValue)))}
        />
        <NumberInput
            className="hours"
            value={Math.trunc((value || 0) / 3600) % 24}
            onValueChange={newValue => onValueChange && onValueChange(replace(value || 0, 3600, 24, Number(newValue)))}
        />
        <NumberInput
            className="minutes"
            value={Math.trunc((value || 0) / 60) % 60}
            onValueChange={newValue => onValueChange && onValueChange(replace(value || 0, 60, 60, Number(newValue)))}
        />
        <NumberInput
            className="seconds"
            value={(value || 0) % 60}
            onValueChange={newValue => onValueChange && onValueChange(replace(value || 0, 1, 60, Number(newValue)))}
        />
    </span>
};

export default DurationInput;
