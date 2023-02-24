import { CSSProperties, FC, MouseEvent, useEffect, useRef, useState } from "react";
import Input from "../Input";
import Portal from "../Portal";

import "./index.scss";

export type DateTimeInputProps = {
    disabled?: boolean;
    value?: number;
    onValueChange?(value?: number): void;
};

const formatReplaceRegex = /YYYY|MM|DD|hh|mm|ss/g;

const dateFormatter = (fmt: string) => {
    const format = (date: Date) => {
        return fmt.replaceAll(formatReplaceRegex, (part: string) => {
            switch (part) {
                case "YYYY":
                    return String(date.getFullYear()).padStart(4, "0");
                case "MM":
                    return String(date.getMonth() + 1).padStart(2, "0");
                case "DD":
                    return String(date.getDate()).padStart(2, "0");
                case "hh":
                    return String(date.getHours()).padStart(2, "0");
                case "mm":
                    return String(date.getMinutes()).padStart(2, "0");
                case "ss":
                    return String(date.getSeconds()).padStart(2, "0");
                default:
                    return part;
            }
        });
    };
    let parts: string[] = [];
    const parseRegex = new RegExp("^" + fmt.replaceAll(formatReplaceRegex, (part: string) => {
        switch (part) {
            case "YYYY":
                parts.push(part);
                return "(\\d{4})";
            case "MM":
                parts.push(part);
                return "(\\d{2})";
            case "DD":
                parts.push(part);
                return "(\\d{2})";
            case "hh":
                parts.push(part);
                return "(\\d{2})";
            case "mm":
                parts.push(part);
                return "(\\d{2})";
            case "ss":
                parts.push(part);
                return "(\\d{2})";
            default:
                return part;
        }
    }) + "$");
    const parse = (raw: string) => {
        const match = raw.match(parseRegex);
        if (!match || match.length != parts.length + 1) {
            return undefined;
        }
        let year = 0, month = 0, date = 1, hours = 0, minutes = 0, seconds = 0;
        for (let i = 1; i < match.length; i++) {
            console.log(parts[i - 1], match[i]);
            switch (parts[i - 1]) {
                case "YYYY":
                    year = Number(match[i]);
                    break;
                case "MM":
                    month = Number(match[i]) - 1;
                    break;
                case "DD":
                    date = Number(match[i]);
                    break;
                case "hh":
                    hours = Number(match[i]);
                    break;
                case "mm":
                    minutes = Number(match[i]);
                    break;
                case "ss":
                    seconds = Number(match[i]);
                    break;
            }
        }
        return new Date(year, month, date, hours, minutes, seconds);
    };
    return { format, parse };
};

const getMonthCalendar = (year: number, month: number) => {
    const firstDay = (new Date(year, month)).getDay();
    const shift = firstDay >= 2 ? firstDay - 2 : firstDay + (7 - 2);
    let weeks: Date[][] = [];
    let index = 0;
    for (let week = 0; week < 6; week++) {
        const days: Date[] = [];
        for (let day = 0; day < 7; day++) {
            let date = index - shift;
            index++;
            days.push(new Date(year, month, date));
        }
        weeks.push(days);
    }
    return weeks;
};

const DateTimeInput: FC<DateTimeInputProps> = props => {
    const { value, onValueChange, disabled } = props;
    const fmt = "DD.MM.YYYY hh:mm:ss";
    const { format, parse } = dateFormatter(fmt);
    const [rawValue, setRawValue] = useState<string>(value ? format(new Date(value * 1000)) : "");
    const [valid, setValid] = useState<boolean>(false);
    const ref = useRef<HTMLSpanElement>(null);
    const [focused, setFocused] = useState(false);
    const [style, setStyle] = useState<CSSProperties>({});
    const toggleFocus = (event: MouseEvent) => {
        event.stopPropagation();
        setFocused(!focused);
    };
    const resetFocus = () => {
        setFocused(false);
    };
    useEffect(() => {
        if (!focused) {
            return;
        }
        document.addEventListener("click", resetFocus);
        return () => document.removeEventListener("click", resetFocus);
    }, [focused, setFocused]);
    const updateStyle = () => {
        if (!ref.current) {
            return;
        }
        const element = ref.current;
        setStyle({
            top: element.getBoundingClientRect().top + window.scrollY + element.scrollHeight,
            left: element.getBoundingClientRect().left + window.scrollX,
            minWidth: element.scrollWidth,
        });
    };
    useEffect(() => {
        if (!ref.current) {
            return;
        }
        updateStyle();
        window.addEventListener("resize", updateStyle);
        window.addEventListener("scroll", updateStyle, true);
        return () => {
            window.removeEventListener("resize", updateStyle);
            window.removeEventListener("scroll", updateStyle, true);
        };
    }, [ref, focused]);
    useEffect(() => {
        if (!onValueChange) {
            return;
        }
        const date = parse(rawValue);
        setValid(!!date || !rawValue);
        onValueChange(date ? Math.round(date.getTime() / 1000) : undefined);
    }, [rawValue, onValueChange]);
    useEffect(() => {
        if (value === undefined && !valid) {
            return;
        }
        setRawValue(value ? format(new Date(value * 1000)) : "");
    }, [value]);
    const date = value ? new Date(value * 1000) : new Date();
    const calendar = getMonthCalendar(date.getFullYear(), date.getMonth());
    return <span
        className={`ui-datetime-input${valid ? "" : " invalid"}`}
        onClick={!disabled ? toggleFocus : undefined}
        ref={ref}>
        <Input
            value={rawValue}
            onValueChange={onValueChange ? setRawValue : undefined}
            placeholder={fmt}
            disabled={disabled} />
        {focused && <Portal>
            <div className="ui-datetime-input-calendar" style={style} onClick={(event) => { event.stopPropagation(); }}>
                <div className="calendar">
                    <table>
                        <tbody>
                            {calendar.map((week, index) => {
                                return <tr key={index}>
                                    {week.map((date, index2) => {
                                        return <td key={index2}>{date.getDate()}</td>;
                                    })}
                                </tr>;
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </Portal>}
    </span>;
};

export default DateTimeInput;
