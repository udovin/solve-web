import { FC, useEffect, useState } from "react";
import { confirmEmail, ErrorResponse } from "../../api";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../ui/Auth";
import Page from "../../components/Page";
import Sidebar from "../../ui/Sidebar";
import Alert from "../../ui/Alert";
import { useLocale } from "../../ui/Locale";

const ConfirmEmailPage: FC = () => {
    const [redirect, setRedirect] = useState(false);
    const [error, setError] = useState<ErrorResponse>();
    const { status, setStatus } = useAuth();
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id") || "";
    const secret = searchParams.get("secret") || "";
    const { localize } = useLocale();
    useEffect(() => {
        confirmEmail(id, secret)
            .then(() => setRedirect(true))
            .catch(setError);
    }, [id, secret]);
    if (redirect) {
        if (status?.user && status.user.status === "pending") {
            setStatus({ ...status, user: { ...status.user, status: "active" } });
        }
        return <Navigate to={"/"} />;
    }
    if (error) {
        return <Page title={localize("Email confirmation")} sidebar={<Sidebar />}>
            {error.message && <Alert>{error.message}</Alert>}
        </Page>;
    }
    return <></>;
};

export default ConfirmEmailPage;
