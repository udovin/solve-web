import { FormEvent, useContext, useEffect, useState } from "react";
import { createSetting, deleteSetting, ErrorResponse, observeSettings, Setting, Settings } from "../../api";
import Alert from "../../ui/Alert";
import Block from "../../ui/Block";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import Input from "../../ui/Input";
import { LocaleContext } from "../../ui/Locale";

export const AdminSettingsBlock = () => {
    const { localize } = useContext(LocaleContext);
    const [settings, setSettings] = useState<Settings>();
    const [form, setForm] = useState<{ [key: string]: string }>({});
    const [error, setError] = useState<ErrorResponse>();
    useEffect(() => {
        observeSettings()
            .then(settings => {
                setSettings(settings);
                setError(undefined);
            })
            .catch(setError);
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
    return <Block title={localize("Settings")} className="b-admin-settings">
        {error && <Alert>{error.message}</Alert>}
        <form onSubmit={onCreate}>
            <Input name="key"
                value={form.key || ""}
                onValueChange={value => setForm({ ...form, key: value })}
                placeholder={localize("Key")}
                required />
            <Input name="value"
                value={form.value || ""}
                onValueChange={value => setForm({ ...form, value: value })}
                placeholder={localize("Value")}
                required />
            <Button type="submit">{localize("Add")}</Button>
        </form>
        <table className="ui-table">
            <thead>
                <tr>
                    <th className="key">{localize("Key")}</th>
                    <th className="value">{localize("Value")}</th>
                    <th className="actions">{localize("Actions")}</th>
                </tr>
            </thead>
            <tbody>
                {settings?.settings && settings.settings.map((setting: Setting, key: number) => {
                    const onDelete = () => {
                        deleteSetting(setting.id)
                            .then(setting => {
                                const newSettings = [...(settings?.settings ?? [])];
                                const pos = newSettings.findIndex(value => value.id === setting.id);
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
                        <td className="actions">{<IconButton kind="delete" onClick={onDelete} />}</td>
                    </tr>
                })}
            </tbody>
        </table>
    </Block>;
};
