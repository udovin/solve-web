import { FC, useEffect, useState } from "react";
import { Link, Route, Routes, useParams } from "react-router-dom";
import Page from "../../components/Page";
import Block from "../../ui/Block";
import Sidebar from "../../ui/Sidebar";
import Alert from "../../ui/Alert";
import { Tab, TabContent, Tabs, TabsGroup } from "../../ui/Tabs";
import { AdminRolesBlock } from "./roles";
import { AdminSettingsBlock } from "./settings";
import { AdminScopeBlock, AdminScopesBlock } from "./scopes";
import { AdminGroupBlock, AdminGroupsBlock } from "./groups";
import { ErrorResponse, Group, observeGroup, observeScope, Scope } from "../../api";
import { useLocale } from "../../ui/Locale";
import { useAuth } from "../../ui/Auth";

import "./index.scss";

const AdminTabs: FC = () => {
    const { localize } = useLocale();
    const { status } = useAuth();
    const canObserveSettings = status?.permissions?.includes("observe_settings");
    const canObserveRoles = status?.permissions?.includes("observe_roles");
    const canObserveScopes = status?.permissions?.includes("observe_scopes");
    const canObserveGroups = status?.permissions?.includes("observe_groups");
    return <Block className="b-admin-tabs">
        <Tabs>
            {canObserveSettings && <Tab tab="settings">
                <Link to={`/admin/settings`}>{localize("Settings")}</Link>
            </Tab>}
            {canObserveRoles && <Tab tab="roles">
                <Link to={`/admin/roles`}>{localize("Roles")}</Link>
            </Tab>}
            {canObserveScopes && <Tab tab="scopes">
                <Link to={`/admin/scopes`}>{localize("Scopes")}</Link>
            </Tab>}
            {canObserveGroups && <Tab tab="groups">
                <Link to={`/admin/groups`}>{localize("Groups")}</Link>
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
    }, [scope_id]);
    return <TabContent tab="scopes" setCurrent>
        {error && <Alert>{error.message}</Alert>}
        {scope && <AdminScopeBlock scope={scope} />}
    </TabContent>;
};

const AdminGroupsTab: FC = () => {
    return <TabContent tab="groups" setCurrent>
        <AdminGroupsBlock />
    </TabContent>;
};

const AdminGroupTab: FC = () => {
    const { group_id } = useParams();
    const [group, setGroup] = useState<Group>();
    const [error, setError] = useState<ErrorResponse>();
    useEffect(() => {
        observeGroup(Number(group_id))
            .then(group => {
                setGroup(group);
                setError(undefined);
            })
            .catch(setError);
    }, [group_id]);
    return <TabContent tab="groups" setCurrent>
        {error && <Alert>{error.message}</Alert>}
        {group && <AdminGroupBlock group={group} />}
    </TabContent>;
};

const AdminPage: FC = () => {
    const { localize } = useLocale();
    return <Page title={localize("Admin")} sidebar={<Sidebar />}>
        <TabsGroup>
            <AdminTabs />
            <Routes>
                <Route path="/settings" element={<AdminSettingsTab />} />
                <Route path="/roles" element={<AdminRolesTab />} />
                <Route path="/scopes/:scope_id" element={<AdminScopeTab />} />
                <Route path="/scopes" element={<AdminScopesTab />} />
                <Route path="/groups" element={<AdminGroupsTab />} />
                <Route path="/groups/:group_id" element={<AdminGroupTab />} />
                <Route path="" element={<TabContent tab="" setCurrent />} />
            </Routes>
        </TabsGroup>
    </Page>;
};

export default AdminPage;
