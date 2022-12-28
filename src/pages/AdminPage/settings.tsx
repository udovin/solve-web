import { FormEvent, useEffect, useState } from "react";
import { createSetting, deleteSetting, ErrorResponse, observeSettings, Setting, Settings } from "../../api";
import Alert from "../../ui/Alert";
import Block from "../../ui/Block";
import Button from "../../ui/Button";
import Input from "../../ui/Input";

export const AdminSettingsBlock = () => {
    const [settings, setSettings] = useState<Settings>();
    const [form, setForm] = useState<{ [key: string]: string }>({});
    const [error, setError] = useState<ErrorResponse>();
    useEffect(() => {
        observeSettings()
            .then(settings => {
                setSettings(settings);
                setError(undefined);
            })
            .catch(setError)
    }, []);
    const onCreate = (event: FormEvent) => {
        event.preventDefault();
        createSetting({
            key: form.key,
            value: form.value,
        })
            .then(setting => {
                setSettings({ ...settings, settings: [...(settings?.settings ?? []), setting] });
                setForm({});
                setError(undefined);
            })
            .catch(setError);
    };
    return <Block
        title="Settings"
        className="b-admin-settings"
        footer={<form onSubmit={onCreate}>
            <Input name="key"
                value={form.key || ""}
                onValueChange={value => setForm({ ...form, key: value })}
                placeholder="Key"
                required />
            <Input name="value"
                value={form.value || ""}
                onValueChange={value => setForm({ ...form, value: value })}
                placeholder="Value"
                required />
            <Button type="submit">Add</Button>
        </form>}
    >
        {error && <Alert>{error.message}</Alert>}
        <table className="ui-table">
            <thead>
                <tr>
                    <th className="key">Key</th>
                    <th className="value">Value</th>
                    <th className="action">Action</th>
                </tr>
            </thead>
            <tbody>
                {settings?.settings && settings.settings.map((setting: Setting, key: number) => {
                    const onDelete = () => {
                        deleteSetting(setting.key)
                            .then(setting => {
                                const newSettings = [...(settings?.settings ?? [])];
                                const pos = newSettings.findIndex(value => value.key === setting.key);
                                if (pos >= 0) {
                                    newSettings.splice(pos, 1);
                                }
                                setSettings({ ...settings, settings: newSettings });
                                setError(undefined);
                            })
                            .catch(setError);
                    };
                    return <tr key={key}>
                        <td className="key">{setting.key}</td>
                        <td className="value">{setting.value}</td>
                        <td className="action">{<Button onClick={onDelete}>Delete</Button>}</td>
                    </tr>
                })}
            </tbody>
        </table>
    </Block>;
};
