import React, { useRef, useState, useEffect } from "react";
import { Volume2, VolumeX, ChevronLeft, ChevronRight } from "lucide-react";

// Videos Data
const videos = [
  {
    id: 1,
    title: "Aijim Story",
    src: "https://ik.imagekit.io/o5ewoek4p/Index-videos/aijim-first-video.mp4?updatedAt=1764167597958",
  },
  {
    id: 2,
    title: "Website Launch",
    src: "https://ik.imagekit.io/o5ewoek4p/Index-videos/aijim-launch-video-19-11-2025.mp4?updatedAt=1764167563293",
  },
  {
    id: 3,
    title: "Aijim Story",
    src: "https://ik.imagekit.io/o5ewoek4p/Index-videos/aijim-first-video.mp4?updatedAt=1764167597958",
  },
  {
    id: 4,
    title: "Website Launch",
    src: "https://ik.imagekit.io/o5ewoek4p/Index-videos/aijim-launch-video-19-11-2025.mp4?updatedAt=1764167563293",
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

  // Toggle mute
  const toggleMute = (id: number) => {
    const video = videoRefs.current[id];
    if (video) {
      const newMuted = !mutedStates[id];
      video.muted = newMuted;
      setMutedStates((prev) => ({ ...prev, [id]: newMuted }));
    }
  };

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
    const timeout = setTimeout(() => {
      if (activeVideoIndex !== -1) scrollToVideo(activeVideoIndex);
    }, 80);
    return () => clearTimeout(timeout);
  }, [activeVideo]);

  // ⭐ New: Snap to nearest video (fixes zig-zag)
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

  return (
    <div className="mb-8 mt-8 px-0 relative">
      <h2 className="text-xl font-bold mb-4 text-center text-gray-200">
        Must See Videos
      </h2>
      <p className="text-center text-sm mb-6 text-gray-500 font-semibold">
        Discover what's trending and loved by our customers.
      </p>

      {/* Left Button */}
      <button
        onClick={() => navigate("prev")}
        disabled={activeVideoIndex === 0}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white/70 hover:bg-black p-1 shadow-lg disabled:opacity-50 transition-opacity"
      >
        <ChevronLeft className="w-5 h-5 text-gray-800 hover:text-white" />
      </button>

      {/* Right Button */}
      <button
        onClick={() => navigate("next")}
        disabled={activeVideoIndex === videos.length - 1}
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
              muted
              autoPlay
              playsInline
              loop
              preload="metadata"
              className="w-full h-full object-cover"
            />

            {/* Mute Button */}
            {activeVideo === video.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute(video.id);
                }}
                className="absolute top-1 right-2 p-2"
              >
                {mutedStates[video.id] ? (
                  <VolumeX className="w-4 h-4 text-white" />
                ) : (
                  <Volume2 className="w-4 h-4 text-yellow-400" />
                )}
              </button>
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
  );
};

export default ProductVideoSection;
