import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import Page from "../components/Page";
import Input from "../ui/Input";
import Button from "../ui/Button";
import FormBlock from "../components/FormBlock";
import Field from "../ui/Field";
import Alert from "../ui/Alert";
import { ErrorResponse, registerUser } from "../api";
import Sidebar from "../ui/Sidebar";
import { LocaleContext } from "../ui/Locale";

const RegisterPage = () => {
	const [success, setSuccess] = useState<boolean>();
	const { localize, localizeKey } = useContext(LocaleContext);
	const [error, setError] = useState<ErrorResponse>({ message: "" });
	const [form, setForm] = useState<{ [key: string]: string }>({});
	const onSubmit = (event: any) => {
		event.preventDefault();
		registerUser({
			login: form.login,
			password: form.password,
			email: form.email,
			first_name: form.first_name,
			last_name: form.last_name,
			middle_name: form.middle_name,
		})
			.then(() => {
				setError({ message: "" });
				setSuccess(true);
			})
			.catch(error => setError(error));
	};
	if (success) {
		return <Navigate to={"/login"} />
	}
	const equalPasswords = form.password === form.password_repeat;
	return <Page title={localize("Register")} sidebar={<Sidebar />}>
		<FormBlock onSubmit={onSubmit} title={localize("Register")} footer={
			<Button
				type="submit" color="primary"
				disabled={!form.password || !equalPasswords}
			>{localize("Register")}</Button>
		}>
			{error.message && <Alert>{error.message}</Alert>}
			<Field title={localize("Username") + ":"} description={localizeKey("username_restrictions", "You can use only English letters, digits, symbols «_» and «-». Username can start only with English letter and end with English letter or digit.")}>
				<Input
					type="text" name="login" placeholder={localize("Username")}
					value={form.login || ""}
					onValueChange={(value) => setForm({ ...form, login: value })}
					required autoFocus
				/>
				{error.invalid_fields && error.invalid_fields["login"] && <Alert>{error.invalid_fields["login"].message}</Alert>}
			</Field>
			<Field title="E-mail:" description={localizeKey("email_confirmation_notice", "You will receive an email to verify your account.")}>
				<Input
					type="text" name="email" placeholder="E-mail"
					value={form.email || ""}
					onValueChange={(value) => setForm({ ...form, email: value })}
					required
				/>
				{error.invalid_fields && error.invalid_fields["email"] && <Alert>{error.invalid_fields["email"].message}</Alert>}
			</Field>
			<Field title={localize("Password") + ":"}>
				<Input
					type="password" name="password" placeholder={localize("Password")}
					value={form.password}
					onValueChange={(value) => setForm({ ...form, password: value })}
					required
				/>
				{error.invalid_fields && error.invalid_fields["password"] && <Alert>{error.invalid_fields["password"].message}</Alert>}
			</Field>
			<Field title={localize("Repeat password") + ":"}>
				<Input
					type="password" name="password_repeat" placeholder={localize("Repeat password")}
					value={form.password_repeat}
					onValueChange={(value) => setForm({ ...form, password_repeat: value })}
					required
				/>
				{form.password && !equalPasswords && <Alert>{localize("Passwords do not match")}</Alert>}
			</Field>
			<Field title={localize("First name") + ":"}>
				<Input
					type="text" name="first_name" placeholder={localize("First name")}
					value={form.first_name || ""}
					onValueChange={(value) => setForm({ ...form, first_name: value })}
				/>
				{error.invalid_fields && error.invalid_fields["first_name"] && <Alert>{error.invalid_fields["first_name"].message}</Alert>}
			</Field>
			<Field title={localize("Last name") + ":"}>
				<Input
					type="text" name="last_name" placeholder={localize("Last name")}
					value={form.last_name || ""}
					onValueChange={(value) => setForm({ ...form, last_name: value })}
				/>
				{error.invalid_fields && error.invalid_fields["last_name"] && <Alert>{error.invalid_fields["last_name"].message}</Alert>}
			</Field>
			<Field title={localize("Middle name") + ":"}>
				<Input
					type="text" name="middle_name" placeholder={localize("Middle name")}
					value={form.middle_name || ""}
					onValueChange={(value) => setForm({ ...form, middle_name: value })}
				/>
				{error.invalid_fields && error.invalid_fields["middle_name"] && <Alert>{error.invalid_fields["middle_name"].message}</Alert>}
			</Field>
		</FormBlock>
	</Page>;
};

export default RegisterPage;
