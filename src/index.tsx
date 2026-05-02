import { Plugin, registerPlugin } from 'enmity/managers/plugins';
import { React, Messages } from 'enmity/metro/common';
import { getByProps } from 'enmity/metro';
import { create } from 'enmity/patcher';
import { getBoolean } from 'enmity/api/settings';
import Settings from './components/Settings';
import manifest from '../manifest.json';
import { encryptMessage, decryptMessage } from './crypto';

const Patcher = create('SecretMessage');

const decryptEmbeds = (embeds: any[]) => {
    if (!Array.isArray(embeds)) return;
    embeds.forEach((embed) => {
        if (embed.rawDescription && typeof embed.rawDescription === 'string' && !embed.rawDescription.includes('\n-# (')) {
            const decrypted = decryptMessage(embed.rawDescription);
            if (decrypted !== embed.rawDescription) {
                embed.rawDescription = `${embed.rawDescription}\n-# (${decrypted})`;
                if (embed.description) embed.description = `${embed.description}\n-# (${decrypted})`;
            }
        } else if (embed.description && typeof embed.description === 'string' && !embed.description.includes('\n-# (')) {
            const decrypted = decryptMessage(embed.description);
            if (decrypted !== embed.description) {
                embed.description = `${embed.description}\n-# (${decrypted})`;
            }
        }
    });
};

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

      const FluxDispatcher = getByProps('dispatch', 'subscribe');
      if (FluxDispatcher) {
          Patcher.before(FluxDispatcher, 'dispatch', (self, args) => {
              const event = args[0];
              if (!event) return;
              
              if (getBoolean('SecretMessage', 'auto_decrypt', true)) {
                  if (event.type === 'MESSAGE_CREATE' || event.type === 'MESSAGE_UPDATE') {
                      if (event.message && typeof event.message.content === 'string') {
                          if (!event.message.content.includes('\n-# (')) {
                              const decrypted = decryptMessage(event.message.content);
                              if (decrypted !== event.message.content) {
                                  event.message.content = `${event.message.content}\n-# (${decrypted})`;
                              }
                          }
                      }
                      if (event.message && event.message.embeds) {
                          decryptEmbeds(event.message.embeds);
                      }
                  } else if (event.type === 'LOAD_MESSAGES_SUCCESS') {
                      if (Array.isArray(event.messages)) {
                          event.messages.forEach((m: any) => {
                              if (m && typeof m.content === 'string') {
                                  if (!m.content.includes('\n-# (')) {
                                      const decrypted = decryptMessage(m.content);
                                      if (decrypted !== m.content) {
                                          m.content = `${m.content}\n-# (${decrypted})`;
                                      }
                                  }
                              }
                              if (m && m.embeds) {
                                  decryptEmbeds(m.embeds);
                              }
                          });
                      }
                  }
              }
          });
      }
   },

   onStop() {
      Patcher.unpatchAll();
   },

   getSettingsPanel({ settings }) {
      return <Settings settings={settings} />;
   }
};

registerPlugin(SecretMessage);
