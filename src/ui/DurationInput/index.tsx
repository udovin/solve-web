import { FC, useEffect, useState } from "react";
import NumberInput from "../NumberInput";

import "./index.scss";

export type DurationInputProps = {
    disabled?: boolean;
    value?: number;
    onValueChange?(value?: number): void;
};

const formatDays = (value: string) => {
    if (value === "0") {
        return "";
    }
    return value;
};
const formatPart = (value: string) => {
    if (value === "" || value === "0") {
        return "";
    }
    while (value.length < 2) {
        value = "0" + value;
    }
    while (value.length > 2 && value[0] === "0") {
        value = value.substring(1);
    }
    return value;
};

const DurationInput: FC<DurationInputProps> = props => {
    const { value, onValueChange, disabled } = props;
    const [days, setDays] = useState(value ? Math.trunc(value / 86400) : undefined);
    const [hours, setHours] = useState(value ? Math.trunc(value / 3600) % 24 : undefined);
    const [minutes, setMinutes] = useState(value ? Math.trunc(value / 60) % 60 : undefined);
    const [seconds, setSeconds] = useState(value ? value % 60 : undefined);
    useEffect(() => {
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
    const calcValue = (days?: number, hours?: number, minutes?: number, seconds?: number) => {
        if (days === undefined && hours === undefined && minutes === undefined && seconds === undefined) {
            return undefined;
        }
        return (((days ?? 0) * 24 + (hours ?? 0)) * 60 + (minutes ?? 0)) * 60 + (seconds ?? 0);
    };
    const daysChange = (value?: number) => {
        if (onValueChange) {
            setDays(value);
            onValueChange(calcValue(value, hours, minutes, seconds));
        }
    };
    const hoursChange = (value?: number) => {
        if (onValueChange) {
            setHours(value);
            onValueChange(calcValue(days, value, minutes, seconds));
        }
    };
    const minutesChange = (value?: number) => {
        if (onValueChange) {
            setMinutes(value);
            onValueChange(calcValue(days, hours, value, seconds));
        }
    };
    const secondsChange = (value?: number) => {
        if (onValueChange) {
            setSeconds(value);
            onValueChange(calcValue(days, hours, minutes, value));
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
            formatNumber={formatDays}
        />
        <NumberInput
            className="hours"
            value={hours}
            onValueChange={hoursChange}
            disabled={disabled}
            placeholder="hh"
            formatNumber={formatPart}
        />
        <NumberInput
            className="minutes"
            value={minutes}
            onValueChange={minutesChange}
            disabled={disabled}
            placeholder="mm"
            formatNumber={formatPart}
        />
        <NumberInput
            className="seconds"
            value={seconds}
            onValueChange={secondsChange}
            disabled={disabled}
            placeholder="ss"
            formatNumber={formatPart}
        />
    </span>
};

export default DurationInput;
