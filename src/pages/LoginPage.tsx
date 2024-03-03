import { useContext, useState } from "react";
import Page from "../components/Page";
import Input from "../ui/Input";
import Button from "../ui/Button";
import FormBlock from "../components/FormBlock";
import { Navigate, useParams } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import Field from "../ui/Field";
import { ErrorResponse, LoginForm, loginUser } from "../api";
import Alert from "../ui/Alert";
import Sidebar from "../ui/Sidebar";
import { Link } from "react-router-dom";
import { strings } from "../Locale";

const LoginPage = () => {
	const params = useParams();
	const { scope_id } = params;
	const { status, updateStatus } = useContext(AuthContext);
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
				updateStatus();
				setError({ message: "" });
			})
			.catch(error => setError(error));
	};
	if ((status?.user || status?.scope_user) && success) {
		return <Navigate to={"/"} />
	}
	return <Page title={strings.login} sidebar={<Sidebar />}>
		<FormBlock onSubmit={onSubmit} title={strings.login} className="b-login-form" footer={<>
			<Button type="submit" color="primary">{strings.login}</Button>
			<Link to="/reset-password" className="reset-password">{strings.forgotPassword}</Link>
		</>}>
			{error.message && <Alert>{error.message}</Alert>}
			<Field title={strings.username + ":"}>
				<Input
					type="text" name="login" placeholder={strings.username}
					value={form.login}
					onValueChange={(value) => setForm({ ...form, login: value })}
					required autoFocus
				/>
			</Field>
			<Field title={strings.password + ":"}>
				<Input
					type="password" name="password" placeholder={strings.password}
					value={form.password}
					onValueChange={(value) => setForm({ ...form, password: value })}
					required
				/>
			</Field>
		</FormBlock>
	</Page>;
};

export default LoginPage;
