import { Plugin, registerPlugin } from 'enmity/managers/plugins';
import { React, Messages } from 'enmity/metro/common';
import { getByProps } from 'enmity/metro';
import { create } from 'enmity/patcher';
import { getBoolean } from 'enmity/api/settings';
import manifest from '../manifest.json';
import Settings from './components/Settings';
import { encryptMessage, decryptMessage } from './crypto';

const Patcher = create('SecretMessage');

const SecretMessage: Plugin = {
   ...manifest,

   onStart() {
      const FluxDispatcher = getByProps('dispatch', 'subscribe');
      if (FluxDispatcher) {
          Patcher.before(FluxDispatcher, 'dispatch', (self, args) => {
              const event = args[0];
              if (!event) return;
              
              if (event.type === 'MESSAGE_CREATE' || event.type === 'MESSAGE_UPDATE') {
                  if (event.message && typeof event.message.content === 'string') {
                      event.message.content = decryptMessage(event.message.content);
                  }
              } else if (event.type === 'LOAD_MESSAGES_SUCCESS') {
                  if (Array.isArray(event.messages)) {
                      event.messages.forEach((m: any) => {
                          if (m && typeof m.content === 'string') {
                              m.content = decryptMessage(m.content);
                          }
                      });
                  }
              }
          });
      }

      Patcher.before(Messages, 'sendMessage', (self, args) => {
          if (getBoolean('SecretMessage', 'enabled', false) && args[1] && typeof args[1].content === 'string') {
              if (args[1].content.startsWith('*')) {
                  args[1].content = encryptMessage(args[1].content.slice(1));
              }
          }
      });

      Patcher.before(Messages, 'editMessage', (self, args) => {
          if (getBoolean('SecretMessage', 'enabled', false) && args[2] && typeof args[2].content === 'string') {
              if (args[2].content.startsWith('*')) {
                  args[2].content = encryptMessage(args[2].content.slice(1));
              }
          }
      });
   },

   onStop() {
      Patcher.unpatchAll();
   },

   getSettingsPanel({ settings }) {
      return <Settings settings={settings} />;
   }
};

registerPlugin(SecretMessage);
