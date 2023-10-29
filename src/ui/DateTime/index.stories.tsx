import DateTime from ".";

export default {
	title: "DateTime",
};

export const Index = () => <>
	<DateTime value={(new Date(1577970855000)).getTime() / 1000} />
</>;
