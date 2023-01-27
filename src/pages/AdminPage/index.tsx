import { FC } from "react";
import { Link, Route, Routes } from "react-router-dom";
import Page from "../../components/Page";
import Block from "../../ui/Block";
import Sidebar from "../../ui/Sidebar";
import { Tab, TabContent, Tabs, TabsGroup } from "../../ui/Tabs";
import { AdminRolesBlock } from "./roles";
import { AdminSettingsBlock } from "./settings";

import "./index.scss";

const AdminTabs: FC = () => {
    return <Block className="b-admin-tabs">
        <Tabs>
            {<Tab tab="settings">
                <Link to={`/admin/settings`}>Settings</Link>
            </Tab>}
            {<Tab tab="roles">
                <Link to={`/admin/roles`}>Roles</Link>
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

const AdminPage: FC = () => {
    return <Page title={`Admin`} sidebar={<Sidebar />}>
        <TabsGroup>
            <AdminTabs />
            <Routes>
                <Route path="/settings" element={<AdminSettingsTab />} />
                <Route path="/roles" element={<AdminRolesTab />} />
            </Routes>
        </TabsGroup>
    </Page>;
};

export default AdminPage;
