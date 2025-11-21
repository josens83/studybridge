import { Award } from 'lucide-react';
import { getRarityColor, getCategoryIcon, type UserBadge } from '@/lib/supabase/gamification';

interface BadgeDisplayProps {
  badge: UserBadge;
  size?: 'small' | 'medium' | 'large';
}

export default function BadgeDisplay({ badge, size = 'medium' }: BadgeDisplayProps) {
  const sizeClasses = {
    small: 'w-16 h-20',
    medium: 'w-20 h-24',
    large: 'w-28 h-32',
  };

  const iconSizes = {
    small: 'text-2xl',
    medium: 'text-3xl',
    large: 'text-4xl',
  };

  const rarityColor = getRarityColor(badge.rarity);

  return (
    <div
      className={`${sizeClasses[size]} relative group cursor-pointer transition hover:scale-105`}
      title={badge.description}
    >
      {/* Badge Card */}
      <div className={`h-full ${rarityColor} rounded-lg p-2 flex flex-col items-center justify-center shadow-md border-2`}>
        <div className={`${iconSizes[size]} mb-1`}>{badge.icon}</div>
        <div className="text-xs font-semibold text-center line-clamp-2">
          {badge.name}
        </div>
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
        <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-lg">{badge.icon}</div>
            <div>
              <div className="font-bold">{badge.name}</div>
              <div className="text-gray-300 capitalize">{badge.rarity}</div>
            </div>
          </div>
          <p className="mb-2">{badge.description}</p>
          <div className="text-xs text-gray-400">
            획득: {new Date(badge.earned_at).toLocaleDateString('ko-KR')}
          </div>
        </div>
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 mx-auto"></div>
      </div>
    </div>
  );
}

interface BadgeGridProps {
  badges: UserBadge[];
  maxDisplay?: number;
}

export function BadgeGrid({ badges, maxDisplay }: BadgeGridProps) {
  const displayBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges;
  const remainingCount = maxDisplay && badges.length > maxDisplay ? badges.length - maxDisplay : 0;

  return (
    <div className="flex flex-wrap gap-3">
      {displayBadges.map((badge) => (
        <BadgeDisplay key={badge.id} badge={badge} size="medium" />
      ))}
      {remainingCount > 0 && (
        <div className="w-20 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center">
            <Award className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <div className="text-xs font-semibold text-gray-500">+{remainingCount}</div>
          </div>
        </div>
      )}
    </div>
  );
}
