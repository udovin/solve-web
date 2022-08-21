import Alert, { AlertKind } from ".";

export default {
	title: "Alert",
};

export const Index = () => <>
	<Alert>Default</Alert>
	<Alert kind={AlertKind.DANGER}>Danger</Alert>
	<Alert kind={AlertKind.INFO}>Info</Alert>
	<Alert kind={AlertKind.WARNING}>Warning</Alert>
	<Alert kind={AlertKind.SUCCESS}>Success</Alert>
</>;
