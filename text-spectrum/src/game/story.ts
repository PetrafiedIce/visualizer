export type Stats = {
  affection: number
}

export type Choice = {
  id: string
  text: string
  next: string
  effects?: Partial<Stats>
  minAffection?: number
}

export type SceneNode = {
  id: string
  speaker?: string
  text: string
  background?: string
  next?: string
  choices?: Choice[]
}

export type StoryData = Record<string, SceneNode>

export const initialStats: Stats = {
  affection: 0,
}

export const storyData: StoryData = {
  intro: {
    id: 'intro',
    speaker: 'Narrator',
    text: 'It is a crisp evening in the city. Neon reflections shimmer across quiet streets as you step into the café.',
    background: 'linear-gradient(120deg, #0b0f1a 0%, #1b1f3a 50%, #0b0f1a 100%)',
    next: 'meet',
  },
  meet: {
    id: 'meet',
    speaker: 'Alex',
    text: 'Hey! I saved you a seat. I was starting to think you wouldn\'t come.',
    background: 'linear-gradient(120deg, #0b0f1a 0%, #152032 50%, #0b0f1a 100%)',
    choices: [
      {
        id: 'compliment',
        text: 'You look great. I\'m really glad to be here.',
        next: 'warmStart',
        effects: { affection: 1 },
      },
      {
        id: 'neutral',
        text: 'Traffic was rough. How\'s your day been?',
        next: 'neutralStart',
      },
      {
        id: 'awkward',
        text: 'Sorry I\'m late. Let\'s just order.',
        next: 'coolStart',
      },
    ],
  },
  warmStart: {
    id: 'warmStart',
    speaker: 'Alex',
    text: 'Thanks… that\'s sweet. I\'ve been looking forward to this.',
    background: 'linear-gradient(120deg, #0b0f1a 0%, #1e2a44 50%, #0b0f1a 100%)',
    next: 'sharedInterests',
  },
  neutralStart: {
    id: 'neutralStart',
    speaker: 'Alex',
    text: 'Not bad! I found a new playlist and it\'s been keeping me going.',
    background: 'linear-gradient(120deg, #0b0f1a 0%, #1b253d 50%, #0b0f1a 100%)',
    next: 'sharedInterests',
  },
  coolStart: {
    id: 'coolStart',
    speaker: 'Alex',
    text: 'Oh—sure. Menus are on the counter.',
    background: 'linear-gradient(120deg, #0b0f1a 0%, #141e30 50%, #0b0f1a 100%)',
    next: 'sharedInterests',
  },
  sharedInterests: {
    id: 'sharedInterests',
    speaker: 'Narrator',
    text: 'The café hums softly. Conversation drifts to music, art, and small adventures.',
    background: 'linear-gradient(120deg, #0b0f1a 0%, #243a5a 50%, #0b0f1a 100%)',
    choices: [
      {
        id: 'askPlaylist',
        text: 'Ask about the playlist they mentioned earlier.',
        next: 'playlist',
        effects: { affection: 1 },
      },
      {
        id: 'shareStory',
        text: 'Share a small, funny story from your week.',
        next: 'storyShare',
      },
    ],
  },
  playlist: {
    id: 'playlist',
    speaker: 'Alex',
    text: 'It\'s mostly indie with a splash of lo-fi. I could send it to you if you\'d like.',
    background: 'linear-gradient(120deg, #0b0f1a 0%, #2a3f63 50%, #0b0f1a 100%)',
    choices: [
      {
        id: 'acceptPlaylist',
        text: 'I\'d like that—thank you.',
        next: 'invite',
        effects: { affection: 1 },
      },
      {
        id: 'declinePlaylist',
        text: 'Maybe later. I\'m picky about playlists.',
        next: 'invite',
      },
    ],
  },
  storyShare: {
    id: 'storyShare',
    speaker: 'Alex',
    text: 'Haha—okay, that\'s actually great. You\'ve got timing.',
    background: 'linear-gradient(120deg, #0b0f1a 0%, #2a4268 50%, #0b0f1a 100%)',
    next: 'invite',
  },
  invite: {
    id: 'invite',
    speaker: 'Narrator',
    text: 'Time drifts. The world feels a little smaller, a little closer.',
    background: 'linear-gradient(120deg, #0b0f1a 0%, #2b4b7d 50%, #0b0f1a 100%)',
    choices: [
      {
        id: 'walk',
        text: 'Invite Alex for a short walk by the river.',
        next: 'walkScene',
        minAffection: 2,
      },
      {
        id: 'goodnight',
        text: 'Say goodnight and offer to text later.',
        next: 'goodnightScene',
      },
    ],
  },
  walkScene: {
    id: 'walkScene',
    speaker: 'Alex',
    text: 'I\'d like that. The river\'s quiet this time of night.',
    background: 'linear-gradient(120deg, #0b0f1a 0%, #1d3354 50%, #0b0f1a 100%)',
    next: 'endingWarm',
  },
  goodnightScene: {
    id: 'goodnightScene',
    speaker: 'Alex',
    text: 'I had a good time. Let\'s talk soon.',
    background: 'linear-gradient(120deg, #0b0f1a 0%, #1b2b4a 50%, #0b0f1a 100%)',
    next: 'endingCool',
  },
  endingWarm: {
    id: 'endingWarm',
    speaker: 'Narrator',
    text: 'Under distant lights, you trade smiles and promises to meet again. A gentle closeness lingers.',
    background: 'linear-gradient(120deg, #0b0f1a 0%, #274472 50%, #0b0f1a 100%)',
  },
  endingCool: {
    id: 'endingCool',
    speaker: 'Narrator',
    text: 'The night winds down with an easy calm. Sometimes, simple is just right.',
    background: 'linear-gradient(120deg, #0b0f1a 0%, #213a61 50%, #0b0f1a 100%)',
  },
}