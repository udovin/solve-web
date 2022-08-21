import { FC } from "react";
import Input from "../Input";
import "./index.scss";

export type DurationInputProps = {
    value?: number;
    onValueChange?(value: number): void;
    disabled?: boolean;
};

const replace = (value: number, shift: number, max: number, newValue: number) => {
    const suffix = value % shift;
    const prefix = (value - suffix) / shift;
    return (prefix - (prefix % max) + newValue % max) * shift + suffix;
};

const DurationInput: FC<DurationInputProps> = props => {
    const { value, onValueChange } = props;
    return <span className="ui-duration-input">
        <input type="number" value={String(value || 0)} className="hidden" />
        <Input
            className="days"
            value={String(Math.trunc((value || 0) / 86400))}
            onValueChange={(newValue) => onValueChange && onValueChange(replace(value || 0, 86400, 366, Number(newValue)))}
        />
        <Input
            className="hours"
            value={String(Math.trunc((value || 0) / 3600) % 24)}
            onValueChange={(newValue) => onValueChange && onValueChange(replace(value || 0, 3600, 24, Number(newValue)))}
        />
        <Input
            className="minutes"
            value={String(Math.trunc((value || 0) / 60) % 60)}
            onValueChange={(newValue) => onValueChange && onValueChange(replace(value || 0, 60, 60, Number(newValue)))}
        />
        <Input
            className="seconds"
            value={String((value || 0) % 60)}
            onValueChange={(newValue) => onValueChange && onValueChange(replace(value || 0, 1, 60, Number(newValue)))}
        />
    </span>
};

export default DurationInput;
