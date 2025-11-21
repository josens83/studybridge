import { Trophy, Zap } from 'lucide-react';
import { getExpForNextLevel } from '@/lib/supabase/gamification';

interface LevelBadgeProps {
  level: number;
  experience: number;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
}

export default function LevelBadge({
  level,
  experience,
  size = 'medium',
  showProgress = false,
}: LevelBadgeProps) {
  const expForNextLevel = getExpForNextLevel(level);
  const expForCurrentLevel = getExpForNextLevel(level - 1);
  const progressExp = experience - expForCurrentLevel;
  const neededExp = expForNextLevel - expForCurrentLevel;
  const progressPercent = Math.min(100, (progressExp / neededExp) * 100);

  const sizeClasses = {
    small: 'w-10 h-10 text-xs',
    medium: 'w-16 h-16 text-lg',
    large: 'w-24 h-24 text-2xl',
  };

  return (
    <div className="flex items-center gap-3">
      {/* Level Badge */}
      <div className="relative">
        <div
          className={`${sizeClasses[size]} bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg border-4 border-white`}
        >
          <span className="relative z-10">{level}</span>
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <Trophy className="w-3 h-3 text-white" />
        </div>
      </div>

      {/* Level Info */}
      {showProgress && (
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold">레벨 {level}</span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {progressExp.toLocaleString()} / {neededExp.toLocaleString()} XP
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
