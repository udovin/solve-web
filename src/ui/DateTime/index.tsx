import { FC, useEffect, useState } from "react";

export type DateTimeProps = {
	value: number;
};

const formatDateTime = (value: number, now: number): string => {
	if (value <= now) {
		const seconds = now - value;
		const minutes = Math.trunc(seconds / 60)
		const hours = Math.trunc(minutes / 60);
		if (seconds < 60) {
			return `${seconds} seconds ago`;
		} else if (minutes < 60) {
			return `${minutes} minutes ago`;
		} else if (hours < 24) {
			return `${hours} hours ago`;
		}
	} else {
		const seconds = value - now;
		const minutes = Math.trunc(seconds / 60)
		const hours = Math.trunc(minutes / 60);
		if (seconds < 60) {
			return `in ${seconds} seconds`;
		} else if (minutes < 60) {
			return `in ${minutes} minutes`;
		} else if (hours < 24) {
			return `in ${hours} hours`;
		}
	}
	return `${(new Date(value * 1000)).toLocaleString()}`;
};

const DateTime: FC<DateTimeProps> = props => {
	const { value } = props;
	const getNow = () => {
		return Math.round((new Date()).getTime() / 1000);
	};
	const [now, setNow] = useState(getNow());
	useEffect(() => {
		let intervalID = setInterval(() => setNow(getNow()), 1000);
		return () => clearInterval(intervalID);
	}, [setNow]);
	return <>{formatDateTime(value, now)}</>;
};

export default DateTime;
