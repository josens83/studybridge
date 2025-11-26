'use client';

import { useState } from 'react';

const EMOJI_CATEGORIES = {
  'frequently': ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥'],
  'smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😋', '😛', '🤪', '😎', '🤩', '🥳'],
  'gestures': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '👏', '🙌', '👐', '🤲', '🙏', '💪', '🦾'],
  'hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
  'objects': ['🎉', '🎊', '🎁', '🏆', '🥇', '⭐', '🌟', '💫', '✨', '🔥', '💯', '💢', '💥', '💦', '💨'],
};

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>('frequently');

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-72">
      {/* Category Tabs */}
      <div className="flex border-b border-gray-200 px-2 pt-2">
        {Object.keys(EMOJI_CATEGORIES).map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category as keyof typeof EMOJI_CATEGORIES)}
            className={`px-3 py-2 text-xs font-medium rounded-t-lg transition ${
              activeCategory === category
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {category === 'frequently' && '⭐'}
            {category === 'smileys' && '😀'}
            {category === 'gestures' && '👍'}
            {category === 'hearts' && '❤️'}
            {category === 'objects' && '🎉'}
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="p-2 max-h-48 overflow-y-auto">
        <div className="grid grid-cols-8 gap-1">
          {EMOJI_CATEGORIES[activeCategory].map((emoji, index) => (
            <button
              key={index}
              onClick={() => {
                onSelect(emoji);
                onClose();
              }}
              className="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 rounded transition"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Quick reaction bar for messages
export function QuickReactions({ onSelect }: { onSelect: (emoji: string) => void }) {
  const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

  return (
    <div className="flex items-center gap-1 bg-white shadow-sm rounded-full border border-gray-200 px-2 py-1">
      {quickEmojis.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          className="w-7 h-7 flex items-center justify-center text-lg hover:bg-gray-100 rounded-full transition"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

// Display reactions on a message
interface MessageReactionsProps {
  reactions: Record<string, string[]>;
  currentUserId: string;
  onToggle: (emoji: string) => void;
}

export function MessageReactions({ reactions, currentUserId, onToggle }: MessageReactionsProps) {
  if (!reactions || Object.keys(reactions).length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Object.entries(reactions).map(([emoji, userIds]) => {
        const hasReacted = userIds.includes(currentUserId);
        return (
          <button
            key={emoji}
            onClick={() => onToggle(emoji)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition ${
              hasReacted
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            <span>{emoji}</span>
            <span className="font-medium">{userIds.length}</span>
          </button>
        );
      })}
    </div>
  );
}
