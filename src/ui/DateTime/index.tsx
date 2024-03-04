import { FC, useEffect, useMemo, useState } from "react";
import { DateFormatter } from "../../utils";
import { getLocale } from "../../api";

export type DateTimeProps = {
	value: number;
};

const plural = (one: string, n: number): string => {
	return n > 1 ? one + "s" : one;
};

const formatDateTimeEn = (value: number, now: number, format: any): string => {
	if (value <= now) {
		const seconds = now - value;
		const minutes = Math.trunc(seconds / 60)
		const hours = Math.trunc(minutes / 60);
		if (seconds < 60) {
			return `${seconds} ${plural("second", seconds)} ago`;
		} else if (minutes < 60) {
			return `${minutes} ${plural("minute", minutes)} ago`;
		} else if (hours < 24) {
			return `${hours} ${plural("hour", hours)} ago`;
		}
	} else {
		const seconds = value - now;
		const minutes = Math.trunc(seconds / 60)
		const hours = Math.trunc(minutes / 60);
		if (seconds < 60) {
			return `in ${seconds} ${plural("second", seconds)}`;
		} else if (minutes < 60) {
			return `in ${minutes} ${plural("minute", minutes)}`;
		} else if (hours < 24) {
			return `in ${hours} ${plural("hour", hours)}`;
		}
	}
	return format(new Date(value * 1000));
};

const getSecondsString = (n: number): string => {
	const mod10 = n % 10, mod100 = n % 100;
	if(mod10 === 0 || (11 <= mod100 && mod100 <= 14)) {
		return "секунд";
	}
	if(mod10 === 1) {
		return "секунда";
	}
	if(mod10 <= 4) {
		return "секунды";
	}
	return "секунд";
};

const getMinutesString = (n: number): string => {
	const mod10 = n % 10, mod100 = n % 100;
	if(mod10 === 0 || (11 <= mod100 && mod100 <= 14)) {
		return "минут";
	}
	if(mod10 === 1) {
		return "минтуа";
	}
	if(mod10 <= 4) {
		return "минуты";
	}
	return "минут";
};

const getHoursString = (n: number): string => {
	const mod10 = n % 10, mod100 = n % 100;
	if(mod10 === 0 || (11 <= mod100 && mod100 <= 14)) {
		return "часов";
	}
	if(mod10 === 1) {
		return "час";
	}
	if(mod10 <= 4) {
		return "часа";
	}
	return "часов";
};

const formatDateTimeRu = (value: number, now: number, format: any): string => {
	if (value <= now) {
		const seconds = now - value;
		const minutes = Math.trunc(seconds / 60)
		const hours = Math.trunc(minutes / 60);
		if (seconds < 60) {
			return `${seconds} ${getSecondsString(seconds)} назад`;
		} else if (minutes < 60) {
			return `${minutes} ${getMinutesString(minutes)} назад`;
		} else if (hours < 24) {
			return `${hours} ${getHoursString(hours)} назад`;
		}
	} else {
		const seconds = value - now;
		const minutes = Math.trunc(seconds / 60)
		const hours = Math.trunc(minutes / 60);
		if (seconds < 60) {
			return `через ${seconds} ${getSecondsString(seconds)}`;
		} else if (minutes < 60) {
			return `через ${minutes} ${getMinutesString(minutes)}`;
		} else if (hours < 24) {
			return `через ${hours} ${getHoursString(hours)}`;
		}
	}
	return format(new Date(value * 1000));
};

const formatDateTime = (value: number, now: number, format: any): string => {
	if(getLocale() === "ru") {
		return formatDateTimeRu(value, now, format);
	}
	return formatDateTimeEn(value, now, format);
};

const DateTime: FC<DateTimeProps> = props => {
	const { value } = props;
	const getNow = () => {
		return Math.round((new Date()).getTime() / 1000);
	};
	const [now, setNow] = useState(getNow());
	const fmt = "DD.MM.YYYY hh:mm:ss";
	const format = useMemo(() => DateFormatter(fmt), [fmt]);
	useEffect(() => {
		let intervalID = setInterval(() => setNow(getNow()), 1000);
		return () => clearInterval(intervalID);
	}, [setNow]);
	return <>{formatDateTime(value, now, format)}</>;
};

export default DateTime;
