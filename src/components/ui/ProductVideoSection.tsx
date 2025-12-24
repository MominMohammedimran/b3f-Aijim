import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Maximize,
  X,
} from "lucide-react";

const videos = [
  { id: 1, title: "Aijim Story", src: "/aijim-uploads/videos/aijim-first-video.mp4" },
  { id: 2, title: "Website Launch", src: "/aijim-uploads/videos/aijim-launch-video.mp4" },
  { id: 3, title: "Aijim Story", src: "/aijim-uploads/videos/aijim-first-video.mp4" },
  { id: 4, title: "Website Launch", src: "/aijim-uploads/videos/aijim-launch-video.mp4" },

];

const ProductVideoSection: React.FC = () => {
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const isUserScrolling = useRef(false);
  const snapTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const [mutedStates, setMutedStates] = useState<Record<number, boolean>>(
    Object.fromEntries(videos.map((v) => [v.id, true]))
  );

  const [activeVideo, setActiveVideo] = useState<number>(videos[0].id);
  const activeVideoIndex = videos.findIndex((v) => v.id === activeVideo);

  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  /** Mute toggle */
  const toggleMute = (id: number) => {
    const el = videoRefs.current[id];
    if (!el) return;

    const newMuted = !mutedStates[id];
    el.muted = newMuted;

    setMutedStates((prev) => ({ ...prev, [id]: newMuted }));
  };

  /** ⭐ FIXED: Open Fullscreen */
  const openFullscreen = (id: number) => {
    const target = videoRefs.current[id];

    // Pause all carousel videos
    Object.values(videoRefs.current).forEach((v) => v?.pause());

    // Play only fullscreen video (unmuted)
    if (target) {
      target.muted = false;
      setMutedStates((prev) => ({ ...prev, [id]: false }));
      target.play().catch(() => {});
    }

    setIsFullscreenOpen(true);
  };

  /** ⭐ FIXED: Close Fullscreen */
  const closeFullscreen = useCallback(() => {
    const current = videoRefs.current[activeVideo];

    // Pause fullscreen video
    if (current) current.pause();

    // Re-mute it after closing
    if (current) current.muted = true;
    setMutedStates((prev) => ({ ...prev, [activeVideo]: true }));

    // Restart all carousel videos muted
    Object.entries(videoRefs.current).forEach(([_, v]) => {
      if (v) {
        v.muted = true;
        v.play().catch(() => {});
      }
    });

    setIsFullscreenOpen(false);
  }, [activeVideo]);

  /** Scroll to video center */
  const scrollToVideo = (index: number) => {
    if (!carouselRef.current) return;

    const el = carouselRef.current.children[index] as HTMLElement;
    if (!el) return;

    const containerWidth = carouselRef.current.offsetWidth;
    const videoWidth = el.offsetWidth;

    const position = el.offsetLeft - containerWidth / 2 + videoWidth / 2;

    carouselRef.current.scrollTo({ left: position, behavior: "smooth" });

    setActiveVideo(videos[index].id);
  };

  /** Prev/Next navigation */
  const navigate = (dir: "prev" | "next") => {
    let newIndex = activeVideoIndex;
    if (dir === "prev" && newIndex > 0) newIndex--;
    if (dir === "next" && newIndex < videos.length - 1) newIndex++;
    scrollToVideo(newIndex);
  };

  /** Auto-play + observer */
  useEffect(() => {
    videos.forEach((v) => {
      const el = videoRefs.current[v.id];
      if (el) {
        el.muted = true;
        el.play().catch(() => {});
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        let mostVisible: number | null = null;
        let max = 0;

        entries.forEach((entry) => {
          const id = Number(entry.target.getAttribute("data-id"));

          if (entry.intersectionRatio > max && entry.intersectionRatio >= 0.4) {
            max = entry.intersectionRatio;
            mostVisible = id;
          }
        });
        if (!isUserScrolling.current && mostVisible !== null) {
          setActiveVideo(mostVisible);
        }
        

     
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }
    );

    videos.forEach((v) => {
      const el = videoRefs.current[v.id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  /** Auto-center */
  useEffect(() => {
    if (isFullscreenOpen) return;
    if (isUserScrolling.current) return;
  
    const t = setTimeout(() => {
      if (activeVideoIndex !== -1) {
        scrollToVideo(activeVideoIndex);
      }
    }, 80);
  
    return () => clearTimeout(t);
  }, [activeVideo, isFullscreenOpen]);
  

  /** ESC to close fullscreen */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreenOpen) closeFullscreen();
    };

    if (isFullscreenOpen)
      document.addEventListener("keydown", handler);

    return () => document.removeEventListener("keydown", handler);
  }, [isFullscreenOpen, closeFullscreen]);

  /** Snap to nearest video */
  const snapToNearestVideo = () => {
    if (!carouselRef.current || isUserScrolling.current) return;
  
    const container = carouselRef.current;
    const items = Array.from(container.children) as HTMLElement[];
  
    const center = container.scrollLeft + container.offsetWidth / 2;
  
    let nearestIndex = 0;
    let minDistance = Infinity;
  
    items.forEach((item, index) => {
      const itemCenter = item.offsetLeft + item.offsetWidth / 2;
      const distance = Math.abs(itemCenter - center);
  
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = index;
      }
    });
  
    scrollToVideo(nearestIndex);
  };
  

 
  const handleScroll = () => {
    isUserScrolling.current = true;
  
    if (snapTimeout.current) {
      clearTimeout(snapTimeout.current);
    }
  
    snapTimeout.current = setTimeout(() => {
      isUserScrolling.current = false;
      snapToNearestVideo();
    }, 180); // wait until swipe ends
  };
  

  const activeVideoObj = videos.find((v) => v.id === activeVideo);

  return (
    <>
      <div className="mb-8 mt-8 px-0 relative">
        <h2 className="text-xl font-bold text-center text-gray-200 mb-4">Must See Videos</h2>
        <p className="text-center text-sm text-gray-500 mb-6 font-semibold">
          Discover what's trending and loved by our customers.
        </p>

        {/* Prev Button */}
        <button
          onClick={() => navigate("prev")}
          disabled={activeVideoIndex === 0 || isFullscreenOpen}
          className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-gray-600 p-2 z-10 rounded-full shadow-lg disabled:opacity-50"
        >
          <ChevronLeft className="w-6 h-6 text-gray-800 hover:text-white" />
        </button>

        {/* Next Button */}
        <button
          onClick={() => navigate("next")}
          disabled={activeVideoIndex === videos.length - 1 || isFullscreenOpen}
          className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-gray-600 p-2 z-10 rounded-full  shadow-lg disabled:opacity-50"
        >
          <ChevronRight className="w-6 h-6 text-gray-800 hover:text-white" />
        </button>

        {/* Carousel */}
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          onTouchEnd={() => setTimeout(snapToNearestVideo, 120)}
          onMouseUp={() => setTimeout(snapToNearestVideo, 120)}
          className="overflow-x-scroll no-scrollbar flex p-4 gap-2 w-full scroll-smooth"
        >
          {videos.map((video) => (
            <div
              key={video.id}
              onClick={() => scrollToVideo(videos.findIndex((v) => v.id === video.id))}
              className={`relative bg-gray-900 rounded-xl flex-shrink-0 w-[65vw] max-w-[280px] aspect-[9/16] overflow-hidden transition-all duration-500 cursor-pointer
                ${activeVideo === video.id ? "scale-[1.05] ring-2 ring-blue-500 shadow-xl" : "scale-90 opacity-60"}
              `}
            >
              <video
                ref={(el) => (videoRefs.current[video.id] = el)}
                src={video.src}
                data-id={video.id}
                autoPlay
                playsInline
                loop
                muted
                preload="metadata"
                className="w-full h-full object-cover"
              />

              {activeVideo === video.id && (
                <>
                  {/* Mute */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMute(video.id);
                    }}
                    className="absolute top-1 right-3 bg-black/30 p-2 rounded-full"
                  >
                    {mutedStates[video.id] ? (
                      <VolumeX className="w-4 h-4 text-white" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-yellow-300" />
                    )}
                  </button>

                  {/* Fullscreen */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openFullscreen(video.id);
                    }}
                    className="absolute bottom-2 right-3 bg-black/30 p-2 rounded-full hidden"
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
              onClick={() => scrollToVideo(videos.findIndex((v) => v.id === video.id))}
              className={`w-2 h-2 rounded-full transition-all ${
                activeVideo === video.id ? "bg-red-600 w-4" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ⭐ Fullscreen Modal */}
      {isFullscreenOpen && activeVideoObj && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={closeFullscreen}
        >
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-full z-50"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <video
            key={`fullscreen-${activeVideoObj.id}`}
            src={activeVideoObj.src}
            controls
            autoPlay
            loop
            playsInline
            className="w-full h-full object-contain"
            muted={mutedStates[activeVideoObj.id]}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default ProductVideoSection;
