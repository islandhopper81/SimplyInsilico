export interface EarlyProduct {
  name: string;
  headline: string;
  description: string;
  audience: string;
  imagePath: string;
  features: { title: string; description: string }[];
  feedbackPrompt: string;
}

export const lineChange: EarlyProduct = {
  name: 'Line Change',
  headline: 'More coaching. Less watching the clock.',
  description: 'A simpler way for youth sports coaches to keep track of substitutions and fair playing time, without typing through the game.',
  audience: 'For volunteer coaches with a full bench and a lot to keep track of.',
  imagePath: '/images/products/line-change.svg',
  features: [
    { title: 'See who needs more time', description: 'Track per-player minutes so playing time decisions have more behind them than a best guess.' },
    { title: 'Keep substitutions simple', description: 'Follow who is playing and track offense and defense time with a sideline-friendly workflow.' },
    { title: 'Leave the connection worries behind', description: 'Designed to work offline, even when the field has no reliable Wi-Fi or cell service.' },
  ],
  feedbackPrompt: 'What sport do you coach, and what makes managing playing time difficult?',
};

export const givingGuru: EarlyProduct = {
  name: 'The Giving Guru',
  headline: 'Thoughtful gifts. A little less juggling.',
  description: 'Bring family gift ideas, plans, and purchases together so birthdays and holidays take fewer messages, fewer spreadsheets, and fewer duplicate gifts.',
  audience: 'For parents coordinating gifts with partners, grandparents, and the rest of the family.',
  imagePath: '/images/products/the-giving-guru.svg',
  features: [
    { title: 'Get everyone on the same list', description: 'Organize ideas by occasion and recipient, and coordinate who is buying what before two people pick the same gift.' },
    { title: 'Keep the surprise intact', description: 'Designed to keep gifts hidden from their recipient while the family coordinates behind the scenes.' },
    { title: 'Keep the bigger picture in view', description: 'Follow gifts from idea to given, and compare gift counts and spending across children.' },
  ],
  feedbackPrompt: 'How does your family coordinate gifts today, and what would make it easier?',
};
