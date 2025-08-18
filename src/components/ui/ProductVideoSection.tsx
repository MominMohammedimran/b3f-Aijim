import React, { useRef, useEffect, useState } from 'react';

const videos = [
  {
    id: 1,
    title: 'Tshirt preview',
   src: 'https://zfdsrtwjxwzwbrtfgypm.supabase.co/storage/v1/object/sign/productimages/aijim_femalemodal_video1.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Y2JiM2U1ZS1jZTNiLTRkMTctYTlhOC0zZGU5YzViYTRlZTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0aW1hZ2VzL2FpamltX2ZlbWFsZW1vZGFsX3ZpZGVvMS5tcDQiLCJpYXQiOjE3NTQ5MTM3NTYsImV4cCI6MTc4NjQ0OTc1Nn0.jb63uFGfs64v6h3qBgmgQfC008ylJ4FNh2aPjsPnSIo',  },
    { id: 2,
    title: 'Tshirt Design',
   src: 'https://zfdsrtwjxwzwbrtfgypm.supabase.co/storage/v1/object/sign/productimages/aijim_femalemodal_video1.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Y2JiM2U1ZS1jZTNiLTRkMTctYTlhOC0zZGU5YzViYTRlZTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0aW1hZ2VzL2FpamltX2ZlbWFsZW1vZGFsX3ZpZGVvMS5tcDQiLCJpYXQiOjE3NTQ5MTM3NTYsImV4cCI6MTc4NjQ0OTc1Nn0.jb63uFGfs64v6h3qBgmgQfC008ylJ4FNh2aPjsPnSIo',  },
    { id: 3,
    title: 'Tshirt photoshoot',
   src: 'https://zfdsrtwjxwzwbrtfgypm.supabase.co/storage/v1/object/sign/productimages/aijim_femalemodal_video1.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Y2JiM2U1ZS1jZTNiLTRkMTctYTlhOC0zZGU5YzViYTRlZTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0aW1hZ2VzL2FpamltX2ZlbWFsZW1vZGFsX3ZpZGVvMS5tcDQiLCJpYXQiOjE3NTQ5MTM3NTYsImV4cCI6MTc4NjQ0OTc1Nn0.jb63uFGfs64v6h3qBgmgQfC008ylJ4FNh2aPjsPnSIo',  },
  
];

const ProductVideoSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Pause all videos except current


  // Detect scroll and update currentIndex
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollLeft, offsetWidth } = container;
    const newIndex = Math.round(scrollLeft / (offsetWidth * 0.75)); // based on 75% width
    if (newIndex !== currentIndex) setCurrentIndex(newIndex);
  };

  return (
    <div className="mb-8  mt-8 px-4">
      <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">Product Videos</h2>

      <div
        ref={containerRef}
        className="overflow-x-auto no-scrollbar scroll-smooth"
        onScroll={handleScroll}
      >
        <div className="flex gap-4 w-max pr-4">
          {videos.map((video) => (
            <div
              key={video.id}
            className="w-full max-w-[230px] aspect-[3/6] bg-gray-900 overflow-hidden shadow-lg relative"
  >
              <video
             
                src={video.src}
                muted
                autoPlay
                loop
                playsInline
                preload="metadata"
                className="w-full h-full object-cover aspect-video"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                {video.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductVideoSection;
