import { FormRow, FormSwitch, FormInput } from 'enmity/components';
import { SettingsStore } from 'enmity/api/settings';
import { React } from 'enmity/metro/common';

interface SettingsProps {
   settings: SettingsStore;
}

export default ({ settings }: SettingsProps) => {
   return <>
      <FormInput
         title="Gizli Şifre (Key)"
         placeholder="Arkadaşınızla paylaştığınız ortak şifreyi girin"
         value={settings.get('key', 'default') as string}
         onChange={(value: any) => {
            const text = typeof value === 'string' ? value : value?.nativeEvent?.text;
            if (text !== undefined) settings.set('key', text);
         }}
      />
      <FormRow
         label='Şifrelemeyi Etkinleştir'
         subLabel='Açtığınızda göndereceğiniz mesajlar otomatik olarak şifrelenir.'
         trailing={
            <FormSwitch
               value={settings.getBoolean('enabled', false)}
               onValueChange={(value: boolean) => settings.set('enabled', value)}
            />
         }
      />
      <FormRow
         label='Metni Otomatik Kısalt'
         subLabel='Şifrelenmiş metni özel karakterlerle değiştirerek kısaltır.'
         trailing={
            <FormSwitch
               value={settings.getBoolean('shorten_text', true)}
               onValueChange={(value: boolean) => settings.set('shorten_text', value)}
            />
         }
      />
   </>;
};