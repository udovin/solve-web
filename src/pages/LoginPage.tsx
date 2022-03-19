import { useContext, useState } from "react";
import Page from "../components/Page";
import Input from "../ui/Input";
import Button from "../ui/Button";
import FormBlock from "../components/FormBlock";
import { Redirect } from "react-router";
import { AuthContext } from "../AuthContext";
import Field from "../ui/Field";
import { ErrorResponse, statusUser, loginUser } from "../api";
import Alert from "../ui/Alert";
import Sidebar from "../ui/Sidebar";

const LoginPage = () => {
	const { status, setStatus } = useContext(AuthContext);
	const [error, setError] = useState<ErrorResponse>({ message: "" });
	const [form, setForm] = useState<{ [key: string]: string }>({});
	const onSubmit = (event: any) => {
		event.preventDefault();
		loginUser({
			login: form.login,
			password: form.password,
		})
			.then(() => {
				setError({ message: "" });
				return statusUser();
			})
			.then(json => setStatus(json))
			.catch(error => setError(error));
	};
	if (status && status.user) {
		return <Redirect to={"/"} />
	}
	return <Page title="Login" sidebar={<Sidebar />}>
		<FormBlock onSubmit={onSubmit} title="Login" footer={
			<Button type="submit" color="primary">Login</Button>
		}>
			{error.message && <Alert>{error.message}</Alert>}
			<Field title="Username:">
				<Input
					type="text" name="login" placeholder="Username"
					value={form.login}
					onValueChange={(value) => setForm({ ...form, login: value })}
					required autoFocus
				/>
			</Field>
			<Field title="Password:">
				<Input
					type="password" name="password" placeholder="Password"
					value={form.password}
					onValueChange={(value) => setForm({ ...form, password: value })}
					required
				/>
			</Field>
		</FormBlock>
	</Page>;
};

export default LoginPage;
