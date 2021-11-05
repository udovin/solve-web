import moment from "moment";
import {FC} from "react";

export type TimeProps = {
	value: number;
};

const Time: FC<TimeProps> = props => {
	const {value} = props;
	return <>{moment.unix(value).fromNow()}</>;
};

export default Time;
