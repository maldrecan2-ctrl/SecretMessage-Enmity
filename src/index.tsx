import { Plugin, registerPlugin } from 'enmity/managers/plugins';
import { Messages, Dialog, Toasts } from 'enmity/metro/common';
import { registerCommands, unregisterCommands, ApplicationCommandType, ApplicationCommandInputType, ApplicationCommandOptionType } from 'enmity/api/commands';
import manifest from '../manifest.json';
import { encryptMessage, decryptMessage } from './crypto';

const SecretMessage: Plugin = {
   ...manifest,

   onStart() {
      registerCommands('SecretMessage', [
         {
            id: 'secret-send-cmd',
            name: 'gizli',
            displayName: 'gizli',
            description: 'Mesajınızı gizli Vencord diliyle (krd) gönderir.',
            displayDescription: 'Mesajınızı gizli Vencord diliyle (krd) gönderir.',
            type: ApplicationCommandType.Chat,
            inputType: ApplicationCommandInputType.BuiltIn,
            options: [
               {
                  name: 'mesaj',
                  displayName: 'mesaj',
                  description: 'Gizlenecek mesajınız',
                  displayDescription: 'Gizlenecek mesajınız',
                  type: ApplicationCommandOptionType.String,
                  required: true
               }
            ],
            execute: function (args, message) {
               const textObj = args.find(a => a.name === 'mesaj');
               if (textObj && textObj.value && message && message.channel_id) {
                   const encrypted = encryptMessage(textObj.value);
                   Messages.sendMessage(message.channel_id, { content: encrypted });
               }
            }
         },
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
      unregisterCommands('SecretMessage');
   }
};

registerPlugin(SecretMessage);
