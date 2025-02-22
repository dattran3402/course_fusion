import ReactPlayer from "react-player";
import { useEffect, useState, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hook";

import FileApi from "@/api/fileApi";
import SectionApi from "@/api/sectionApi";

const PROGRESS_INTERVAL = 2000; // 10s per update

const SectionVideo = ({ progressPercent, setProgressPercent }) => {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false);
  const videoRef = useRef<any>(null);

  const currentSection = useAppSelector(
    (state) => state.context.currentSection
  );

  const fetchData = async (sectionId) => {
    try {
      const fileRes = await SectionApi.getFilesInSection(sectionId);
      const fileIds = fileRes.data;

      if (fileIds.length > 0) {
        const file = await FileApi.getFileDetailById(
          fileIds[fileIds.length - 1]
        );

        const videoPublicUrl = await FileApi.getFilePublicUrl(file.data.id);

        setVideoDuration(file.data.duration);
        setVideoUrl(videoPublicUrl.data);
      }
    } catch (err) {
      setVideoUrl("");
    }
  };

  useEffect(() => {
    if (currentSection.id) {
      fetchData(currentSection.id);
    }
  }, [currentSection.id]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.getCurrentTime();

      const percent = Math.floor(
        (currentTime / videoRef.current.getDuration()) * 100
      );

      if (progressPercent < 100 && percent >= progressPercent) {
        setProgressPercent(percent);
      }
    }
  };

  const handleVideoReady = () => {
    if (videoRef.current && !isVideoReady) {
      let startTime = 0;
      if (progressPercent < 100) {
        startTime = (videoDuration * progressPercent) / 100;
      }

      videoRef.current.seekTo(startTime);
      setIsVideoReady(true);
    }
  };

  return (
    <div>
      <div className={`${isVideoReady ? "block" : "hidden"}`}>
        <ReactPlayer
          ref={videoRef}
          url={videoUrl}
          controls
          width="100%"
          height="auto"
          onEnded={handleTimeUpdate}
          onProgress={handleTimeUpdate}
          onSeek={handleTimeUpdate}
          onReady={handleVideoReady}
          progressInterval={PROGRESS_INTERVAL}
        />
      </div>
      <div className={`${isVideoReady ? "hidden" : "block"}`}>
        <div
          role="status"
          className="flex h-[500px] animate-pulse items-center justify-center rounded-lg bg-gray-300 dark:bg-gray-700"
        >
          <svg
            className="h-10 w-10 text-gray-200 dark:text-gray-600"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 16 20"
          >
            <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z" />
            <path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM9 13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2Zm4 .382a1 1 0 0 1-1.447.894L10 13v-2l1.553-1.276a1 1 0 0 1 1.447.894v2.764Z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SectionVideo;
