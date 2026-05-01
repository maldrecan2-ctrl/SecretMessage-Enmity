import { FormRow, FormSwitch } from 'enmity/components';
import { SettingsStore } from 'enmity/api/settings';
import { React } from 'enmity/metro/common';

interface SettingsProps {
   settings: SettingsStore;
}

export default ({ settings }: SettingsProps) => {
   return <>
      <FormRow
         label='Şifrelemeyi Etkinleştir (Vencord Uyumlu)'
         subLabel='Açtığınızda göndereceğiniz mesajlar otomatik olarak gizli Vencord diline (krd) çevrilir.'
         trailing={
            <FormSwitch
               value={settings.getBoolean('enabled', false)}
               onValueChange={(value: boolean) => settings.set('enabled', value)}
            />
         }
      />
   </>;
};