import { CSSProperties, FC, useEffect, useMemo, useRef, useState } from "react";
import Input from "../Input";
import Portal from "../Portal";
import { DateFormatter, DateParser } from "../../utils";

import "./index.scss";

export type DateTimeInputProps = {
    disabled?: boolean;
    value?: number;
    onValueChange?(value?: number): void;
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
    const format = useMemo(() => DateFormatter(fmt), [fmt]);
    const parse = useMemo(() => DateParser(fmt), [fmt]);
    const [rawValue, setRawValue] = useState<string>(value ? format(new Date(value * 1000)) : "");
    const [valid, setValid] = useState<boolean>(false);
    const ref = useRef<HTMLInputElement>(null);
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
            top: element.getBoundingClientRect().top + window.scrollY + element.offsetHeight,
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
    return <>
        <Input
            className={`ui-datetime-input${valid ? "" : " invalid"}`}
            onClick={!disabled ? toggleFocus : undefined}
            ref={ref}
            value={rawValue}
            onValueChange={onValueChange ? setRawValue : undefined}
            placeholder={fmt}
            disabled={disabled} />
        {focused && <Portal>
            <div className="ui-calendar-portal" style={style} onClick={(event) => { event.stopPropagation(); }}>
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
    </>;
};

export default DateTimeInput;
