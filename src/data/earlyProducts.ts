export interface EarlyProduct {
  name: string;
  headline: string;
  description: string;
  audience: string;
  imagePath: string;
  imageAlt?: string;
  screenshot?: boolean;
  report?: { imagePath: string; heading: string; description: string; alt: string };
  photoCredit?: { name: string; url: string };
  plannedFeatures?: { title: string; description: string }[];
  features: { title: string; description: string }[];
  feedbackPrompt: string;
}

export const lineChange: EarlyProduct = {
  name: 'Line Change',
  headline: 'More coaching.',
  description: 'A simpler way for youth sports coaches to keep track of substitutions and fair playing time.',
  audience: 'For volunteer coaches with a full bench and a lot to keep track of.',
  imagePath: '/images/products/line-change-lineup.png',
  screenshot: true,
  report: {
    imagePath: '/images/products/line-change-report.png',
    heading: 'See how playing time adds up.',
    description: 'Review each player’s minutes after the game, with offense and defense time shown side by side. Use the breakdown to spot differences and plan for the next game.',
    alt: 'Line Change game report comparing player minutes with orange offense and blue defense bars.',
  },
  imageAlt: 'Line Change lineup showing players on offense, defense, and the bench with minutes played.',
  plannedFeatures: [
    { title: 'Weather updates', description: 'Let families know about weather-related changes and cancellations.' },
    { title: 'Game reminders', description: 'Help parents keep track of upcoming games and arrival details.' },
    { title: 'Team announcements', description: 'Keep families informed about schedule changes and other team news.' },
  ],
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
