import { FC } from "react";
import { useLocale } from "../Locale";

export type DurationProps = {
	value: number;
};

const formatPart = (value: number) => {
	let result = String(value);
	while (result.length < 2) {
		result = "0" + result;
	}
	return result;
};

const roundNumber = (value: number, places: number) => {
	return Number(Math.round(Number(String(value) + "e+" + String(places))) + "e-" + String(places));
};

const Duration: FC<DurationProps> = props => {
	const { value } = props;
	const { localizePluralKey } = useLocale();
	const seconds = Math.trunc(value % 60);
	const minutes = Math.trunc(value / 60) % 60;
	const hours = Math.trunc(value / 3600) % 24;
	const days = Math.trunc(value / 86400);
	if (days) {
		if (!hours && !minutes && !seconds) {
			return <>{localizePluralKey("duration_day", ["%d day", "%d days"], days)}</>;
		}
		return <>{localizePluralKey("duration_day", ["%d day", "%d days"], days)} {formatPart(hours)}:{formatPart(minutes)}:{formatPart(seconds)}</>;
	}
	if (hours || minutes) {
		return <>{formatPart(hours)}:{formatPart(minutes)}:{formatPart(seconds)}</>;
	}
	const milliseconds = Math.trunc((value - Math.trunc(value)) * 1000);
	if (seconds) {
		const roundSeconds = roundNumber(seconds + milliseconds / 1000, 3);
		return <>{roundSeconds} {localizePluralKey("duration_second", ["second", "seconds"], seconds)}</>
	}
	return <>{localizePluralKey("duration_millisecond", ["%d millisecond", "%d milliseconds"], milliseconds)}</>;
};

export default Duration;
