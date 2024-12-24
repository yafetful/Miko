import { CharacterSet } from './types';

export const CHARACTER_SETS: Record<string, CharacterSet> = {
  pengu: {
    name: 'Pengu',
    assets: {
      data: {
        alias: "penguData",
        src: "/assets/atlas/pengu/Characters.json"
      },
      atlas: {
        alias: "penguAtlas",
        src: "/assets/atlas/pengu/Characters.atlas"
      }
    },
    config: {
      scale: 0.2,
      yOffset: 12,
      defaultMix: 0.2,
      walkSpeed: 1.5,
      animationSpeed: 2.0,
    },
    sounds: {
      HEY: {
        src: '/assets/atlas/pengu/Hurting.mp3',
        volume: 0.3,
        preload: true
      },
      HUH: {
        src: '/assets/atlas/pengu/huh.mp3',
        volume: 0.6,
        preload: true
      },
      PLUH: {
        src: '/assets/atlas/pengu/pluh.mp3',
        volume: 0.6,
        preload: true
      }
    }
  },
  capybara: {
    name: 'Capybara',
    assets: {
      data: {
        alias: "capybaraData",
        src: "/assets/atlas/capybara/Characters.json"
      },
      atlas: {
        alias: "capybaraAtlas",
        src: "/assets/atlas/capybara/Characters.atlas"
      }
    },
    config: {
      scale: 0.2,
      yOffset: 6,
      defaultMix: 0.2,
      walkSpeed: 1.2,
      animationSpeed: 1.8,
    },
    sounds: {
      HEY: {
        src: '/assets/atlas/capybara/Hey.mp3',
        volume: 0.3,
        preload: true
      },
      HUH: {
        src: '/assets/atlas/capybara/huh.mp3',
        volume: 0.6,
        preload: true
      },
      PLUH: {
        src: '/assets/atlas/capybara/pluh.mp3',
        volume: 0.6,
        preload: true
      }
    }
  }
}; 