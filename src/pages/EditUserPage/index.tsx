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
} from "../../api";
import Block from "../../ui/Block";
import FormBlock from "../../components/FormBlock";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import Field from "../../ui/Field";
import Alert from "../../ui/Alert";
import { AuthContext } from "../../AuthContext";
import Sidebar from "../../ui/Sidebar";
import DateTime from "../../ui/DateTime";
import { useParams } from "react-router-dom";

import "./index.scss";

type EditUserBlockProps = {
	user: User;
	onUpdateUser(user: User): void;
};

const EditUserBlock: FC<EditUserBlockProps> = props => {
	const { user, onUpdateUser } = props;
	const [form, setForm] = useState<{ [key: string]: string }>({});
	const [error, setError] = useState<ErrorResponse>();
	const onSubmit = (event: any) => {
		event.preventDefault();
		updateUser(user.id, form)
			.then(user => {
				onUpdateUser(user);
				setForm({});
				setError(undefined);
			})
			.catch(setError);
	};
	const onResetForm = () => {
		setForm({});
		setError(undefined);
	};
	return <FormBlock className="b-profile-edit" title="Edit profile" onSubmit={onSubmit} footer={<>
		<Button
			type="submit" color="primary"
			disabled={!Object.keys(form).length}
		>Change</Button>
		{!!Object.keys(form).length && <Button type="reset" onClick={onResetForm}>Reset</Button>}
	</>}>
		{error && error.message && <Alert>{error.message}</Alert>}
		<Field title="First name:">
			<Input
				type="text" name="first_name" placeholder="First name"
				value={form.first_name ?? user.first_name}
				onValueChange={(value) => setForm({ ...form, first_name: value })}
			/>
			{error && error.invalid_fields && error.invalid_fields["first_name"] && <Alert>{error.invalid_fields["first_name"].message}</Alert>}
		</Field>
		<Field title="Last name:">
			<Input
				type="text" name="last_name" placeholder="Last name"
				value={form.last_name ?? user.last_name}
				onValueChange={(value) => setForm({ ...form, last_name: value })}
			/>
			{error && error.invalid_fields && error.invalid_fields["last_name"] && <Alert>{error.invalid_fields["last_name"].message}</Alert>}
		</Field>
		<Field title="Middle name:">
			<Input
				type="text" name="middle_name" placeholder="Middle name"
				value={form.middle_name ?? user.middle_name}
				onValueChange={(value) => setForm({ ...form, middle_name: value })}
			/>
			{error && error.invalid_fields && error.invalid_fields["middle_name"] && <Alert>{error.invalid_fields["middle_name"].message}</Alert>}
		</Field>
	</FormBlock>;
};

type ChangePasswordBlockProps = {
	userID: UserID;
};

const ChangePasswordBlock: FC<ChangePasswordBlockProps> = props => {
	const { userID } = props;
	const [error, setError] = useState<ErrorResponse>();
	const [form, setForm] = useState<{ [key: string]: string }>({});
	const equalPasswords = form.password === form.password_repeat;
	const onSubmit = (event: any) => {
		event.preventDefault();
		updateUserPassword(userID, {
			old_password: form.old_password,
			password: form.password,
		})
			.then(() => {
				setForm({});
				setError(undefined);
			})
			.catch(setError);
	};
	return <FormBlock title="Change password" onSubmit={onSubmit} footer={
		<Button
			type="submit" color="primary"
			disabled={!form.old_password || !form.password || !equalPasswords}
		>Change</Button>
	}>
		{error && error.message && <Alert>{error.message}</Alert>}
		<Field title="Old password:">
			<Input
				type="password" name="old_password" placeholder="Old password"
				value={form.old_password}
				onValueChange={(value) => setForm({ ...form, old_password: value })}
				required
			/>
			{error && error.invalid_fields && error.invalid_fields["old_password"] && <Alert>{error.invalid_fields["old_password"].message}</Alert>}
		</Field>
		<Field title="New password:">
			<Input
				type="password" name="password" placeholder="New password"
				value={form.password}
				onValueChange={(value) => setForm({ ...form, password: value })}
				required
			/>
			{error && error.invalid_fields && error.invalid_fields["password"] && <Alert>{error.invalid_fields["password"].message}</Alert>}
		</Field>
		<Field title="Repeat new password:">
			<Input
				type="password" name="password_repeat" placeholder="Repeat new password"
				value={form.password_repeat}
				onValueChange={(value) => setForm({ ...form, password_repeat: value })}
				required
			/>
			{form.password && !equalPasswords && <Alert>Passwords does not match</Alert>}
		</Field>
	</FormBlock>;
};

type CurrentSessionsBlockProps = {
	userID: UserID;
};

const CurrentSessionsBlock: FC<CurrentSessionsBlockProps> = props => {
	const { userID } = props;
	const { status } = useContext(AuthContext);
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
	return <Block title="Current sessions" className="b-current-sessions">{error ?
		<Alert>{error.message}</Alert> :
		<table className="ui-table">
			<thead>
				<tr>
					<th className="id">#</th>
					<th className="created">Created</th>
					<th className="expires">Expires</th>
					<th className="actions">Actions</th>
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
							>Close</Button>}
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
	if (error) {
		return <Page title="Error" sidebar={<Sidebar />}>
			{error.message && <Alert>{error.message}</Alert>}
		</Page>;
	}
	if (!user) {
		return <Page title="Edit user" sidebar={<Sidebar />}>Loading...</Page>;
	}
	const { id, login } = user;
	return <Page title={`Edit user: ${login}`} sidebar={<Sidebar />}>
		<EditUserBlock user={user} onUpdateUser={setUser} />
		<ChangePasswordBlock userID={id} />
		<CurrentSessionsBlock userID={id} />
	</Page>;
};

export default EditUserPage;
