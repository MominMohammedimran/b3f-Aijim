import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Maximize, // New Icon for Zoom/Maximize
  X, // Icon for Close
} from "lucide-react";

// Videos Data
const videos = [
  {
    id: 1,
    title: "Aijim Story",
    src: "/aijim-uploads/videos/aijim-first-video.mp4",
  },
  {
    id: 2,
    title: "Website Launch",
    src: "/aijim-uploads/videos/aijim-launch-video.mp4",
  },
  {
    id: 3,
    title: "Aijim Story",
    src: "/aijim-uploads/videos/aijim-first-video.mp4",
  },
  {
    id: 4,
    title: "Website Launch",
    src: "/aijim-uploads/videos/aijim-launch-video.mp4",
  },
];

const ProductVideoSection: React.FC = () => {
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const [mutedStates, setMutedStates] = useState<Record<number, boolean>>(
    Object.fromEntries(videos.map((v) => [v.id, true]))
  );

  const [activeVideo, setActiveVideo] = useState<number>(videos[0].id);
  const activeVideoIndex = videos.findIndex((v) => v.id === activeVideo);
  
  // ⭐ New State for Fullscreen Modal
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  // Toggle mute
  const toggleMute = (id: number) => {
    const video = videoRefs.current[id];
    if (video) {
      const newMuted = !mutedStates[id];
      video.muted = newMuted;
      setMutedStates((prev) => ({ ...prev, [id]: newMuted }));
    }
  };

  // ⭐ New Function to Open Fullscreen
  const openFullscreen = (id: number) => {
    // Optional: Unmute the video when going fullscreen
    const video = videoRefs.current[id];
    if (video && mutedStates[id]) {
        toggleMute(id);
    }
    setIsFullscreenOpen(true);
  };

  // ⭐ New Function to Close Fullscreen
  const closeFullscreen = useCallback(() => {
    // Mute video again when closing fullscreen
    if (!mutedStates[activeVideo]) {
      toggleMute(activeVideo);
    }
    setIsFullscreenOpen(false);
  }, [activeVideo, mutedStates]);

  // Scroll to a specific video index
  const scrollToVideo = (index: number) => {
    if (!carouselRef.current) return;

    const videoElement = carouselRef.current.children[index] as HTMLElement;
    if (!videoElement) return;

    const containerWidth = carouselRef.current.offsetWidth;
    const videoWidth = videoElement.offsetWidth;

    const scrollPosition =
      videoElement.offsetLeft - containerWidth / 2 + videoWidth / 2;

    carouselRef.current.scrollTo({
      left: scrollPosition,
      behavior: "smooth",
    });

    setActiveVideo(videos[index].id);
  };

  // Left/Right navigation
  const navigate = (dir: "prev" | "next") => {
    let newIndex = activeVideoIndex;
    if (dir === "prev" && activeVideoIndex > 0) newIndex -= 1;
    if (dir === "next" && activeVideoIndex < videos.length - 1) newIndex += 1;
    scrollToVideo(newIndex);
  };

  // Intersection Observer for detecting active video
  useEffect(() => {
    // Initial setup to auto-play and mute all videos
    videos.forEach((v) => {
      const el = videoRefs.current[v.id];
      if (el) {
        el.muted = true;
        el.play().catch(() => {});
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        let mostVisibleId: number | null = null;
        let max = 0;

        entries.forEach((entry) => {
          const id = Number(entry.target.getAttribute("data-id"));
          if (entry.intersectionRatio > max && entry.intersectionRatio >= 0.4) {
            max = entry.intersectionRatio;
            mostVisibleId = id;
          }
        });

        if (mostVisibleId !== null) setActiveVideo(mostVisibleId);
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }
    );

    videos.forEach((v) => {
      const el = videoRefs.current[v.id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Auto-center when active video changes
  useEffect(() => {
    // Only auto-center if the fullscreen modal is not open
    if (!isFullscreenOpen) {
      const timeout = setTimeout(() => {
        if (activeVideoIndex !== -1) scrollToVideo(activeVideoIndex);
      }, 80);
      return () => clearTimeout(timeout);
    }
  }, [activeVideo, activeVideoIndex, isFullscreenOpen]);

  // ⭐ New: Handle Escape key to exit fullscreen
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullscreenOpen) {
        closeFullscreen();
      }
    };
    if (isFullscreenOpen) {
      document.addEventListener("keydown", handleKeydown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [isFullscreenOpen, closeFullscreen]);
  
  // Snap to nearest video (fixes zig-zag)
  const snapToNearestVideo = () => {
    if (!carouselRef.current) return;

    const container = carouselRef.current;
    const children = Array.from(container.children) as HTMLElement[];

    const containerCenter = container.scrollLeft + container.offsetWidth / 2;

    let nearestIndex = 0;
    let nearestDistance = Infinity;

    children.forEach((child, index) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const distance = Math.abs(childCenter - containerCenter);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    scrollToVideo(nearestIndex);
  };

  // Detect scroll end → auto snap
  let scrollTimeout: any = null;

  const handleScroll = () => {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(snapToNearestVideo, 120);
  };
  
  // Find the video object for the currently active video
  const activeVideoObj = videos.find(v => v.id === activeVideo);
  
  // RENDER METHOD
  return (
    <>
      <div className="mb-8 mt-8 px-0 relative">
        <h2 className="text-xl font-bold mb-4 text-center text-gray-200">
          Must See Videos
        </h2>
        <p className="text-center text-sm mb-6 text-gray-500 font-semibold">
          Discover what's trending and loved by our customers.
        </p>

        {/* Left Button */}
        <button
          aria-label="Scroll Left"
          onClick={() => navigate("prev")}
          disabled={activeVideoIndex === 0 || isFullscreenOpen}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white/70 hover:bg-black p-1 shadow-lg disabled:opacity-50 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5 text-gray-800 hover:text-white" />
        </button>

        {/* Right Button */}
        <button
          aria-label="Scroll Right"
          onClick={() => navigate("next")}
          disabled={activeVideoIndex === videos.length - 1 || isFullscreenOpen}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white/70 hover:bg-black p-1 shadow-lg disabled:opacity-50"
        >
          <ChevronRight className="w-5 h-5 text-gray-800 hover:text-white" />
        </button>

        {/* Carousel */}
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          onTouchEnd={() => setTimeout(snapToNearestVideo, 120)}
          onMouseUp={() => setTimeout(snapToNearestVideo, 120)}
          className="overflow-x-scroll no-scrollbar scroll-smooth flex w-full p-4 gap-2 snap-x"
          style={{ scrollBehavior: "smooth", scrollPaddingLeft: "20%" }}
        >
          {videos.map((video) => (
            <div
              key={video.id}
              className={`flex-shrink-0 snap-center relative w-[65vw] max-w-[280px] aspect-[9/16] bg-gray-900 overflow-hidden rounded-xl shadow-2xl transition-all duration-500 cursor-pointer ${
                activeVideo === video.id
                  ? "scale-[1.05] shadow-xl ring-2 ring-blue-500"
                  : "scale-90 opacity-60"
              }`}
              onClick={() =>
                scrollToVideo(videos.findIndex((v) => v.id === video.id))
              }
            >
              <video
                ref={(el) => (videoRefs.current[video.id] = el)}
                data-id={video.id}
                src={video.src}
                muted // Always keep muted here, volume is controlled by toggleMute
                autoPlay
                playsInline
                loop
                preload="metadata"
                className="w-full h-full object-cover"
              />

              {/* Controls (Only visible for the active video) */}
              {activeVideo === video.id && (
                <>
                  {/* Mute Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMute(video.id);
                    }}
                    className="absolute top-1 right-3 p-2 bg-black/30 rounded-full"
                  >
                    {mutedStates[video.id] ? (
                      <VolumeX className="w-4 h-4 text-white" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-yellow-400" />
                    )}
                  </button>
                  
                  {/* ⭐ New: Zoom Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openFullscreen(video.id);
                    }}
                    className="absolute bottom-2 right-3 p-2 bg-black/30 rounded-full"
                  >
                    <Maximize className="w-4 h-4 text-white" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {videos.map((video) => (
            <button
              key={video.id}
              onClick={() =>
                scrollToVideo(videos.findIndex((v) => v.id === video.id))
              }
              className={`w-2 h-2 rounded-full transition-all ${
                activeVideo === video.id ? "bg-red-600 w-4" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ⭐ New: Fullscreen Modal/Overlay */}
      {isFullscreenOpen && activeVideoObj && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
          // Close modal on click outside the video area
          onClick={closeFullscreen}
        >
          {/* Close Button */}
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 z-50 p-2 bg-white/20 hover:bg-white/40 rounded-full"
            aria-label="Close Fullscreen Video"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          
          <div className="relative w-full h-full max-w-[90vw] max-h-[90vh] flex items-center justify-center">
            {/* We must use a copy of the video element inside the modal
                and ensure its controls (play/pause, volume) are available. */}
            <video
              key={`fullscreen-${activeVideoObj.id}`} // Key forces re-render/re-mount
              src={activeVideoObj.src}
              controls // Add native video controls for fullscreen playback
              autoPlay
              playsInline
              loop
              preload="metadata"
              className="w-full h-full object-contain" // Use object-contain to fit the screen
              // IMPORTANT: The state for muted is managed in the openFullscreen function
              muted={mutedStates[activeVideoObj.id]}
              onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking the video
              onLoadedMetadata={(e) => {
                // Manually set volume based on state for the modal's video instance
                const modalVideo = e.currentTarget;
                modalVideo.muted = mutedStates[activeVideoObj.id];
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ProductVideoSection;