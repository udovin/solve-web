import { FC, ReactNode, useEffect, useState } from "react";
import { Link, Route, Routes, useParams } from "react-router-dom";
import Page from "../../components/Page";
import Sidebar from "../../ui/Sidebar";
import Alert from "../../ui/Alert";
import { Tab } from "../../ui/Tabs";
import { AdminRolesBlock } from "./roles";
import { AdminSettingsBlock } from "./settings";
import { AdminScopeBlock, AdminScopesBlock } from "./scopes";
import { AdminGroupBlock, AdminGroupsBlock } from "./groups";
import { ErrorResponse, Group, observeGroup, observeScope, Scope } from "../../api";
import { useLocale } from "../../ui/Locale";
import { useAuth } from "../../ui/Auth";
import TabsBlock from "../../ui/TabsBlock";

import "./index.scss";

const AdminTabs: FC<{ tab?: string }> = props => {
    const { tab } = props;
    const { localize } = useLocale();
    const { status } = useAuth();
    const canObserveSettings = status?.permissions?.includes("observe_settings");
    const canObserveRoles = status?.permissions?.includes("observe_roles");
    const canObserveScopes = status?.permissions?.includes("observe_scopes");
    const canObserveGroups = status?.permissions?.includes("observe_groups");
    return <TabsBlock value={tab}>
        {canObserveSettings && <Tab value="settings">
            <Link to={`/admin/settings`}>{localize("Settings")}</Link>
        </Tab>}
        {canObserveRoles && <Tab value="roles">
            <Link to={`/admin/roles`}>{localize("Roles")}</Link>
        </Tab>}
        {canObserveScopes && <Tab value="scopes">
            <Link to={`/admin/scopes`}>{localize("Scopes")}</Link>
        </Tab>}
        {canObserveGroups && <Tab value="groups">
            <Link to={`/admin/groups`}>{localize("Groups")}</Link>
        </Tab>}
    </TabsBlock>;
};

const SetValue: FC<{ value?: string, setValue(tab?: string): void, children?: ReactNode }> = props => {
    const { value, setValue, children } = props;
    useEffect(() => setValue(value), [value, setValue]);
    return <>{children}</>
};

type AdminTabProps = {
    setTab(tab?: string): void;
};

const AdminSettingsTab: FC<AdminTabProps> = props => {
    const { setTab } = props;
    return <SetValue value="settings" setValue={setTab}>
        <AdminSettingsBlock />
    </SetValue>;
};

const AdminRolesTab: FC<AdminTabProps> = props => {
    const { setTab } = props;
    return <SetValue value="roles" setValue={setTab}>
        <AdminRolesBlock />
    </SetValue>;
};

const AdminScopesTab: FC<AdminTabProps> = props => {
    const { setTab } = props;
    return <SetValue value="scopes" setValue={setTab}>
        <AdminScopesBlock />
    </SetValue>;
};

const AdminScopeTab: FC<AdminTabProps> = props => {
    const { setTab } = props;
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
    return <SetValue value="scopes" setValue={setTab}>
        {error && <Alert>{error.message}</Alert>}
        {scope && <AdminScopeBlock scope={scope} />}
    </SetValue>;
};

const AdminGroupsTab: FC<AdminTabProps> = props => {
    const { setTab } = props;
    return <SetValue value="groups" setValue={setTab}>
        <AdminGroupsBlock />
    </SetValue>;
};

const AdminGroupTab: FC<AdminTabProps> = props => {
    const { setTab } = props;
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
    return <SetValue value="groups" setValue={setTab}>
        {error && <Alert>{error.message}</Alert>}
        {group && <AdminGroupBlock group={group} />}
    </SetValue>;
};

const AdminPage: FC = () => {
    const { localize } = useLocale();
    const [tab, setTab] = useState<string>();
    return <Page title={localize("Admin")} sidebar={<Sidebar />}>
        <AdminTabs tab={tab} />
        <Routes>
            <Route path="/settings" element={<AdminSettingsTab setTab={setTab} />} />
            <Route path="/roles" element={<AdminRolesTab setTab={setTab} />} />
            <Route path="/scopes/:scope_id" element={<AdminScopeTab setTab={setTab} />} />
            <Route path="/scopes" element={<AdminScopesTab setTab={setTab} />} />
            <Route path="/groups" element={<AdminGroupsTab setTab={setTab} />} />
            <Route path="/groups/:group_id" element={<AdminGroupTab setTab={setTab} />} />
            <Route path="" element={<SetValue setValue={setTab} />} />
        </Routes>
    </Page>;
};

export default AdminPage;
