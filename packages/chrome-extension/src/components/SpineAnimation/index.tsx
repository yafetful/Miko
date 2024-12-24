import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Application, Assets } from 'pixi.js';
import '@pixi/unsafe-eval'
import { Spine } from '@esotericsoftware/spine-pixi-v7'
import { Howl } from 'howler';
import { DuotoneIcon } from '../DuotoneIcon';
import { SpineAnimationProps, SoundType } from './types';
import { getCharacters, punctuationMap, ANIMATIONS, ANIMATION_CONFIG, SOUNDS } from './constants';
import { CHARACTER_SETS } from './characterSets';

export const SpineAnimation: React.FC<SpineAnimationProps> = ({ onKeyDown }) => {
  const [isActive, setIsActive] = useState(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [currentCharacterSet, setCurrentCharacterSet] = useState('pengu');
  const [isChangingCharacter, setIsChangingCharacter] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const spineboysRef = useRef<Spine[]>([]);
  const audioInitialized = useRef(false);

  const soundsRef = useRef<Record<SoundType, Howl | null>>({
    [SOUNDS.HEY]: null,
    [SOUNDS.HUH]: null,
    [SOUNDS.PLUH]: null
  });

  const initAudio = () => {
    if (!audioInitialized.current) {
      const characters = getCharacters(currentCharacterSet);
      characters.forEach(char => {
        if (!soundsRef.current[char.sound as SoundType]) {
          const sound = new Howl({
            src: Array.isArray(char.soundAsset.src) ? char.soundAsset.src : [char.soundAsset.src],
            volume: char.soundAsset.volume,
            preload: true,
            format: ['mp3', 'webm'],
            mute: !isSoundEnabled,
          });
          soundsRef.current[char.sound as SoundType] = sound;
        }
      });
      audioInitialized.current = true;
    }
  };

  const convertToPunctuation = (char: string): string => {
    return punctuationMap[char] || char;
  };

  const triggerAnimation = (key: string) => {
    const normalizedKey = key.toLowerCase();
    const characters = getCharacters(currentCharacterSet);
    
    const characterIndex = characters.findIndex(char => 
      char.keys.includes(normalizedKey)
    );
    
    if (characterIndex !== -1) {
      const spineboy = spineboysRef.current[characterIndex];
      const character = characters[characterIndex];
      
      if (spineboy) {
        initAudio();
        const animation = spineboy.state.setAnimation(0, character.animation, false);
        if (animation) {
          animation.timeScale = 2.0;
        }
        soundsRef.current[character.sound as SoundType]?.play();
      }
    }
  };

  const handleCharacterInput = (e: CustomEvent) => {
    const { char } = e.detail;
    if (!char) return;
    triggerAnimation(char);
  };

  const toggleSound = () => {
    const newSoundEnabled = !isSoundEnabled;
    setIsSoundEnabled(newSoundEnabled);
    Object.values(soundsRef.current).forEach(sound => {
      if (sound) sound.mute(!newSoundEnabled);
    });
  };

  const toggleCharacter = async () => {
    const nextCharacter = currentCharacterSet === 'pengu' ? 'capybara' : 'pengu';
    await playExitAnimation();
    cleanup();
    await new Promise(resolve => setTimeout(resolve, 100));
    setIsChangingCharacter(true);
    setCurrentCharacterSet(nextCharacter);
  };

  const toggleActive = async () => {
    if (!isActive) {
      setIsActive(true);
      await playEnterAnimation();
    } else {
      await playExitAnimation();
      setIsActive(false);
    }
  };

  const cleanup = () => {
    if (appRef.current) {
      if (appRef.current.view) {
        (appRef.current.view as HTMLCanvasElement).style.opacity = '0';
        (appRef.current.view as HTMLCanvasElement).style.visibility = 'hidden';
      }

      requestAnimationFrame(() => {
        if (containerRef.current && appRef.current?.view.parentNode === containerRef.current) {
          containerRef.current.removeChild(appRef.current.view as HTMLCanvasElement);
        }
        appRef.current?.destroy(true);
        appRef.current = null;

        spineboysRef.current = [];
        Object.values(soundsRef.current).forEach(sound => {
          if (sound) {
            sound.unload();
          }
        });
        soundsRef.current = {
          [SOUNDS.HEY]: null,
          [SOUNDS.HUH]: null,
          [SOUNDS.PLUH]: null
        };
        audioInitialized.current = false;
      });
    }
  };

  const initApp = async () => {
    cleanup();
    if (!containerRef.current) return;

    const app = new Application({
      width: 600,
      height: 80,
      backgroundColor: 0x000000,
      backgroundAlpha: 0,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: true,
      powerPreference: 'high-performance',
      clearBeforeRender: true,
      preserveDrawingBuffer: false,
    });
    
    appRef.current = app;

    containerRef.current.style.backgroundColor = 'transparent';
    
    (app.view as HTMLCanvasElement).style.opacity = '0';
    containerRef.current.appendChild(app.view as HTMLCanvasElement);
    
    requestAnimationFrame(() => {
      if (app.view) {
        (app.view as HTMLCanvasElement).style.opacity = '1';
        (app.view as HTMLCanvasElement).style.transition = 'opacity 0.3s';
      }
    });

    const characterSet = CHARACTER_SETS[currentCharacterSet];
    const spineAssets = characterSet.assets;
    const config = characterSet.config;

    const assetUrl = (path: string) => chrome.runtime.getURL(path);
    
    Assets.add(spineAssets.data.alias, assetUrl(spineAssets.data.src));
    Assets.add(spineAssets.atlas.alias, assetUrl(spineAssets.atlas.src));
    // Assets.add({
    //   [spineAssets.data.alias]: assetUrl(spineAssets.data.src),
    //   [spineAssets.atlas.alias]: assetUrl(spineAssets.atlas.src)
    // });
    
    await Assets.load([spineAssets.data.alias, spineAssets.atlas.alias]);

    const characters = getCharacters(currentCharacterSet);
    characters.forEach((char, index) => {
      const spineboy = Spine.from({
        atlas: spineAssets.atlas.alias,
        skeleton: spineAssets.data.alias,
        scale: config.scale,
      });

      const totalWidth = characters.length * ANIMATION_CONFIG.CHARACTER_SPACING;
      const startX = (app.screen.width - totalWidth) / 2;
      spineboy.x = startX + index * ANIMATION_CONFIG.CHARACTER_SPACING;

      spineboy.y = app.screen.height + config.yOffset;
      
      spineboy.scale.x = 1 * char.direction;
      spineboy.state.data.defaultMix = config.defaultMix;
      spineboy.skeleton.setSkinByName(char.skin);
      spineboy.skeleton.setSlotsToSetupPose();

      const idleTrack = spineboy.state.setAnimation(0, ANIMATIONS.IDLE, true);
      if (idleTrack) {
        idleTrack.trackTime = Math.random() * 2;
      }

      spineboy.state.addListener({
        complete: (entry) => {
          if (entry.animation?.name === ANIMATIONS.JUMP || 
              entry.animation?.name === ANIMATIONS.STUN || 
              entry.animation?.name === ANIMATIONS.ROLL) {
            spineboy.state.setAnimation(0, ANIMATIONS.IDLE, true);
          }
        }
      });

      app.stage.addChild(spineboy as any);
      spineboysRef.current.push(spineboy);
    });

    const inputEl = document.createElement('input');
    inputEl.style.cssText = 'position:absolute;opacity:0;pointer-events:none;';
    containerRef.current?.appendChild(inputEl);

    return () => {
      window.removeEventListener('character-input', handleCharacterInput as EventListener);
      containerRef.current?.removeChild(inputEl);
      Object.values(soundsRef.current).forEach(sound => sound?.unload());
      app.destroy();
    };
  };

  const playExitAnimation = async () => {
    if (!appRef.current) return;
    
    const characterSet = CHARACTER_SETS[currentCharacterSet];
    const config = characterSet.config;
    
    const promises = spineboysRef.current.map((spineboy, index) => {
      return new Promise<void>(resolve => {
        const walkTrack = spineboy.state.setAnimation(0, ANIMATIONS.WALK, true);
        if (walkTrack) {
          walkTrack.timeScale = config.walkSpeed;
        }
        
        spineboy.scale.x = Math.abs(spineboy.scale.x);
        
        const targetX = appRef.current!.screen.width + ANIMATION_CONFIG.OFFSCREEN_OFFSET;
        const duration = ANIMATION_CONFIG.ANIMATION_DURATION;
        const startX = spineboy.x;
        const startTime = Date.now();
        
        const animate = () => {
          const now = Date.now();
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          spineboy.x = startX + (targetX - startX) * progress;
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            resolve();
          }
        };
        
        requestAnimationFrame(animate);
      });
    });
    
    await Promise.all(promises);

    if (appRef.current?.view) {
      (appRef.current.view as HTMLCanvasElement).style.transition = 'opacity 0.3s';
      (appRef.current.view as HTMLCanvasElement).style.opacity = '0';
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    cleanup();
  };

  const playEnterAnimation = async () => {
    await initApp();
    if (!appRef.current) return;
    
    const characterSet = CHARACTER_SETS[currentCharacterSet];
    console.log('characterSet', characterSet);
    const config = characterSet.config;
    const characters = getCharacters(currentCharacterSet);
    
    spineboysRef.current.forEach((spineboy, index) => {
      spineboy.x = -ANIMATION_CONFIG.OFFSCREEN_OFFSET;
      spineboy.scale.x = Math.abs(spineboy.scale.x);
      const walkTrack = spineboy.state.setAnimation(0, ANIMATIONS.WALK, true);
      if (walkTrack) {
        walkTrack.timeScale = config.walkSpeed;
      }
    });
    
    const totalWidth = characters.length * ANIMATION_CONFIG.CHARACTER_SPACING;
    const finalStartX = (appRef.current.screen.width - totalWidth) / 2;
    
    const promises = spineboysRef.current.map((spineboy, index) => {
      return new Promise<void>(resolve => {
        const targetX = finalStartX + index * ANIMATION_CONFIG.CHARACTER_SPACING;
        const duration = ANIMATION_CONFIG.ANIMATION_DURATION;
        const startX = spineboy.x;
        const startTime = Date.now();
        
        const animate = () => {
          const now = Date.now();
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          spineboy.x = startX + (targetX - startX) * progress;
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            spineboy.state.setAnimation(0, ANIMATIONS.IDLE, true);
            requestAnimationFrame(() => {
              spineboy.scale.x = 1 * characters[index].direction;
            });
            resolve();
          }
        };
        
        requestAnimationFrame(animate);
      });
    });
    
    await Promise.all(promises);
  };

  useEffect(() => {
    if (isActive) {
      initApp();
      window.addEventListener('character-input', handleCharacterInput as EventListener);

      return () => {
        window.removeEventListener('character-input', handleCharacterInput as EventListener);
        cleanup();
      };
    }
  }, [isActive]);

  useEffect(() => {
    const handleCharacterChange = async () => {
      if (isChangingCharacter) {
        setIsActive(true);
        audioInitialized.current = false;
        await playEnterAnimation();
        initAudio();
        setIsChangingCharacter(false);
      }
    };

    handleCharacterChange();
  }, [currentCharacterSet, isChangingCharacter]);

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      width: '100%',
      height: '80px',
    }}>
      <Box 
        ref={containerRef}
        sx={{ 
          flex: 1,
          height: '100%',
          visibility: isActive ? 'visible' : 'hidden',
        }} 
      />
      
      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        pr: 2,
        ml: 'auto',
      }}>
        {isActive && (
          <>
            <Tooltip title={`Switch to ${currentCharacterSet === 'pengu' ? 'Capybara' : 'Pengu'}`}>
              <IconButton
                onClick={toggleCharacter}
                size="small"
                color="primary"
              >
                <DuotoneIcon 
                  icon="solar:ghost-bold-duotone"
                  size="small"
                />
              </IconButton>
            </Tooltip>

            <Tooltip title={`${isSoundEnabled ? 'Mute' : 'Turn On'}`}>
              <IconButton
                onClick={toggleSound}
                size="small"
                color={isSoundEnabled ? 'primary' : 'default'}
              >
                <DuotoneIcon 
                  icon={isSoundEnabled ? 'solar:volume-loud-bold-duotone' : 'solar:volume-cross-bold-duotone'}
                  size="small"
                />
              </IconButton>
            </Tooltip>
          </>
        )}
        
        <Tooltip title={`${isActive ? 'Hide' : 'Show'}`}>
          <IconButton
            onClick={toggleActive}
            size="small"
            color={isActive ? 'primary' : 'default'}
          >
            <DuotoneIcon 
              icon="solar:cat-bold-duotone"
              size="small"
            />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default SpineAnimation; 