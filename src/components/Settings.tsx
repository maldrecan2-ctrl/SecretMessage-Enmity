import { FormRow, FormSwitch, FormInput } from 'enmity/components';
import { SettingsStore } from 'enmity/api/settings';
import { React } from 'enmity/metro/common';

interface SettingsProps {
   settings: SettingsStore;
}

export default ({ settings }: SettingsProps) => {
   return <>
      <FormInput
         title="Key"
         placeholder="Input key you shared with your friend"
         value={settings.get('key', 'default') as string}
         onChange={(text) => settings.set('key', text)}
      />
      <FormRow
         label='Enable encryption'
         subLabel='Enable to automatically encrypt outgoing messages and show encrypted placeholders.'
         trailing={
            <FormSwitch
               value={settings.getBoolean('enabled', false)}
               onValueChange={() => settings.toggle('enabled')}
            />
         }
      />
      <FormRow
         label='Auto shorten text'
         subLabel='Shorten encrypted text by replacing specific char.'
         trailing={
            <FormSwitch
               value={settings.getBoolean('shorten_text', true)}
               onValueChange={() => settings.toggle('shorten_text')}
            />
         }
      />
   </>;
};