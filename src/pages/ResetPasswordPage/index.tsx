import { FC, useState } from "react";
import { ErrorResponse, confirmPassword, resetUserPassword } from "../../api";
import { Navigate, useSearchParams } from "react-router-dom";
import Page from "../../components/Page";
import Sidebar from "../../ui/Sidebar";
import FormBlock from "../../components/FormBlock";
import Button from "../../ui/Button";
import Alert, { AlertKind } from "../../ui/Alert";
import Field from "../../ui/Field";
import Input from "../../ui/Input";
import { useLocale } from "../../ui/Locale";

const ResetPasswordPage: FC = () => {
    const [redirect, setRedirect] = useState(false);
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id") || "";
    const secret = searchParams.get("secret") || "";
    const { localize } = useLocale();
    const [form, setForm] = useState<{ [key: string]: string }>({});
    const [error, setError] = useState<ErrorResponse>({ message: "" });
    const [success, setSuccess] = useState(false);
    const equalPasswords = form.password === form.password_repeat;
    const onSendEmail = (event: any) => {
        event.preventDefault();
        resetUserPassword({
            login: form.login,
        })
            .then(() => {
                setError({ message: "" });
                setSuccess(true);
            })
            .catch(error => setError(error));
    };
    const onResetPassword = (event: any) => {
        event.preventDefault();
        confirmPassword(id, secret, form["password"])
            .then(() => {
                setError({ message: "" });
                setRedirect(true);
            })
            .catch(error => setError(error));
    };
    if (redirect) {
        return <Navigate to={"/login"} />;
    }
    if (!id || !secret) {
        return <Page title={localize("Reset password")} sidebar={<Sidebar />}>
            <FormBlock title={localize("Reset password")} onSubmit={onSendEmail} footer={
                <Button type="submit" color="primary" disabled={success}>{localize("Reset")}</Button>
            }>
                {success && <Alert kind={AlertKind.SUCCESS}>The password reset code has been successfully sent to your email address.</Alert>}
                {error.message && <Alert>{error.message}</Alert>}
                <Field title={localize("Username") + ":"}>
                    <Input
                        type="login" name="login" placeholder={localize("Username")}
                        value={form.login}
                        onValueChange={(value) => setForm({ ...form, login: value })}
                        required
                    />
                    {error.invalid_fields && error.invalid_fields["login"] && <Alert>{error.invalid_fields["login"].message}</Alert>}
                </Field>
            </FormBlock>
        </Page>;
    }
    return <Page title={localize("Reset password")} sidebar={<Sidebar />}>
        <FormBlock title={localize("Reset password")} onSubmit={onResetPassword} footer={
            <Button type="submit" color="primary">{localize("Reset")}</Button>
        }>
            {error.message && <Alert>{error.message}</Alert>}
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
        </FormBlock>
    </Page>;
};

export default ResetPasswordPage;
