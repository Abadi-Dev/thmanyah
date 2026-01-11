function formatDuration(seconds) {
  if (!seconds) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function EpisodeCard({ episode, onClick }) {
  const handleClick = () => {
    if (episode.videoUrl) {
      window.open(episode.videoUrl, '_blank');
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className="flex gap-4 p-4 bg-white rounded-xl cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* Thumbnail */}
      <div className="w-32 h-20 flex-shrink-0 bg-gray-light rounded-lg overflow-hidden">
        {episode.thumbnailUrl ? (
          <img
            src={episode.thumbnailUrl}
            alt={episode.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-mid">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-off-black line-clamp-1" dir="auto">
            {episode.title}
          </h4>
          {episode.duration > 0 && (
            <span className="text-xs text-gray-mid flex-shrink-0">
              {formatDuration(episode.duration)}
            </span>
          )}
        </div>
        {episode.description && (
          <p className="text-sm text-gray-mid mt-1 line-clamp-2" dir="auto">
            {episode.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-mid">
          <span>Ep {episode.episodeNumber}</span>
          {episode.youtubeId && (
            <span className="text-red-500">YouTube</span>
          )}
        </div>
      </div>
    </div>
  );
}
