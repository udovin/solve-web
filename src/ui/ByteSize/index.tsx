import { FC } from "react";

export type ByteSizeProps = {
	value: number;
};

const ByteSize: FC<ByteSizeProps> = props => {
	const { value } = props;
	const gib = Math.trunc(value / (1024 * 1024 * 1024));
	if (gib) {
		return <>{gib} GiB</>;
	}
	const mib = Math.trunc(value / (1024 * 1024));
	if (mib) {
		return <>{mib} MiB</>;
	}
	const kib = Math.trunc(value / 1024);
	if (kib) {
		return <>{kib} KiB</>
	}
	return <>{value} B</>;
};

export default ByteSize;
