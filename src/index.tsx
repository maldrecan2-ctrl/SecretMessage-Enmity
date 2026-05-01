import { Plugin, registerPlugin } from 'enmity/managers/plugins';
import { React, Messages, Dispatcher } from 'enmity/metro/common';
import { create } from 'enmity/patcher';
import { getBoolean } from 'enmity/api/settings';
import manifest from '../manifest.json';
import Settings from './components/Settings';
import { encryptMessage, decryptMessage } from './crypto';

const Patcher = create('SecretMessage');

const SecretMessage: Plugin = {
   ...manifest,

   onStart() {
      const nodes = Dispatcher._actionHandlers?._dependencyGraph?.nodes || Dispatcher._dependencyGraph?.nodes;
      let MessageStoreActionHandler: any;
      if (nodes) {
         const keys = Object.keys(nodes);
         for (const key of keys) {
            if (nodes[key].name === 'MessageStore') {
               MessageStoreActionHandler = nodes[key].actionHandler;
               break;
            }
         }
      }

      if (MessageStoreActionHandler) {
         Patcher.before(MessageStoreActionHandler, 'LOAD_MESSAGES_SUCCESS', (self, args) => {
             if (args[0] && args[0].messages) {
                 args[0].messages = args[0].messages.map((m: any) => {
                     if (m.content) m.content = decryptMessage(m.content);
                     return m;
                 });
             }
         });

         Patcher.before(MessageStoreActionHandler, 'MESSAGE_CREATE', (self, args) => {
             if (args[0] && args[0].message && args[0].message.content) {
                 args[0].message.content = decryptMessage(args[0].message.content);
             }
         });

         Patcher.before(MessageStoreActionHandler, 'MESSAGE_UPDATE', (self, args) => {
             if (args[0] && args[0].message && args[0].message.content) {
                 args[0].message.content = decryptMessage(args[0].message.content);
             }
         });
      }

      Patcher.before(Messages, 'sendMessage', (self, args) => {
          if (getBoolean('SecretMessage', 'enabled', false) && args[1] && args[1].content) {
              args[1].content = encryptMessage(args[1].content);
          }
      });

      Patcher.before(Messages, 'editMessage', (self, args) => {
          if (getBoolean('SecretMessage', 'enabled', false) && args[2] && args[2].content) {
              args[2].content = encryptMessage(args[2].content);
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
