import React from 'react';

interface JourneyScoreControlProps {
  score?: number;
  onChange: (score: number) => void;
  className?: string;
  starClassName?: string;
  showEmotion?: boolean;
}

function getEmotion(score?: number): string {
  switch (score) {
    case 1:
      return '😞';
    case 2:
      return '😕';
    case 3:
      return '😐';
    case 4:
      return '😊';
    case 5:
      return '🤩';
    default:
      return '😐';
  }
}

function getStarTone(score?: number): string {
  if (!score || score <= 2) {
    return 'text-rose-500';
  }
  if (score === 3) {
    return 'text-amber-500';
  }
  return 'text-emerald-500';
}

export function JourneyScoreControl({
  score,
  onChange,
  className = '',
  starClassName = '',
  showEmotion = true,
}: JourneyScoreControlProps): React.ReactElement {
  const toneClassName = getStarTone(score);

  return (
    <div className={`flex items-center gap-2 ${className}`.trim()}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onChange(star);
            }}
            className={`rounded-sm transition-colors ${toneClassName} ${starClassName}`.trim()}
            aria-label={`Set journey score to ${star}`}
          >
            {star <= (score ?? 0) ? '★' : '☆'}
          </button>
        ))}
      </div>
      {showEmotion ? <span className="text-sm leading-none">{getEmotion(score)}</span> : null}
    </div>
  );
}
