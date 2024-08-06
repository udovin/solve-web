import { FC, useContext, useEffect, useMemo, useState } from "react";
import { DateFormatter } from "../../utils";
import { LocaleContext } from "../Locale";

export type DateTimeProps = {
	value: number;
};

export const DATETIME_FORMAT = "DD/MM/YYYY hh:mm:ss";

const DateTime: FC<DateTimeProps> = props => {
	const { value } = props;
	const getNow = () => {
		return Math.round((new Date()).getTime() / 1000);
	};
	const { localizeKey, localizePluralKey } = useContext(LocaleContext);
	const [now, setNow] = useState(getNow());
	const fmt = localizeKey("datetime_format", DATETIME_FORMAT);
	const format = useMemo(() => DateFormatter(fmt), [fmt]);
	useEffect(() => {
		let intervalID = setInterval(() => setNow(getNow()), 1000);
		return () => clearInterval(intervalID);
	}, [setNow]);
	if (value > now - 1 && value < now + 1) {
		return localizeKey("datetime_now", "now");
	} else if (value <= now) {
		const seconds = now - value;
		const minutes = Math.trunc(seconds / 60)
		const hours = Math.trunc(minutes / 60);
		if (seconds < 60) {
			return localizePluralKey("datetime_past_second", ["%d second ago", "%d seconds ago"], seconds);
		} else if (minutes < 60) {
			return localizePluralKey("datetime_past_minute", ["%d minute ago", "%d minutes ago"], minutes);
		} else if (hours < 24) {
			return localizePluralKey("datetime_past_hour", ["%d hour ago", "%d hours ago"], hours);
		}
	} else {
		const seconds = value - now;
		const minutes = Math.trunc(seconds / 60)
		const hours = Math.trunc(minutes / 60);
		if (seconds < 60) {
			return localizePluralKey("datetime_future_second", ["in %d second", "in %d seconds"], seconds);
		} else if (minutes < 60) {
			return localizePluralKey("datetime_future_minute", ["in %d minute", "in %d minutes"], minutes);
		} else if (hours < 24) {
			return localizePluralKey("datetime_future_hour", ["in %d hour", "in %d hours"], hours);
		}
	}
	return format(new Date(value * 1000));
};

export default DateTime;
