export interface EarlyProduct {
  name: string;
  headline: string;
  description: string;
  audience: string;
  imagePath: string;
  imageAlt?: string;
  screenshot?: boolean;
  screenshotCaption?: string;
  giftStatuses?: string[];
  gallery?: { imagePath: string; title: string; description: string; alt: string }[];
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
  headline: 'Coordinate the gifts equally.',
  description: 'Save ideas for gifts you want to receive or give, bring in details from webpages, and keep every gift organized from the first idea to the moment it’s given.',
  audience: 'For parents coordinating gifts with partners, grandparents, and the rest of the family.',
  imagePath: '/images/products/giving-guru-ideas.png',
  screenshot: true,
  imageAlt: 'The Giving Guru gift ideas list with fictional names, gift details, and claim controls.',
  screenshotCaption: 'The Giving Guru · Gift ideas. Fictional names; image edited for privacy.',
  giftStatuses: ['Idea', 'Claimed', 'Purchased', 'Received', 'Wrapped', 'Given'],
  gallery: [
    { imagePath: '/images/products/giving-guru-events.png', title: 'See the balance across your family.', description: 'Bring upcoming occasions together and compare gift counts or spending across recipients, so you can decide what feels fair.', alt: 'Privacy-edited Events screen comparing gift counts for fictional family members.' },
    { imagePath: '/images/products/giving-guru-dashboard.png', title: 'Know who’s giving what.', description: 'See what’s claimed, how much has been spent, and who each person’s gifts are coming from, all within the occasion you’re planning.', alt: 'Privacy-edited birthday dashboard showing claimed gifts, spending, and gift-giver distribution.' },
  ],
  features: [
    { title: 'Keep ideas for giving and receiving', description: 'Build your own wish list and save ideas for other people. Keep inspiration ready before it belongs to a birthday or holiday.' },
    { title: 'Save from a webpage', description: 'Send a product link into the app to capture gift details without retyping. Price and a picture are parsed automatically when the webpage provides them; review and fill in anything missing.' },
    { title: 'Track every gift’s progress', description: 'Manage gifts like inventory: see what’s still an idea, who has claimed it, and what’s purchased, received, wrapped, or given.' },
  ],
  feedbackPrompt: 'How does your family coordinate gifts today, and what would make it easier?',
};
