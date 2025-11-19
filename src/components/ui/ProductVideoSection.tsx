import React, { useRef, useState, useEffect } from "react";
import { Volume2, VolumeX, ChevronLeft, ChevronRight } from "lucide-react";

// The video data remains the same
const videos = [
  {
    id: 1,
    title: "Aijim Story",
    src: "https://zfdsrtwjxwzwbrtfgypm.supabase.co/storage/v1/object/sign/productimages/aijim-first-video.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Y2JiM2U1ZS1jZTNiLTRkMTctYTlhOC0zZGU5YzViYTRlZTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0aW1hZ2VzL2FpamltLWZpcnN0LXZpZGVvLm1wNCIsImlhdCI6MTc2MjY3NTg2NCwiZXhwIjoxNzk0MjExODY0fQ.9bs6lmPAdviCi2rrcjMYowMVA8fSsz3t4KdqN7zG81s",
  },
  {
    id: 2,
    title: "Website Launch",
    src: "https://zfdsrtwjxwzwbrtfgypm.supabase.co/storage/v1/object/sign/productimages/Index-videos/aijim-launch-video-19-11-2025.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Y2JiM2U1ZS1jZTNiLTRkMTctYTlhOC0zZGU5YzViYTRlZTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0aW1hZ2VzL0luZGV4LXZpZGVvcy9haWppbS1sYXVuY2gtdmlkZW8tMTktMTEtMjAyNS5tcDQiLCJpYXQiOjE3NjM1NDgyMjAsImV4cCI6MTc5NTA4NDIyMH0.Wr63dKcqSf5uhE1Nxv0MWeJCKQ671CV-L7ve7AiRlxI",
 },
   {
    id: 3,
    title: "Aijim Story",
   src: "https://zfdsrtwjxwzwbrtfgypm.supabase.co/storage/v1/object/sign/productimages/aijim-first-video.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Y2JiM2U1ZS1jZTNiLTRkMTctYTlhOC0zZGU5YzViYTRlZTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0aW1hZ2VzL2FpamltLWZpcnN0LXZpZGVvLm1wNCIsImlhdCI6MTc2MjY3NTg2NCwiZXhwIjoxNzk0MjExODY0fQ.9bs6lmPAdviCi2rrcjMYowMVA8fSsz3t4KdqN7zG81s",
   },
  {
    id: 4,
    title: "Website Launch",
    src: "https://zfdsrtwjxwzwbrtfgypm.supabase.co/storage/v1/object/sign/productimages/Index-videos/aijim-launch-video-19-11-2025.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Y2JiM2U1ZS1jZTNiLTRkMTctYTlhOC0zZGU5YzViYTRlZTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0aW1hZ2VzL0luZGV4LXZpZGVvcy9haWppbS1sYXVuY2gtdmlkZW8tMTktMTEtMjAyNS5tcDQiLCJpYXQiOjE3NjM1NDgyMjAsImV4cCI6MTc5NTA4NDIyMH0.Wr63dKcqSf5uhE1Nxv0MWeJCKQ671CV-L7ve7AiRlxI",
 },
  
  
];

const ProductVideoSection: React.FC = () => {
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [mutedStates, setMutedStates] = useState<Record<number, boolean>>(
    Object.fromEntries(videos.map((v) => [v.id, true]))
  );
  const [activeVideo, setActiveVideo] = useState<number>(videos[0].id); // Start with the first video
  const activeVideoIndex = videos.findIndex(v => v.id === activeVideo);


  const toggleMute = (id: number) => {
    const video = videoRefs.current[id];
    if (video) {
      const newMuted = !mutedStates[id];
      video.muted = newMuted;
      setMutedStates((prev) => ({ ...prev, [id]: newMuted }));
    }
  };

  const scrollToVideo = (index: number) => {
    if (carouselRef.current) {
      const videoElement = carouselRef.current.children[index] as HTMLElement;
      if (videoElement) {
        // Calculate the scroll position to center the video
        const containerWidth = carouselRef.current.offsetWidth;
        const videoWidth = videoElement.offsetWidth;
        const scrollPosition = videoElement.offsetLeft - (containerWidth / 2) + (videoWidth / 2);

        carouselRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth',
        });

        // Manually set the active video immediately for a snappier feel
        setActiveVideo(videos[index].id);
      }
    }
  };

  // Logic to handle left/right navigation
  const navigate = (direction: 'prev' | 'next') => {
    let newIndex = activeVideoIndex;
    if (direction === 'prev' && activeVideoIndex > 0) {
      newIndex -= 1;
    } else if (direction === 'next' && activeVideoIndex < videos.length - 1) {
      newIndex += 1;
    }
    scrollToVideo(newIndex);
  };
  
  // *** Intersection Observer for Active Video (Playback/Focus) ***
  useEffect(() => {
    // Autoplay logic (Crucial for mobile/modern browsers)
    videos.forEach((v) => {
      const el = videoRefs.current[v.id];
      if (el) {
        el.muted = true;
        el.play().catch(() => {});
      }
    });

    // Intersection Observer to determine the most visible video
    const observer = new IntersectionObserver(
      (entries) => {
        let mostVisibleId: number | null = null;
        let maxRatio = 0;
        entries.forEach((entry) => {
          const id = Number(entry.target.getAttribute("data-id"));
          // Only consider videos that are at least 40% visible to determine "active"
          if (entry.intersectionRatio > maxRatio && entry.intersectionRatio > 0.4) {
            maxRatio = entry.intersectionRatio;
            mostVisibleId = id;
          }
        });

        // Update active video only if a clearly most visible one is found
        if (mostVisibleId !== null) {
          setActiveVideo(mostVisibleId);
        }
      },
      // Higher threshold array for more granular checking
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) } 
    );

    videos.forEach((v) => {
      const el = videoRefs.current[v.id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Effect to ensure the active video is centered/focused when the component loads or activeVideo changes
  useEffect(() => {
    if (activeVideoIndex !== -1 && carouselRef.current) {
        // Debounce the initial scroll to ensure all elements are rendered
        const timeout = setTimeout(() => {
            scrollToVideo(activeVideoIndex);
        }, 100); 
        return () => clearTimeout(timeout);
    }
  }, [activeVideo, activeVideoIndex]);

  return (
    <div className="mb-8 mt-8 px-0 relative">
      <h2 className="text-xl font-bold mb-4 text-center text-gray-200">Must See Videos</h2>
      <p className="text-center text-sm mb-6 text-gray-500 font-semibold">Discover what's trending and loved by our customers.</p>

      {/* ⬅️ Left Navigation Button (Optional based on the image, but good UX) */}
      <button
        onClick={() => navigate('prev')}
        disabled={activeVideoIndex === 0}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white/70 hover:bg-black  p-1 shadow-lg disabled:opacity-50 transition-opacity"
        aria-label="Previous video"
      >
        <ChevronLeft className="w-5 h-5 text-gray-800 hover:text-white" />
      </button>

      {/* ➡️ Right Navigation Button (Optional) */}
      <button
        onClick={() => navigate('next')}
        disabled={activeVideoIndex === videos.length - 1}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white/70 p-1 hover:bg-black  shadow-lg disabled:opacity-50 transition-opacity"
        aria-label="Next video"
      >
        <ChevronRight className="w-5 h-5 text-gray-800 hover:text-white" />
      </button>

      {/* Video Carousel Container */}
      <div
        ref={carouselRef}
        className="overflow-x-scroll no-scrollbar scroll-smooth snap-x snap-mandatory flex w-full p-4 gap-2"
         style={{ scrollBehavior: "smooth", scrollPaddingLeft: "20%" }}
      >
        {videos.map((video) => (
          <div
            key={video.id}
            // Use flex-shrink-0 and explicit width/aspect ratio for consistent sizing
            className={`flex-shrink-0 snap-center relative w-[65vw] max-w-[280px] aspect-[9/16] bg-gray-900 overflow-hidden rounded-xl shadow-2xl transition-all duration-500 cursor-pointer ${
                activeVideo === video.id ? "scale-[1.05] shadow-black-500/50 ring-2 ring-black-400" : "scale-90 opacity-60"
            }`}
            onClick={() => scrollToVideo(videos.findIndex(v => v.id === video.id))} // Tap to center/focus
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
              // Only apply focus effect to the active video in terms of visual distinction
              style={{ filter: activeVideo !== video.id ? 'brightness(70%)' : 'brightness(100%)' }}
            />

            {/* 📢 Mute/Unmute Button (Only show on active video for cleaner look) */}
            {activeVideo === video.id && (
                <button
                onClick={(e) => { e.stopPropagation(); toggleMute(video.id); }}
                className="absolute top-1 right-2  p-2 rounded-none transition"
                aria-label={mutedStates[video.id] ? "Unmute" : "Mute"}
              >
                {mutedStates[video.id] ? (
                  <VolumeX className="w-4 h-4 text-white shadow-black-500/50" />
                ) : (
                  <Volume2 className="w-4 h-4 text-yellow-400 shadow-black-500/50" />
                )}
              </button>
            )}

            {/* ⏱️ Video Duration (Mimic the image's duration overlay) */}
           

            {/* 🏷️ Title (Moved off-screen/removed for image-matching simplicity, but you can re-add it) */}
            {/* <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 font-semibold">
              {video.title}
            </div> */}
          </div>
        ))}
      </div>

      {/* 🔴 Dot Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {videos.map((video) => (
          <button
            key={video.id}
            onClick={() => scrollToVideo(videos.findIndex(v => v.id === video.id))}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              activeVideo === video.id ? "bg-red-600 w-4" : "bg-gray-300"
            }`}
            aria-label={`Go to video ${video.id}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductVideoSection;

