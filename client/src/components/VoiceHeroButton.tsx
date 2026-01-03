import { useState, useRef, useCallback } from 'react';
import { Play, Pause, Mic, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type VoiceButtonState = 'idle' | 'listening' | 'playing';

interface VoiceHeroButtonProps {
  label?: string;
  audioSrc?: string;
  onStateChange?: (state: VoiceButtonState) => void;
  size?: 'default' | 'large';
  className?: string;
}

/**
 * VoiceHeroButton - Bouton vocal hero avec animations
 * États: idle (play), listening (micro pulse), playing (ondes animées)
 * Style: Pilule avec dégradé terre battue + ombre forte
 */
export default function VoiceHeroButton({
  label = "Cliquez pour écouter",
  audioSrc,
  onStateChange,
  size = 'default',
  className,
}: VoiceHeroButtonProps) {
  const [state, setState] = useState<VoiceButtonState>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const updateState = useCallback((newState: VoiceButtonState) => {
    setState(newState);
    onStateChange?.(newState);
  }, [onStateChange]);

  const handleClick = useCallback(() => {
    if (state === 'idle') {
      // Start playing audio if available
      if (audioSrc) {
        audioRef.current = new Audio(audioSrc);
        audioRef.current.onended = () => updateState('idle');
        audioRef.current.play().catch(() => updateState('idle'));
        updateState('playing');
      } else {
        // Simulate listening mode if no audio
        updateState('listening');
        setTimeout(() => updateState('idle'), 3000);
      }
    } else if (state === 'playing') {
      // Stop playing
      audioRef.current?.pause();
      updateState('idle');
    } else if (state === 'listening') {
      // Cancel listening
      updateState('idle');
    }
  }, [state, audioSrc, updateState]);

  const isLarge = size === 'large';

  return (
    <button
      onClick={handleClick}
      className={cn(
        // Base styles
        "relative flex items-center gap-3 rounded-full font-nunito font-bold text-white transition-all duration-300",
        // Gradient background terre battue
        "bg-gradient-to-r from-[#E67E22] to-[#C25E00]",
        // Shadow and hover
        "shadow-[0_4px_14px_rgba(194,94,0,0.5)] hover:shadow-[0_6px_20px_rgba(194,94,0,0.6)]",
        "hover:scale-105 active:scale-95",
        // Size variants
        isLarge ? "px-8 py-5 text-xl min-h-[56px]" : "px-6 py-4 text-lg min-h-[48px]",
        // Pulse animation when active
        (state === 'listening' || state === 'playing') && "animate-pulse-cta",
        className
      )}
      aria-label={label}
    >
      {/* Icon container */}
      <div className={cn(
        "flex items-center justify-center rounded-full bg-white/20",
        isLarge ? "w-10 h-10" : "w-8 h-8"
      )}>
        {state === 'idle' && <Play className={cn("fill-current", isLarge ? "w-5 h-5" : "w-4 h-4")} />}
        {state === 'listening' && <Mic className={cn(isLarge ? "w-5 h-5" : "w-4 h-4")} />}
        {state === 'playing' && <Pause className={cn("fill-current", isLarge ? "w-5 h-5" : "w-4 h-4")} />}
      </div>

      {/* Label */}
      <span className="whitespace-nowrap">{label}</span>

      {/* Sound wave bars (visible when playing) */}
      {state === 'playing' && (
        <div className="flex items-center gap-0.5 ml-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "bg-white rounded-full",
                isLarge ? "w-1 h-4" : "w-0.5 h-3",
                "animate-wave"
              )}
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      )}

      {/* Listening indicator */}
      {state === 'listening' && (
        <Volume2 className={cn("ml-1 opacity-80", isLarge ? "w-5 h-5" : "w-4 h-4")} />
      )}
    </button>
  );
}
