import { FC, useEffect, useState } from "react";
import Page from "../../components/Page";
import { ErrorResponse, observeUser, User } from "../../api";
import Block from "../../ui/Block";
import Sidebar from "../../ui/Sidebar";
import Field from "../../ui/Field";
import Alert from "../../ui/Alert";
import { useParams } from "react-router-dom";
import { strings } from "../../Locale";

export type UserPageParams = {
	user_id: string;
}

const UserPage: FC = () => {
	const params = useParams();
	const { user_id } = params;
	const [user, setUser] = useState<User>();
	const [error, setError] = useState<ErrorResponse>();
	useEffect(() => {
		observeUser(String(user_id))
			.then(user => {
				setError(undefined);
				setUser(user);
			})
			.catch(error => setError(error));
	}, [user_id]);
	if (error) {
		return <Page title="Error" sidebar={<Sidebar />}>
			{error.message && <Alert>{error.message}</Alert>}
		</Page>;
	}
	if (!user) {
		return <Page title={strings.user} sidebar={<Sidebar />}>Loading...</Page>;
	}
	const { login, email, first_name, last_name, middle_name } = user;
	return <Page title={strings.user + ": " + login} sidebar={<Sidebar />}>
		<Block title={login} className="b-user-profile">
			{email && <Field title="E-mail: "><span>{email}</span></Field>}
			{first_name && <Field title={strings.firstName + ": "}><span>{first_name}</span></Field>}
			{last_name && <Field title={strings.lastName + ": "}><span>{last_name}</span></Field>}
			{middle_name && <Field title={strings.middleName + ": "}><span>{middle_name}</span></Field>}
		</Block>
	</Page>;
};

export default UserPage;
