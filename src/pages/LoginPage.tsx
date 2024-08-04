import { useContext, useState } from "react";
import Page from "../components/Page";
import Input from "../ui/Input";
import Button from "../ui/Button";
import FormBlock from "../components/FormBlock";
import { Navigate, useParams } from "react-router-dom";
import { AuthContext } from "../ui/Auth";
import Field from "../ui/Field";
import { ErrorResponse, LoginForm, loginUser } from "../api";
import Alert from "../ui/Alert";
import Sidebar from "../ui/Sidebar";
import { Link } from "react-router-dom";
import { LocaleContext } from "../ui/Locale";

const LoginPage = () => {
	const params = useParams();
	const { scope_id } = params;
	const { status, refreshStatus } = useContext(AuthContext);
	const { localize } = useContext(LocaleContext);
	const [error, setError] = useState<ErrorResponse>({ message: "" });
	const [form, setForm] = useState<{ [key: string]: string }>({});
	const [success, setSuccess] = useState<boolean>();
	const onSubmit = (event: any) => {
		event.preventDefault();
		let loginForm: LoginForm = {
			login: form.login,
			password: form.password,
		};
		if (scope_id !== undefined) {
			loginForm.scope_id = Number(scope_id);
			loginForm.login = form.login;
		} else if (form.login.includes("/")) {
			const parts = form.login.split("/", 2)
			if (parts.length > 1) {
				loginForm.scope_id = Number(parts[0]);
				loginForm.login = parts[1];
			}
		}
		loginUser(loginForm)
			.then(() => {
				setSuccess(true);
				refreshStatus();
				setError({ message: "" });
			})
			.catch(error => setError(error));
	};
	if ((status?.user || status?.scope_user) && success) {
		return <Navigate to={"/"} />
	}
	return <Page title={localize("Login")} sidebar={<Sidebar />}>
		<FormBlock onSubmit={onSubmit} title={localize("Login")} className="b-login-form" footer={<>
			<Button type="submit" color="primary">{localize("Login")}</Button>
			<Link to="/reset-password" className="reset-password">{localize("Forgot password")}</Link>
		</>}>
			{error.message && <Alert>{error.message}</Alert>}
			<Field title={localize("Username") + ":"}>
				<Input
					type="text" name="login" placeholder={localize("Username")}
					value={form.login}
					onValueChange={(value) => setForm({ ...form, login: value })}
					required autoFocus
				/>
			</Field>
			<Field title={localize("Password") + ":"}>
				<Input
					type="password" name="password" placeholder={localize("Password")}
					value={form.password}
					onValueChange={(value) => setForm({ ...form, password: value })}
					required
				/>
			</Field>
		</FormBlock>
	</Page>;
};

export default LoginPage;
