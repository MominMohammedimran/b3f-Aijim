import React, { useRef, useState, useEffect } from "react";
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
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
  const [mutedStates, setMutedStates] = useState<Record<number, boolean>>(
    Object.fromEntries(videos.map((v) => [v.id, true]))
  );
  const [activeVideo, setActiveVideo] = useState<number | null>(null);

  const toggleMute = (id: number) => {
    const video = videoRefs.current[id];
    if (video) {
      const newMuted = !mutedStates[id];
      video.muted = newMuted;
      setMutedStates((prev) => ({ ...prev, [id]: newMuted }));
    }
  };

  useEffect(() => {
    // ensure autoplay for all videos
    videos.forEach((v) => {
      const el = videoRefs.current[v.id];
      if (el) {
        el.muted = true; // important for autoplay on mobile
        el.play().catch(() => {});
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        let mostVisibleId: number | null = null;
        let maxRatio = 0;
        entries.forEach((entry) => {
          const id = Number(entry.target.getAttribute("data-id"));
          if (entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            mostVisibleId = id;
          }
        });
        setActiveVideo(mostVisibleId);
      },
      { threshold: Array.from({ length: 10 }, (_, i) => i / 10) }
    );

    videos.forEach((v) => {
      const el = videoRefs.current[v.id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="mb-8 mt-8 px-4">
      <h2 className="text-lg font-bold mb-4 text-white">Product Videos</h2>

      <div className="overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex gap-4 w-max pr-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className={`relative w-full max-w-[250px] aspect-[4/6] bg-gray-900 overflow-hidden shadow-lg transition-transform duration-500 ${
                activeVideo === video.id ? "scale-[1.1]" : "scale-100"
              }`}
            >
              {/* 🎥 Video */}
              <video
                ref={(el) => (videoRefs.current[video.id] = el)}
                data-id={video.id}
                src={video.src}
                muted
                autoPlay
                playsInline
                loop
                preload="metadata"
                className="w-full h-full object-cover"
              />

              {/* 📢 Mute/Unmute Button */}
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
