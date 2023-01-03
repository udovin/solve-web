import { FC, useState } from "react";
import Portal from ".";
import Button from "../Button";

export default {
	title: "Portal",
};

export const Index = () => {
	const [show, setShow] = useState<boolean>(false);
	return <>
		<p><Button onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</Button></p>
		{show && <Portal>
			<p>Inside portal</p>
		</Portal>}
		<p>After portal.</p>
	</>;
};
