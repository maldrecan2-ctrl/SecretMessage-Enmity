import { Plugin, registerPlugin } from 'enmity/managers/plugins';
import { Messages, Dialog, Toasts } from 'enmity/metro/common';
import { registerCommands, unregisterCommands, ApplicationCommandType } from 'enmity/api/commands';
import { create } from 'enmity/patcher';
import manifest from '../manifest.json';
import { encryptMessage, decryptMessage } from './crypto';

const Patcher = create('SecretMessage');

const SecretMessage: Plugin = {
   ...manifest,

   onStart() {
      Patcher.before(Messages, 'sendMessage', (self, args) => {
          if (args[1] && typeof args[1].content === 'string') {
              if (args[1].content.startsWith('*')) {
                  args[1].content = encryptMessage(args[1].content.slice(1));
              }
          }
      });

      Patcher.before(Messages, 'editMessage', (self, args) => {
          if (args[2] && typeof args[2].content === 'string') {
              if (args[2].content.startsWith('*')) {
                  args[2].content = encryptMessage(args[2].content.slice(1));
              }
          }
      });

      registerCommands('SecretMessage', [
         {
            id: 'secret-translate-cmd',
            name: 'Gizli Mesajı Çevir',
            displayName: 'Gizli Mesajı Çevir',
            description: 'Gelen gizli mesajı Türkçeye çevirir.',
            displayDescription: 'Gelen gizli mesajı Türkçeye çevirir.',
            type: ApplicationCommandType.Message,
            execute: function (args, message) {
               if (message && message.content) {
                  const decrypted = decryptMessage(message.content);
                  if (decrypted !== message.content) {
                      Dialog.show({
                          title: 'Gizli Mesaj',
                          body: decrypted,
                          confirmText: 'Kapat'
                      });
                  } else {
                      Toasts.open({ content: 'Bu mesaj gizli bir dil içermiyor.' });
                  }
               }
            }
         }
      ]);
   },

   onStop() {
      Patcher.unpatchAll();
      unregisterCommands('SecretMessage');
   }
};

registerPlugin(SecretMessage);
