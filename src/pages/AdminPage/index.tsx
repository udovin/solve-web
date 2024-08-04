import { FC, useContext, useEffect, useState } from "react";
import { Link, Route, Routes, useParams } from "react-router-dom";
import Page from "../../components/Page";
import Block from "../../ui/Block";
import Sidebar from "../../ui/Sidebar";
import Alert from "../../ui/Alert";
import { Tab, TabContent, Tabs, TabsGroup } from "../../ui/Tabs";
import { AdminRolesBlock } from "./roles";
import { AdminSettingsBlock } from "./settings";
import { AdminScopeBlock, AdminScopesBlock } from "./scopes";
import { ErrorResponse, observeScope, Scope } from "../../api";
import { LocaleContext } from "../../ui/Locale";

import "./index.scss";

const AdminTabs: FC = () => {
    const { localize } = useContext(LocaleContext);
    return <Block className="b-admin-tabs">
        <Tabs>
            {<Tab tab="settings">
                <Link to={`/admin/settings`}>{localize("Settings")}</Link>
            </Tab>}
            {<Tab tab="roles">
                <Link to={`/admin/roles`}>{localize("Roles")}</Link>
            </Tab>}
            {<Tab tab="scopes">
                <Link to={`/admin/scopes`}>{localize("Scopes")}</Link>
            </Tab>}
        </Tabs>
    </Block>;
};

const AdminSettingsTab: FC = () => {
    return <TabContent tab="settings" setCurrent>
        <AdminSettingsBlock />
    </TabContent>;
};

const AdminRolesTab: FC = () => {
    return <TabContent tab="roles" setCurrent>
        <AdminRolesBlock />
    </TabContent>;
};

const AdminScopesTab: FC = () => {
    return <TabContent tab="scopes" setCurrent>
        <AdminScopesBlock />
    </TabContent>;
};

const AdminScopeTab: FC = () => {
    const { scope_id } = useParams();
    const [scope, setScope] = useState<Scope>();
    const [error, setError] = useState<ErrorResponse>();
    useEffect(() => {
        observeScope(Number(scope_id))
            .then(scope => {
                setScope(scope);
                setError(undefined);
            })
            .catch(setError);
    }, [scope_id])
    return <TabContent tab="scopes" setCurrent>
        {error && <Alert>{error.message}</Alert>}
        {scope && <AdminScopeBlock scope={scope} />}
    </TabContent>;
};

const AdminPage: FC = () => {
    const { localize } = useContext(LocaleContext);
    return <Page title={localize("Admin")} sidebar={<Sidebar />}>
        <TabsGroup>
            <AdminTabs />
            <Routes>
                <Route path="/settings" element={<AdminSettingsTab />} />
                <Route path="/roles" element={<AdminRolesTab />} />
                <Route path="/scopes/:scope_id" element={<AdminScopeTab />} />
                <Route path="/scopes" element={<AdminScopesTab />} />
                <Route path="" element={<TabContent tab="" setCurrent />} />
            </Routes>
        </TabsGroup>
    </Page>;
};

export default AdminPage;
