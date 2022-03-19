import { useState } from "react";
import { Redirect } from "react-router";
import Page from "../components/Page";
import Input from "../ui/Input";
import Button from "../ui/Button";
import FormBlock from "../components/FormBlock";
import Field from "../ui/Field";
import Alert from "../ui/Alert";
import { ErrorResponse, registerUser } from "../api";
import Sidebar from "../ui/Sidebar";

const RegisterPage = () => {
	const [success, setSuccess] = useState<boolean>();
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
		return <Redirect to={"/login"} />
	}
	const equalPasswords = form.password === form.password_repeat;
	return <Page title="Register" sidebar={<Sidebar />}>
		<FormBlock onSubmit={onSubmit} title="Register" footer={
			<Button
				type="submit" color="primary"
				disabled={!form.password || !equalPasswords}
			>Register</Button>
		}>
			{error.message && <Alert>{error.message}</Alert>}
			<Field title="Username:" description={<>
				You can use only English letters, digits, symbols &laquo;<code>_</code>&raquo; and &laquo;<code>-</code>&raquo;.
				Username can starts only with English letter and ends with English letter and digit.
			</>}>
				<Input
					type="text" name="login" placeholder="Username"
					value={form.login || ""}
					onValueChange={(value) => setForm({ ...form, login: value })}
					required autoFocus
				/>
				{error.invalid_fields && error.invalid_fields["login"] && <Alert>{error.invalid_fields["login"].message}</Alert>}
			</Field>
			<Field title="E-mail:" description="You will receive an email to verify your account.">
				<Input
					type="text" name="email" placeholder="E-mail"
					value={form.email || ""}
					onValueChange={(value) => setForm({ ...form, email: value })}
					required
				/>
				{error.invalid_fields && error.invalid_fields["email"] && <Alert>{error.invalid_fields["email"].message}</Alert>}
			</Field>
			<Field title="Password:">
				<Input
					type="password" name="password" placeholder="Password"
					value={form.password}
					onValueChange={(value) => setForm({ ...form, password: value })}
					required
				/>
				{error.invalid_fields && error.invalid_fields["password"] && <Alert>{error.invalid_fields["password"].message}</Alert>}
			</Field>
			<Field title="Repeat password:">
				<Input
					type="password" name="password_repeat" placeholder="Repeat password"
					value={form.password_repeat}
					onValueChange={(value) => setForm({ ...form, password_repeat: value })}
					required
				/>
				{form.password && !equalPasswords && <Alert>Passwords does not match</Alert>}
			</Field>
			<Field title="First name:">
				<Input
					type="text" name="first_name" placeholder="First name"
					value={form.first_name || ""}
					onValueChange={(value) => setForm({ ...form, first_name: value })}
				/>
				{error.invalid_fields && error.invalid_fields["first_name"] && <Alert>{error.invalid_fields["first_name"].message}</Alert>}
			</Field>
			<Field title="Last name:">
				<Input
					type="text" name="last_name" placeholder="Last name"
					value={form.last_name || ""}
					onValueChange={(value) => setForm({ ...form, last_name: value })}
				/>
				{error.invalid_fields && error.invalid_fields["last_name"] && <Alert>{error.invalid_fields["last_name"].message}</Alert>}
			</Field>
			<Field title="Middle name:">
				<Input
					type="text" name="middle_name" placeholder="Middle name"
					value={form.middle_name || ""}
					onValueChange={(value) => setForm({ ...form, middle_name: value })}
				/>
				{error.invalid_fields && error.invalid_fields["middle_name"] && <Alert>{error.invalid_fields["middle_name"].message}</Alert>}
			</Field>
		</FormBlock>
	</Page>;
};

export default RegisterPage;
