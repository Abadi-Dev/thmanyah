import { useState } from 'react';

export default function ProgramCard({ program, onClick, isSelected }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-xl overflow-hidden transition-all duration-200 ${
        isSelected
          ? 'ring-2 ring-off-black shadow-lg'
          : 'hover:shadow-md hover:-translate-y-1'
      }`}
    >
      {/* Thumbnail */}
      <div className="aspect-square bg-gray-light overflow-hidden">
        {program.thumbnailUrl && !imageError ? (
          <img
            src={program.thumbnailUrl}
            alt={program.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-mid bg-gradient-to-br from-gray-light to-gray-mid/20">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 bg-white">
        <h3 className="font-semibold text-off-black truncate" dir="auto">
          {program.title}
        </h3>
        {program.description && (
          <p className="text-sm text-gray-mid mt-1 line-clamp-2" dir="auto">
            {program.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-mid">
          <span className="px-2 py-1 bg-gray-light rounded-full">
            {program.type}
          </span>
          <span>{program.language?.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}
