import { FC } from "react";

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
	const seconds = Math.trunc(value % 60);
	const minutes = Math.trunc(value / 60) % 60;
	const hours = Math.trunc(value / 3600) % 24;
	const days = Math.trunc(value / 86400);
	if (days) {
		return <>{days} day{days > 1 ? "s" : ""} {formatPart(hours)}:{formatPart(minutes)}:{formatPart(seconds)}</>;
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
