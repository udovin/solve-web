import { FC, useContext, useEffect, useState } from "react";
import Page from "../../components/Page";
import {
	ErrorResponse,
	Session,
	User,
	UserID,
	observeUser,
	observeUserSessions,
	deleteSession,
	updateUserPassword,
	updateUser,
	Sessions,
	updateUserEmail,
	resendUserEmail,
	updateUserStatus,
} from "../../api";
import Block from "../../ui/Block";
import FormBlock from "../../components/FormBlock";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import Field from "../../ui/Field";
import Alert, { AlertKind } from "../../ui/Alert";
import { AuthContext } from "../../ui/Auth";
import Sidebar from "../../ui/Sidebar";
import DateTime from "../../ui/DateTime";
import Select from "../../ui/Select";
import { Tab, TabContent, Tabs, TabsGroup } from "../../ui/Tabs";
import { Route, Routes, useParams } from "react-router-dom";
import { Link } from "react-router-dom";

import "./index.scss";
import { LocaleContext } from "../../ui/Locale";

type EditUserBlockProps = {
	user: User;
	onUpdateUser(user: User): void;
};

const EditUserBlock: FC<EditUserBlockProps> = props => {
	const { user, onUpdateUser } = props;
	const { localize } = useContext(LocaleContext);
	const [form, setForm] = useState<{ [key: string]: string }>({});
	const [error, setError] = useState<ErrorResponse>();
	const onSubmit = (event: any) => {
		event.preventDefault();
		updateUser(user.id, form)
			.then(newUser => {
				onUpdateUser(newUser);
				onResetForm();
			})
			.catch(setError);
	};
	const onResetForm = () => {
		setForm({});
		setError(undefined);
	};
	return <FormBlock className="b-profile-edit" title={localize("Edit profile")} onSubmit={onSubmit} footer={<>
		<Button
			type="submit" color="primary"
			disabled={!Object.keys(form).length}
		>{localize("Change")}</Button>
		{!!Object.keys(form).length && <Button type="reset" onClick={onResetForm}>{localize("Reset")}</Button>}
	</>}>
		{error && error.message && <Alert>{error.message}</Alert>}
		<Field title={localize("First name") + ":"} errorResponse={error} name="first_name">
			<Input
				type="text" name="first_name" placeholder={localize("First name")}
				value={form.first_name ?? user.first_name}
				onValueChange={(value) => setForm({ ...form, first_name: value })}
			/>
		</Field>
		<Field title={localize("Last name") + ":"} errorResponse={error} name="last_name">
			<Input
				type="text" name="last_name" placeholder={localize("Last name")}
				value={form.last_name ?? user.last_name}
				onValueChange={(value) => setForm({ ...form, last_name: value })}
			/>
		</Field>
		<Field title={localize("Middle name") + ":"} errorResponse={error} name="middle_name">
			<Input
				type="text" name="middle_name" placeholder={localize("Middle name")}
				value={form.middle_name ?? user.middle_name}
				onValueChange={(value) => setForm({ ...form, middle_name: value })}
			/>
		</Field>
	</FormBlock>;
};

const EditUserStatusBlock: FC<EditUserBlockProps> = props => {
	const { user, onUpdateUser } = props;
	const { localize, localizeKey } = useContext(LocaleContext);
	const [currentPassword, setCurrentPassword] = useState<string>();
	const [newStatus, setNewStatus] = useState<string>();
	const { status, setStatus } = useContext(AuthContext);
	const [error, setError] = useState<ErrorResponse>();
	const onSubmit = (event: any) => {
		event.preventDefault();
		if (!newStatus || !currentPassword) {
			return;
		}
		updateUserStatus(user.id, {
			current_password: currentPassword,
			status: newStatus,
		})
			.then(newUser => {
				onUpdateUser(newUser);
				onResetForm();
				if (status?.user && newUser.status && newUser.id === status.user.id) {
					setStatus({ ...status, user: { ...status.user, status: newUser.status } });
				}
			})
			.catch(setError);
	};
	const onResetForm = () => {
		setCurrentPassword(undefined);
		setNewStatus(undefined);
		setError(undefined);
	};
	return <FormBlock className="b-profile-edit" title={localize("Change status")} onSubmit={onSubmit} footer={<>
		<Button
			type="submit" color="primary"
			disabled={!status}
		>{localize("Change")}</Button>
		{((newStatus && newStatus !== user.status) || !!currentPassword) && <Button type="reset" onClick={onResetForm}>{localize("Reset")}</Button>}
	</>}>
		{error && error.message && <Alert>{error.message}</Alert>}
		<Field title={localize("Current password") + ":"} name="current_password" errorResponse={error}>
			<Input
				type="password" name="current_password" placeholder={localize("Current password")}
				value={currentPassword}
				onValueChange={(value) => setCurrentPassword(value)}
				required
			/>
		</Field>
		<Field title={localize("Status") + ":"} errorResponse={error} name="status">
			<Select
				name="status"
				options={{
					"pending": localizeKey("status_pending", "Pending"),
					"active": localizeKey("status_active", "Active"),
					"blocked": localizeKey("status_blocked", "Blocked"),
				}}
				value={newStatus ?? user.status ?? "pending"}
				onValueChange={(value) => setNewStatus(value)}
			/>
		</Field>
	</FormBlock>;
};

type ChangePasswordBlockProps = {
	userID: UserID;
};

const ChangePasswordBlock: FC<ChangePasswordBlockProps> = props => {
	const { userID } = props;
	const { localize } = useContext(LocaleContext);
	const [error, setError] = useState<ErrorResponse>();
	const [form, setForm] = useState<{ [key: string]: string }>({});
	const equalPasswords = form.password === form.password_repeat;
	const onSubmit = (event: any) => {
		event.preventDefault();
		updateUserPassword(userID, {
			current_password: form.current_password,
			password: form.password,
		})
			.then(() => {
				setForm({});
				setError(undefined);
			})
			.catch(setError);
	};
	return <FormBlock title={localize("Change password")} onSubmit={onSubmit} footer={
		<Button
			type="submit" color="primary"
			disabled={!form.current_password || !form.password || !equalPasswords}
		>{localize("Change")}</Button>
	}>
		{error && error.message && <Alert>{error.message}</Alert>}
		<Field title={localize("Current password") + ":"} name="current_password" errorResponse={error}>
			<Input
				type="password" name="current_password" placeholder={localize("Current password")}
				value={form.current_password}
				onValueChange={(value) => setForm({ ...form, current_password: value })}
				required
			/>
		</Field>
		<Field title={localize("New password") + ":"} name="password" errorResponse={error}>
			<Input
				type="password" name="password" placeholder={localize("New password")}
				value={form.password}
				onValueChange={(value) => setForm({ ...form, password: value })}
				required
			/>
		</Field>
		<Field title={localize("Repeat new password") + ":"}>
			<Input
				type="password" name="password_repeat" placeholder={localize("Repeat new password")}
				value={form.password_repeat}
				onValueChange={(value) => setForm({ ...form, password_repeat: value })}
				required
			/>
			{form.password && !equalPasswords && <Alert>{localize("Passwords do not match")}</Alert>}
		</Field>
	</FormBlock>;
};

type ChangeEmailBlockProps = {
	user: User;
	onUpdateUser(user: User): void;
};

const ChangeEmailBlock: FC<ChangeEmailBlockProps> = props => {
	const { user, onUpdateUser } = props;
	const { status } = useContext(AuthContext);
	const { localize } = useContext(LocaleContext);
	const [error, setError] = useState<ErrorResponse>();
	const [email, setEmail] = useState<string>();
	const [currentPassword, setCurrentPassword] = useState<string>();
	const [resendAvailable, setResendAvailable] = useState(true);
	const onSubmit = (event: any) => {
		event.preventDefault();
		if (!email || !currentPassword) {
			return;
		}
		updateUserEmail(user.id, {
			email: email,
			current_password: currentPassword
		})
			.then(newUser => {
				onUpdateUser({ ...user, email: newUser.email });
				setEmail(undefined);
				setError(undefined);
			})
			.catch(setError);
	};
	const onResendEmail = (event: any) => {
		event.preventDefault();
		setResendAvailable(false);
		resendUserEmail(user.id)
			.then(() => setError(undefined))
			.catch(error => {
				setResendAvailable(true);
				setError(error);
			});
	};
	return <FormBlock title={localize("Change email")} onSubmit={onSubmit} footer={
		<Button
			type="submit" color="primary"
			disabled={email === undefined || email === user.email || !currentPassword}
		>{localize("Change")}</Button>
	}>
		{error && error.message && <Alert>{error.message}</Alert>}
		{status?.user?.id === user.id && status.user.status === "pending" && user.email && <Alert kind={AlertKind.INFO}>
			<p>We have sent an email to confirm your email address.
				If the email has not arrived, please check the spelling of your email address and the presence of the letter in the "Spam" folder.</p>
			{resendAvailable && <p>You can also try to <b><a href="#email-resend" onClick={onResendEmail}>resubmit</a></b> the email.</p>}
		</Alert>}
		<Field title={localize("Current password") + ":"} name="current_password" errorResponse={error}>
			<Input
				type="password" name="current_password" placeholder={localize("Current password")}
				value={currentPassword}
				onValueChange={setCurrentPassword}
				required
			/>
		</Field>
		<Field title="E-mail:" name="email" errorResponse={error}>
			<Input
				type="email" name="email" placeholder="E-mail"
				value={email ?? user.email}
				onValueChange={setEmail}
				required
			/>
		</Field>
	</FormBlock>;
};

type CurrentSessionsBlockProps = {
	userID: UserID;
};

const CurrentSessionsBlock: FC<CurrentSessionsBlockProps> = props => {
	const { userID } = props;
	const { status } = useContext(AuthContext);
	const { localize, localizeKey } = useContext(LocaleContext);
	const [error, setError] = useState<ErrorResponse>();
	const [sessions, setSessions] = useState<Sessions>();
	const [deletedSessions, setDeletedSessions] = useState<{ [key: number]: boolean }>();
	useEffect(() => {
		observeUserSessions(userID)
			.then(sessions => {
				setSessions(sessions);
				setDeletedSessions({});
				setError(undefined);
			})
			.catch(setError);
	}, [userID]);
	const onDeleteSession = (session: Session) => {
		deleteSession(session.id)
			.then((session: Session) => {
				setDeletedSessions({ ...deletedSessions, [session.id]: true });
			})
			.catch(console.log);
	};
	return <Block title={localize("Current sessions")} className="b-current-sessions">{error ?
		<Alert>{error.message}</Alert> :
		<table className="ui-table">
			<thead>
				<tr>
					<th className="id">#</th>
					<th className="created">{localize("Created")}</th>
					<th className="expires">{localize("Expires")}</th>
					<th className="actions">{localize("Actions")}</th>
				</tr>
			</thead>
			<tbody>
				{sessions && sessions.sessions && sessions.sessions.map((session: Session, key: number) => {
					const { id, create_time, expire_time } = session;
					const current = status?.session?.id === id;
					const deleted = !!deletedSessions?.[session.id];
					return <tr key={key} className={`session ${current ? "success" : (deleted ? "deleted" : "")}`}>
						<td className="id">{id}</td>
						<td className="created"><DateTime value={create_time} /></td>
						<td className="expires"><DateTime value={expire_time} /></td>
						<td className="actions">
							{!current && <Button
								disabled={deleted}
								onClick={() => onDeleteSession(session)}
							>{localizeKey("close_session", "Close")}</Button>}
						</td>
					</tr>;
				})}
			</tbody>
		</table>
	}</Block>;
};

const EditUserPage: FC = () => {
	const params = useParams();
	const { user_id } = params;
	const { localize } = useContext(LocaleContext);
	const [user, setUser] = useState<User>();
	const [error, setError] = useState<ErrorResponse>();
	useEffect(() => {
		observeUser(String(user_id))
			.then(user => {
				setUser(user);
				setError(undefined);
			})
			.catch(setError);
	}, [user_id]);
	const { status } = useContext(AuthContext);
	if (error) {
		return <Page title={localize("Error")} sidebar={<Sidebar />}>
			{error.message && <Alert>{error.message}</Alert>}
		</Page>;
	}
	if (!user) {
		return <Page title={localize("Edit user")} sidebar={<Sidebar />}>Loading...</Page>;
	}
	const canUpdateStatus = status?.permissions?.includes("update_user_status");
	const { id, login } = user;
	return <Page title={localize("Edit user") + ": " + login} sidebar={<Sidebar />}>
		<TabsGroup>
			<Block className="b-profile-edit-tabs">
				<Tabs>
					<Tab tab="profile"><Link to={`/users/${login}/edit`}>{localize("Profile")}</Link></Tab>
					<Tab tab="security"><Link to={`/users/${login}/edit/security`}>{localize("Security")}</Link></Tab>
				</Tabs>
			</Block>
			<Routes>
				<Route index element={<TabContent tab="profile" setCurrent>
					<EditUserBlock user={user} onUpdateUser={setUser} />
					{canUpdateStatus && <EditUserStatusBlock user={user} onUpdateUser={setUser} />}
				</TabContent>} />
				<Route path="/security" element={<TabContent tab="security" setCurrent>
					<ChangePasswordBlock userID={id} />
					<ChangeEmailBlock user={user} onUpdateUser={setUser} />
					<CurrentSessionsBlock userID={id} />
				</TabContent>} />
			</Routes>
		</TabsGroup>
	</Page>;
};

export default EditUserPage;
