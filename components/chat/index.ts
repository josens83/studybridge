/**
 * Chat Components - Elite Developer Standards
 *
 * This module exports all chat-related components following
 * the component decomposition principle (Small & Fast).
 *
 * @module Chat
 */

// Core Components
export { ChatHeader } from './ChatHeader';
export { MessageItem } from './MessageItem';
export { MessageInput } from './MessageInput';

// Modals
export {
  LightboxModal,
  ForwardModal,
  GroupSettingsModal,
  DragOverlay,
} from './ChatModals';

// Emoji Components
export { default as EmojiPicker, QuickReactions, MessageReactions } from './EmojiPicker';

// Link Preview
export { default as LinkPreview, extractUrls, renderTextWithLinks } from './LinkPreview';
