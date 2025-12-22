export interface Emoji {
  emoji: string;
  name: string;
  tags: string[];
  category: string;
}

export const emojiData: Emoji[] = [
  // Smileys & Emotion
  { emoji: '😀', name: 'grinning face', tags: ['smile', 'happy'], category: 'Smileys & Emotion' },
  { emoji: '😃', name: 'grinning face with big eyes', tags: ['happy', 'joy', 'haha'], category: 'Smileys & Emotion' },
  { emoji: '😄', name: 'grinning face with smiling eyes', tags: ['happy', 'joy', 'laugh', 'pleased'], category: 'Smileys & Emotion' },
  { emoji: '😁', name: 'beaming face with smiling eyes', tags: ['happy', 'smile', 'joy'], category: 'Smileys & Emotion' },
  { emoji: '😆', name: 'grinning squinting face', tags: ['happy', 'haha', 'laugh'], category: 'Smileys & Emotion' },
  { emoji: '😅', name: 'grinning face with sweat', tags: ['hot', 'nervous', 'haha'], category: 'Smileys & Emotion' },
  { emoji: '🤣', name: 'rolling on the floor laughing', tags: ['lol', 'laughing', 'rofl'], category: 'Smileys & Emotion' },
  { emoji: '😂', name: 'face with tears of joy', tags: ['laugh', 'cry', 'lmao'], category: 'Smileys & Emotion' },
  { emoji: '🙂', name: 'slightly smiling face', tags: ['smile', 'happy', 'content'], category: 'Smileys & Emotion' },
  { emoji: '🙃', name: 'upside-down face', tags: ['sarcastic', 'silly'], category: 'Smileys & Emotion' },
  { emoji: '😉', name: 'winking face', tags: ['flirt', 'wink'], category: 'Smileys & Emotion' },
  { emoji: '😊', name: 'smiling face with smiling eyes', tags: ['blush', 'proud', 'happy'], category: 'Smileys & Emotion' },
  { emoji: '😇', name: 'smiling face with halo', tags: ['angel', 'innocent'], category: 'Smileys & Emotion' },
  { emoji: '🥰', name: 'smiling face with hearts', tags: ['love', 'crush'], category: 'Smileys & Emotion' },
  { emoji: '😍', name: 'smiling face with heart-eyes', tags: ['love', 'crush'], category: 'Smileys & Emotion' },
  { emoji: '🤩', name: 'star-struck', tags: ['eyes', 'star'], category: 'Smileys & Emotion' },
  { emoji: '😘', name: 'face blowing a kiss', tags: ['flirt', 'love'], category: 'Smileys & Emotion' },
  { emoji: '😗', name: 'kissing face', tags: ['flirt', 'love'], category: 'Smileys & Emotion' },

  // People & Body
  { emoji: '👋', name: 'waving hand', tags: ['goodbye', 'hello', 'wave'], category: 'People & Body' },
  { emoji: '🤚', name: 'raised back of hand', tags: ['highfive', 'stop'], category: 'People & Body' },
  { emoji: '🖐️', name: 'hand with fingers splayed', tags: ['wave', 'hello'], category: 'People & Body' },
  { emoji: '✋', name: 'raised hand', tags: ['stop', 'highfive'], category: 'People & Body' },
  { emoji: '🖖', name: 'vulcan salute', tags: ['spock', 'star trek'], category: 'People & Body' },
  { emoji: '👌', name: 'ok hand', tags: ['perfect', 'good'], category: 'People & Body' },
  { emoji: '🤌', name: 'pinched fingers', tags: ['italian', 'sarcastic'], category: 'People & Body' },
  { emoji: '🤏', name: 'pinching hand', tags: ['small', 'tiny'], category: 'People & Body' },
  { emoji: '✌️', name: 'victory hand', tags: ['peace', 'v'], category: 'People & Body' },
  { emoji: '🤞', name: 'crossed fingers', tags: ['luck', 'hope'], category: 'People & Body' },
  { emoji: '🤟', name: 'love-you gesture', tags: ['i love you'], category: 'People & Body' },
  { emoji: '🤘', name: 'sign of the horns', tags: ['rock on'], category: 'People & Body' },
  { emoji: '🤙', name: 'call me hand', tags: ['shaka'], category: 'People & Body' },
  { emoji: '👍', name: 'thumbs up', tags: ['like', 'good'], category: 'People & Body' },
  { emoji: '👎', name: 'thumbs down', tags: ['dislike', 'bad'], category: 'People & Body' },

  // Animals & Nature
  { emoji: '🐶', name: 'dog face', tags: ['puppy', 'pet'], category: 'Animals & Nature' },
  { emoji: '🐱', name: 'cat face', tags: ['kitten', 'pet'], category: 'Animals & Nature' },
  { emoji: '🐭', name: 'mouse face', tags: ['rodent'], category: 'Animals & Nature' },
  { emoji: '🐹', name: 'hamster face', tags: ['pet', 'rodent'], category: 'Animals & Nature' },
  { emoji: '🐰', name: 'rabbit face', tags: ['bunny', 'pet'], category: 'Animals & Nature' },
  { emoji: '🦊', name: 'fox face', tags: ['cunning'], category: 'Animals & Nature' },
  { emoji: '🐻', name: 'bear face', tags: ['grizzly'], category: 'Animals & Nature' },
  { emoji: '🐼', name: 'panda face', tags: ['bear', 'china'], category: 'Animals & Nature' },
  { emoji: '🐨', name: 'koala', tags: ['bear', 'australia'], category: 'Animals & Nature' },
  { emoji: '🐯', name: 'tiger face', tags: ['cat'], category: 'Animals & Nature' },
  { emoji: '🦁', name: 'lion face', tags: ['cat', 'king'], category: 'Animals & Nature' },

  // Food & Drink
  { emoji: '🍎', name: 'red apple', tags: ['fruit', 'healthy'], category: 'Food & Drink' },
  { emoji: '🍏', name: 'green apple', tags: ['fruit', 'healthy'], category: 'Food & Drink' },
  { emoji: '🍐', name: 'pear', tags: ['fruit'], category: 'Food & Drink' },
  { emoji: '🍊', name: 'tangerine', tags: ['orange', 'fruit'], category: 'Food & Drink' },
  { emoji: '🍋', name: 'lemon', tags: ['fruit', 'sour'], category: 'Food & Drink' },
  { emoji: '🍌', name: 'banana', tags: ['fruit', 'yellow'], category: 'Food & Drink' },
  { emoji: '🍉', name: 'watermelon', tags: ['fruit', 'summer'], category: 'Food & Drink' },
  { emoji: '🍇', name: 'grapes', tags: ['fruit', 'wine'], category: 'Food & Drink' },
  { emoji: '🍓', name: 'strawberry', tags: ['fruit', 'berry'], category: 'Food & Drink' },
  { emoji: '🥝', name: 'kiwi fruit', tags: ['fruit'], category: 'Food & Drink' },
  { emoji: '🍍', name: 'pineapple', tags: ['fruit'], category: 'Food & Drink' },
  { emoji: '🥥', name: 'coconut', tags: ['fruit', 'piña colada'], category: 'Food & Drink' },
  { emoji: '🍔', name: 'hamburger', tags: ['burger', 'fast food'], category: 'Food & Drink' },
  { emoji: '🍕', name: 'pizza', tags: ['fast food', 'italian'], category: 'Food & Drink' },
  { emoji: '🍟', name: 'french fries', tags: ['fast food', 'chips'], category: 'Food & Drink' },

  // Travel & Places
  { emoji: '🚗', name: 'car', tags: ['automobile', 'vehicle'], category: 'Travel & Places' },
  { emoji: '🚕', name: 'taxi', tags: ['uber', 'vehicle'], category: 'Travel & Places' },
  { emoji: '🚙', name: 'jeep', tags: ['suv', 'vehicle'], category: 'Travel & Places' },
  { emoji: '🚌', name: 'bus', tags: ['vehicle', 'public transport'], category: 'Travel & Places' },
  { emoji: '🚎', name: 'trolleybus', tags: ['vehicle', 'public transport'], category: 'Travel & Places' },
  { emoji: '✈️', name: 'airplane', tags: ['flight', 'travel'], category: 'Travel & Places' },
  { emoji: '🚀', name: 'rocket', tags: ['space', 'nasa'], category: 'Travel & Places' },
  { emoji: '🛸', name: 'flying saucer', tags: ['ufo', 'alien'], category: 'Travel & Places' },
  { emoji: '🚁', name: 'helicopter', tags: ['chopper'], category: 'Travel & Places' },

  // Activities
  { emoji: '⚽', name: 'soccer ball', tags: ['football', 'sport'], category: 'Activities' },
  { emoji: '🏀', name: 'basketball', tags: ['sport', 'hoops'], category: 'Activities' },
  { emoji: '🏈', name: 'american football', tags: ['sport', 'nfl'], category: 'Activities' },
  { emoji: '⚾', name: 'baseball', tags: ['sport', 'mlb'], category: 'Activities' },
  { emoji: '🎾', name: 'tennis', tags: ['sport', 'racquet'], category: 'Activities' },
  { emoji: '🏐', name: 'volleyball', tags: ['sport'], category: 'Activities' },
  { emoji: '🎱', name: 'pool 8 ball', tags: ['billiards', 'game'], category: 'Activities' },
  { emoji: '🎳', name: 'bowling', tags: ['sport', 'game'], category: 'Activities' },

  // Objects
  { emoji: '⌚', name: 'watch', tags: ['time', 'accessory'], category: 'Objects' },
  { emoji: '📱', name: 'mobile phone', tags: ['iphone', 'smartphone'], category: 'Objects' },
  { emoji: '💻', name: 'laptop', tags: ['computer', 'macbook'], category: 'Objects' },
  { emoji: '📷', name: 'camera', tags: ['photo', 'picture'], category: 'Objects' },
  { emoji: '💡', name: 'light bulb', tags: ['idea', 'electric'], category: 'Objects' },
  { emoji: '💰', name: 'money bag', tags: ['cash', 'dollar'], category: 'Objects' },
  { emoji: '💎', name: 'gem stone', tags: ['diamond', 'crystal'], category: 'Objects' },

  // Symbols
  { emoji: '❤️', name: 'red heart', tags: ['love'], category: 'Symbols' },
  { emoji: '🧡', name: 'orange heart', tags: ['love'], category: 'Symbols' },
  { emoji: '💛', name: 'yellow heart', tags: ['love'], category: 'Symbols' },
  { emoji: '💚', name: 'green heart', tags: ['love'], category: 'Symbols' },
  { emoji: '💙', name: 'blue heart', tags: ['love'], category: 'Symbols' },
  { emoji: '💜', name: 'purple heart', tags: ['love'], category: 'Symbols' },
  { emoji: '💔', name: 'broken heart', tags: ['sad', 'breakup'], category: 'Symbols' },
  { emoji: '💯', name: 'hundred points', tags: ['100', 'perfect'], category: 'Symbols' },
  { emoji: '🔥', name: 'fire', tags: ['hot', 'lit'], category: 'Symbols' },
  { emoji: '✨', name: 'sparkles', tags: ['glitter', 'magic'], category: 'Symbols' },
];
