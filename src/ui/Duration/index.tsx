import { FC } from "react";
import { getLocale } from "../../api";

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

const getDaysStringEn = (n: number) => {
	if(n === 1) {
		return "day";
	}
	return "days";
}

const getDaysStringRu = (n: number) => {
	const mod10 = n % 10, mod100 = n % 100;
	if(mod10 === 0 || (11 <= mod100 && mod100 <= 14)) {
		return "дней";
	}
	if(mod10 === 1) {
		return "день";
	}
	if(mod10 <= 4) {
		return "дня";
	}
	return "дней";
}

const getDaysString = (n: number) => {
	if(getLocale() === "ru") {
		return getDaysStringRu(n);
	}
	return getDaysStringEn(n);
}

const Duration: FC<DurationProps> = props => {
	const { value } = props;
	const seconds = Math.trunc(value % 60);
	const minutes = Math.trunc(value / 60) % 60;
	const hours = Math.trunc(value / 3600) % 24;
	const days = Math.trunc(value / 86400);
	if (days) {
		if (!hours && !minutes && !seconds) {
			return <>{days} {getDaysString(days)}</>;
		}
		return <>{days} {getDaysString(days)} {formatPart(hours)}:{formatPart(minutes)}:{formatPart(seconds)}</>;
	}
	if (hours || minutes) {
		return <>{formatPart(hours)}:{formatPart(minutes)}:{formatPart(seconds)}</>;
	}
	const milliseconds = Math.trunc((value - Math.trunc(value)) * 1000);
	if (seconds) {
		return <>{roundNumber(seconds + milliseconds / 1000, 3)} s</>
	}
	return <>{milliseconds} ms</>;
};

export default Duration;
