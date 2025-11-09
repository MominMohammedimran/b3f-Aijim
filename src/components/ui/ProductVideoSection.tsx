import React, { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const videos = [
  {
    id: 1,
    title: "Aijim Story",
    src: "https://zfdsrtwjxwzwbrtfgypm.supabase.co/storage/v1/object/sign/productimages/aijim-first-video.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Y2JiM2U1ZS1jZTNiLTRkMTctYTlhOC0zZGU5YzViYTRlZTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0aW1hZ2VzL2FpamltLWZpcnN0LXZpZGVvLm1wNCIsImlhdCI6MTc2MjY3NTg2NCwiZXhwIjoxNzk0MjExODY0fQ.9bs6lmPAdviCi2rrcjMYowMVA8fSsz3t4KdqN7zG81s",
  },
  {
    id: 2,
    title: "Tshirt Design",
    src: "https://zfdsrtwjxwzwbrtfgypm.supabase.co/storage/v1/object/public/productimages/aijim_femalemodal_video1.mp4",
  },
  {
    id: 3,
    title: "Tshirt Photoshoot",
    src: "https://zfdsrtwjxwzwbrtfgypm.supabase.co/storage/v1/object/public/productimages/aijim_femalemodal_video1.mp4",
  },
];

const ProductVideoSection: React.FC = () => {
  const [mutedStates, setMutedStates] = useState<Record<number, boolean>>(
    Object.fromEntries(videos.map((v) => [v.id, true]))
  );

  const toggleMute = (id: number) => {
    setMutedStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="mb-8 mt-8 px-4">
      <h2 className="text-lg font-bold mb-4 text-white">Product Videos</h2>

      <div className="overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex gap-4 w-max pr-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="relative w-full max-w-[250px] aspect-[4/6] bg-gray-900 overflow-hidden shadow-lg group"
            >
              {/* 🎥 Video */}
              <video
                src={video.src}
                muted={mutedStates[video.id]}
                autoPlay
                loop
                playsInline
                preload="metadata"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* 📢 Mute / Unmute Button */}
              <button
                onClick={() => toggleMute(video.id)}
                className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-sm hover:bg-black/80 transition"
              >
                {mutedStates[video.id] ? (
                  <VolumeX className="w-4 h-4 text-white" />
                ) : (
                  <Volume2 className="w-4 h-4 text-yellow-400" />
                )}
              </button>

              {/* 🏷️ Title */}
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 font-semibold">
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
