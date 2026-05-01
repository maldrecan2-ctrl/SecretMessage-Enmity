import { FormRow, FormSwitch } from 'enmity/components';
import { SettingsStore } from 'enmity/api/settings';
import { React } from 'enmity/metro/common';

interface SettingsProps {
   settings: SettingsStore;
}

export default ({ settings }: SettingsProps) => {
   return <>
      <FormRow
         label='Gelen Mesajları Otomatik Çevir'
         subLabel='Açık olduğunda, karşıdan gelen tüm "krd" gizli mesajları anında Türkçeye çevrilir.'
         trailing={
            <FormSwitch
               value={settings.getBoolean('auto_decrypt', true)}
               onValueChange={(value: boolean) => settings.set('auto_decrypt', value)}
            />
         }
      />
   </>;
};