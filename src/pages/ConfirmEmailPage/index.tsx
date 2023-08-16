import { FC, useState } from "react";
import { confirmEmail } from "../../api";
import { Navigate, useSearchParams } from "react-router-dom";

const ConfirmEmailPage: FC = () => {
    const [redirect, setRedirect] = useState(false);
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id") || "";
    const secret = searchParams.get("secret") || "";
    confirmEmail(id, secret)
        .then(() => setRedirect(true));
    if (redirect) {
        return <Navigate to={"/"} />;
    }
    return <></>;
};

export default ConfirmEmailPage;
