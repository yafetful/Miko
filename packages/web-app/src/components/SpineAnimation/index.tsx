import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Application, Assets } from 'pixi.js';
import { Spine } from '@esotericsoftware/spine-pixi-v8';
import { Howl } from 'howler';
import { DuotoneIcon } from '../DuotoneIcon';
import { SpineAnimationProps, SoundType } from './types';
import { getCharacters, ANIMATIONS, ANIMATION_CONFIG, SOUNDS } from './constants';
import { CHARACTER_SETS } from './characterSets';
import { SpineControls } from './SpineControls';

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
    if (appRef.current?.canvas) {
      const canvas = appRef.current.canvas as HTMLCanvasElement;
      
      if (containerRef.current && canvas.parentNode === containerRef.current) {
        containerRef.current.removeChild(canvas);
      }
    }

    appRef.current?.destroy(true);
    appRef.current = null;

    spineboysRef.current = [];

    Object.values(soundsRef.current).forEach(sound => sound?.unload());
    soundsRef.current = {
      [SOUNDS.HEY]: null,
      [SOUNDS.HUH]: null,
      [SOUNDS.PLUH]: null
    };
    
    audioInitialized.current = false;
  };

  const initApp = async () => {
    if (!containerRef.current) return;

    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    await new Promise(resolve => requestAnimationFrame(resolve));

    const containerWidth = containerRef.current.getBoundingClientRect().width;

    const app = new Application();
    appRef.current = app;

    containerRef.current.style.backgroundColor = 'transparent';

    await app.init({
      width: containerWidth,
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

    app.canvas.style.opacity = '0';
    containerRef.current.appendChild(app.canvas);
    
    requestAnimationFrame(() => {
      if (app.canvas) {
        app.canvas.style.opacity = '1';
        app.canvas.style.transition = 'opacity 0.3s';
      }
    });

    const characterSet = CHARACTER_SETS[currentCharacterSet];
    const spineAssets = characterSet.assets;
    const config = characterSet.config;

    Assets.add(spineAssets.data);
    Assets.add(spineAssets.atlas);
    await Assets.load([spineAssets.data.alias, spineAssets.atlas.alias]);

    const characters = getCharacters(currentCharacterSet);
    characters.forEach((char, index) => {
      const spineboy = Spine.from({
        atlas: spineAssets.atlas.alias,
        skeleton: spineAssets.data.alias,
        scale: config.scale,
      });

      spineboy.x = -140;

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

      app.stage.addChild(spineboy);
      spineboysRef.current.push(spineboy);
      playEnterAnimation();
    });

    return () => {
      window.removeEventListener('character-input', handleCharacterInput as EventListener);
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

    if (appRef.current?.canvas) {
      appRef.current.canvas.style.transition = 'opacity 0.3s';
      appRef.current.canvas.style.opacity = '0';
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    cleanup();
  };

  const playEnterAnimation = async () => {
    if (!appRef.current) return;
    
    const characterSet = CHARACTER_SETS[currentCharacterSet];
    const config = characterSet.config;
    const characters = getCharacters(currentCharacterSet);
    
    spineboysRef.current.forEach((spineboy, index) => {
      spineboy.x = -ANIMATION_CONFIG.OFFSCREEN_OFFSET - ANIMATION_CONFIG.CHARACTER_SPACING;
      spineboy.scale.x = Math.abs(spineboy.scale.x);
      const walkTrack = spineboy.state.setAnimation(0, ANIMATIONS.WALK, true);
      if (walkTrack) {
        walkTrack.timeScale = config.walkSpeed;
      }
    });
    
    const totalWidth = characters.length * ANIMATION_CONFIG.CHARACTER_SPACING;
    const finalStartX = (appRef.current.screen.width - totalWidth) / 2 + ANIMATION_CONFIG.CHARACTER_SPACING;
    
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
        initApp();
        audioInitialized.current = false;
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
      position: 'relative'
    }}>
      <Box 
        ref={containerRef}
        sx={{ 
          flex: 1,
          height: '100%',
          visibility: isActive ? 'visible' : 'hidden',
          overflow: 'visible',
          display: 'flex',
          justifyContent: 'center',
          width: '100%'
        }} 
      />
      
      <SpineControls 
        isActive={isActive}
        isSoundEnabled={isSoundEnabled}
        currentCharacterSet={currentCharacterSet}
        onToggleCharacter={toggleCharacter}
        onToggleSound={toggleSound}
        onToggleActive={toggleActive}
      />
    </Box>
  );
};

export default SpineAnimation; 