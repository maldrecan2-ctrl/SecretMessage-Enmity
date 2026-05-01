import { Plugin, registerPlugin } from 'enmity/managers/plugins';
import { Messages, Dialog, Toasts } from 'enmity/metro/common';
import { unregisterCommands, ApplicationCommandType } from 'enmity/api/commands';
import { getModule } from 'enmity/metro';
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

      const MessageActionSheet = getModule(m => m.default?.name === 'MessageLongPressActionSheet' || m.default?.name === 'MessageActionSheet' || m.default?.name === 'MessageContextMenu');
      
      if (MessageActionSheet) {
          Patcher.after(MessageActionSheet, 'default', (self, args, res) => {
              const message = args[0]?.message;
              if (!message || !message.content) return res;

              const decrypted = decryptMessage(message.content);
              if (decrypted === message.content) return res; // not encrypted

              const { TouchableOpacity, Text, View } = window.enmity.components || {};
              // Fallback inline styling for the button if FormRow isn't ideal
              const TranslateButton = (
                 <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' }}>
                     <Text style={{ color: '#008b8b', fontSize: 16, fontWeight: 'bold' }} onPress={() => {
                         Dialog.show({
                             title: 'Gizli Mesaj',
                             body: decrypted,
                             confirmText: 'Kapat'
                         });
                     }}>
                         🔓 Gizli Mesajı Çevir
                     </Text>
                 </View>
              );

              // Resilient injection into the React tree
              const inject = (tree: any): boolean => {
                  if (!tree) return false;
                  if (Array.isArray(tree)) {
                      tree.unshift(TranslateButton);
                      return true;
                  }
                  if (tree.props && tree.props.children) {
                      if (Array.isArray(tree.props.children)) {
                          tree.props.children.unshift(TranslateButton);
                          return true;
                      } else {
                          return inject(tree.props.children);
                      }
                  }
                  return false;
              };

              inject(res);
              return res;
          });
      }
   },

   onStop() {
      Patcher.unpatchAll();
      unregisterCommands('SecretMessage');
   }
};

registerPlugin(SecretMessage);
