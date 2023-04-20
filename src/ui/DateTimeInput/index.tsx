import { CSSProperties, FC, useEffect, useMemo, useRef, useState } from "react";
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
        if (!match || match.length !== parts.length + 1) {
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
    const valueDate = useMemo(() => value ? new Date(value * 1000) : new Date(), [value]);
    const { format, parse } = useMemo(() => dateFormatter(fmt), [fmt]);
    const [rawValue, setRawValue] = useState<string>(value ? format(new Date(value * 1000)) : "");
    const [valid, setValid] = useState<boolean>(false);
    const ref = useRef<HTMLSpanElement>(null);
    const [focused, setFocused] = useState(false);
    const [style, setStyle] = useState<CSSProperties>({});
    const [calendarDate, setCalendarDate] = useState(valueDate);
    const toggleFocus = () => {
        setFocused(!focused);
    };
    const resetFocus = (event: Event) => {
        if (event.target instanceof Element && ref.current?.contains(event.target)) {
            return;
        }
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
        });
    };
    useEffect(() => {
        if (!ref.current) {
            return;
        }
        updateStyle();
        setCalendarDate(valueDate);
        window.addEventListener("resize", updateStyle);
        window.addEventListener("scroll", updateStyle, true);
        return () => {
            window.removeEventListener("resize", updateStyle);
            window.removeEventListener("scroll", updateStyle, true);
        };
    }, [ref, focused, valueDate]);
    useEffect(() => {
        if (!onValueChange) {
            return;
        }
        const date = parse(rawValue);
        setValid(!!date || !rawValue);
        onValueChange(date ? Math.round(date.getTime() / 1000) : undefined);
    }, [rawValue, onValueChange, parse]);
    useEffect(() => {
        if (value === undefined && !valid) {
            return;
        }
        setRawValue(value ? format(new Date(value * 1000)) : "");
    }, [value, format, valid]);
    const calendar = getMonthCalendar(calendarDate.getFullYear(), calendarDate.getMonth());
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
                                        const thisMonth = calendarDate.getMonth() === date.getMonth();
                                        const nowDate = (new Date());
                                        const thisDate = nowDate.getFullYear() === date.getFullYear() &&
                                            nowDate.getMonth() === date.getMonth() &&
                                            nowDate.getDate() === date.getDate();
                                        const selectedDate = !!value && valueDate.getFullYear() === date.getFullYear() &&
                                            valueDate.getMonth() === date.getMonth() &&
                                            valueDate.getDate() === date.getDate();
                                        const onClick = () => {
                                            const newDate = new Date(
                                                date.getFullYear(), date.getMonth(), date.getDate(),
                                                valueDate.getHours(), valueDate.getMinutes(), valueDate.getSeconds(),
                                            );
                                            onValueChange && onValueChange(newDate.getTime() / 1000);
                                        };
                                        return <td key={index2} className={`${thisDate ? "this-date " : ""}${thisMonth ? "this-month " : ""}${selectedDate ? "selected" : ""}`.trimEnd()}>
                                            <button type="button" onClick={onClick}>{date.getDate()}</button>
                                        </td>;
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
