/**
 * Sallie Avatar with Animations
 * Complete implementation of the avatar system with breathing, blinking, thinking animations
 */

'use client';

import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';
import { designTokens } from '@/lib/design-tokens';

interface AvatarProps {
  limbicState: {
    trust: number;
    warmth: number;
    arousal: number;
    valence: number;
    posture?: 'COMPANION' | 'COPILOT' | 'PEER' | 'EXPERT';
  };
  isThinking?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showAura?: boolean;
  interactive?: boolean;
}

export function SallieAvatar({
  limbicState,
  isThinking = false,
  size = 'lg',
  showAura = true,
  interactive = true,
}: AvatarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [blinkState, setBlinkState] = useState(false);
  const auraControls = useAnimation();
  const coreControls = useAnimation();
  const particleControls = useAnimation();

  // Size mapping
  const sizeMap = {
    sm: 80,
    md: 120,
    lg: 200,
    xl: 300,
  };
  const avatarSize = sizeMap[size];

  // Color mapping based on limbic state
  const getTrustColor = (trust: number) => {
    const colors = designTokens.colors.trust;
    if (trust > 0.8) return colors[500];
    if (trust > 0.6) return colors[600];
    return colors[700];
  };

  const getWarmthColor = (warmth: number) => {
    const colors = designTokens.colors.warmth;
    if (warmth > 0.7) return colors[400];
    if (warmth > 0.5) return colors[500];
    return colors[600];
  };

  const getArousalColor = (arousal: number) => {
    const colors = designTokens.colors.arousal;
    if (arousal > 0.7) return colors[400];
    if (arousal > 0.5) return colors[500];
    return colors[600];
  };

  // Breathing animation
  useEffect(() => {
    const breathe = async () => {
      while (true) {
        // Inhale
        await coreControls.start({
          scale: 1.05,
          transition: { duration: 3, ease: 'easeInOut' },
        });
        // Exhale
        await coreControls.start({
          scale: 1.0,
          transition: { duration: 3, ease: 'easeInOut' },
        });
      }
    };
    breathe();
  }, [coreControls]);

  // Blinking animation
  useEffect(() => {
    const blink = () => {
      setBlinkState(true);
      setTimeout(() => setBlinkState(false), 150);
    };

    // Random blink every 3-7 seconds
    const blinkInterval = setInterval(
      blink,
      3000 + Math.random() * 4000
    );

    return () => clearInterval(blinkInterval);
  }, []);

  // Thinking animation
  useEffect(() => {
    if (isThinking) {
      particleControls.start({
        opacity: [0.3, 0.8, 0.3],
        scale: [0.8, 1.2, 0.8],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      });
    } else {
      particleControls.stop();
      particleControls.start({ opacity: 0, scale: 0.8 });
    }
  }, [isThinking, particleControls]);

  // Aura pulse based on arousal
  useEffect(() => {
    const arousalIntensity = limbicState.arousal;
    const pulseDuration = 2 / (arousalIntensity + 0.5); // Faster when more aroused

    auraControls.start({
      scale: [1, 1 + arousalIntensity * 0.3, 1],
      opacity: [0.3, 0.5 + arousalIntensity * 0.3, 0.3],
      transition: {
        duration: pulseDuration,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    });
  }, [limbicState.arousal, auraControls]);

  const trustColor = getTrustColor(limbicState.trust);
  const warmthColor = getWarmthColor(limbicState.warmth);
  const arousalColor = getArousalColor(limbicState.arousal);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: avatarSize, height: avatarSize }}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
    >
      {/* Aura Layer */}
      {showAura && (
        <motion.div
          animate={auraControls}
          className="absolute inset-0 rounded-full blur-2xl"
          style={{
            background: `radial-gradient(circle, ${trustColor}40, ${warmthColor}20, transparent)`,
          }}
        />
      )}

      {/* Particle Effects (Thinking) */}
      {isThinking && (
        <>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={particleControls}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: arousalColor,
                left: `${50 + 40 * Math.cos((i * Math.PI * 2) / 8)}%`,
                top: `${50 + 40 * Math.sin((i * Math.PI * 2) / 8)}%`,
                transformOrigin: 'center',
              }}
            />
          ))}
        </>
      )}

      {/* Core Avatar */}
      <motion.div
        animate={coreControls}
        className="relative z-10 rounded-full"
        style={{
          width: avatarSize * 0.7,
          height: avatarSize * 0.7,
          background: `linear-gradient(135deg, ${trustColor}, ${warmthColor})`,
          boxShadow: `0 0 ${avatarSize * 0.15}px ${trustColor}80`,
        }}
        whileHover={
          interactive
            ? {
                scale: 1.1,
                rotate: 5,
                transition: { duration: 0.3 },
              }
            : {}
        }
      >
        {/* Face/Expression Layer */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Eyes */}
          <div className="flex gap-4 mb-2">
            <motion.div
              className="w-3 h-3 rounded-full bg-white"
              animate={{
                scaleY: blinkState ? 0.1 : 1,
              }}
              transition={{ duration: 0.1 }}
            />
            <motion.div
              className="w-3 h-3 rounded-full bg-white"
              animate={{
                scaleY: blinkState ? 0.1 : 1,
              }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Mouth/Expression (based on valence) */}
          <motion.div
            className="w-8 h-1 rounded-full bg-white"
            animate={{
              scaleX: 0.5 + limbicState.valence * 0.5,
              rotate: (limbicState.valence - 0.5) * 20,
            }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Posture Indicator */}
        {limbicState.posture && (
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 font-medium">
            {limbicState.posture}
          </div>
        )}
      </motion.div>

      {/* Interactive Tooltip */}
      {isHovered && interactive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap z-20"
        >
          <div>Trust: {(limbicState.trust * 100).toFixed(0)}%</div>
          <div>Warmth: {(limbicState.warmth * 100).toFixed(0)}%</div>
          <div>Arousal: {(limbicState.arousal * 100).toFixed(0)}%</div>
          <div>Valence: {(limbicState.valence * 100).toFixed(0)}%</div>
        </motion.div>
      )}
    </div>
  );
}

export default SallieAvatar;
