import React from 'react';

interface VideoPlayerProps {
  videoId: string;
  title: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, title }) => {
  return (
    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg relative group">
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};