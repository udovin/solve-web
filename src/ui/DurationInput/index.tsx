import { FC, useEffect, useState } from "react";
import NumberInput from "../NumberInput";

import "./index.scss";

export type DurationInputProps = {
    disabled?: boolean;
    value?: number;
    onValueChange?(value?: number): void;
};

const DurationInput: FC<DurationInputProps> = props => {
    const { value, onValueChange, disabled } = props;
    const [days, setDays] = useState(value ? Math.trunc(value / 86400) : undefined);
    const [hours, setHours] = useState(value ? Math.trunc(value / 3600) % 24 : undefined);
    const [minutes, setMinutes] = useState(value ? Math.trunc(value / 60) % 60 : undefined);
    const [seconds, setSeconds] = useState(value ? value % 60 : undefined);
    useEffect(() => {
        console.log(value);
        const newDays = value ? Math.trunc(value / 86400) : 0;
        const newHours = value ? Math.trunc(value / 3600) % 24 : 0;
        const newMinutes = value ? Math.trunc(value / 60) % 60 : 0;
        const newSeconds = value ? value % 60 : 0;
        if (newDays !== (days ?? 0)) {
            setDays(newDays);
        }
        if (newHours !== (hours ?? 0)) {
            setHours(newHours);
        }
        if (newMinutes !== (minutes ?? 0)) {
            setMinutes(newMinutes);
        }
        if (newSeconds !== (seconds ?? 0)) {
            setSeconds(newSeconds);
        }
    }, [value, days, setDays, hours, setHours, minutes, setMinutes, seconds, setSeconds]);
    const daysChange = (value?: number) => {
        if (onValueChange) {
            setDays(value);
            onValueChange((((value ?? 0) * 24 + (hours ?? 0)) * 60 + (minutes ?? 0)) * 60 + (seconds ?? 0));
        }
    };
    const hoursChange = (value?: number) => {
        if (onValueChange) {
            value = value !== undefined ? value % 24 : undefined;
            setHours(value);
            onValueChange((((days || 0) * 24 + (value || 0)) * 60 + (minutes || 0)) * 60 + (seconds || 0));
        }
    };
    const minutesChange = (value?: number) => {
        if (onValueChange) {
            value = value !== undefined ? value % 60 : undefined;
            setMinutes(value);
            onValueChange((((days || 0) * 24 + (hours || 0)) * 60 + (value || 0)) * 60 + (seconds || 0));
        }
    };
    const secondsChange = (value?: number) => {
        if (onValueChange) {
            value = value !== undefined ? value % 60 : undefined;
            setSeconds(value);
            onValueChange((((days || 0) * 24 + (hours || 0)) * 60 + (minutes || 0)) * 60 + (value || 0));
        }
    };
    return <span className="ui-duration-input">
        <input type="number" value={String(value || 0)} onChange={() => { }} className="hidden" />
        <NumberInput
            className="days"
            value={days}
            onValueChange={daysChange}
            disabled={disabled}
            placeholder="Days"
        />
        <NumberInput
            className="hours"
            value={hours}
            onValueChange={hoursChange}
            disabled={disabled}
            placeholder="Hours"
        />
        <NumberInput
            className="minutes"
            value={minutes}
            onValueChange={minutesChange}
            disabled={disabled}
            placeholder="Min"
        />
        <NumberInput
            className="seconds"
            value={seconds}
            onValueChange={secondsChange}
            disabled={disabled}
            placeholder="Sec"
        />
    </span>
};

export default DurationInput;
