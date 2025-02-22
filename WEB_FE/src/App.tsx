import { Routes, Route } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import "react-quill/dist/quill.snow.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { useEffect, useState } from "react";
import Spinner from "@atlaskit/spinner";
import Cookies from "js-cookie";
import { pdfjs } from "react-pdf";
import { io, Socket } from "socket.io-client";

import { setUser } from "@/redux/features/contextSlice";
import MainLayout from "@/components/layouts/MainLayout";
import NoLayout from "@components/layouts/NoLayout";
import RequireAuthLayout from "@/components/layouts/RequireAuthLayout";
import CourseLayout from "@/components/layouts/CourseLayout";
import UserApi from "./api/userApi";
import Flags from "./components/common/flags/Flags";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "/pdf.worker.min.mjs",
  import.meta.url
).toString();

export const socketInstance: Socket = io(
  import.meta.env.VITE_NOTIFICATION_API_URL,
  {
    withCredentials: true,
  }
);

const App = () => {
  const dispatch = useAppDispatch();

  const [isLoading, setIsLoading] = useState<boolean | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const getUserInfo = async () => {
    setIsLoading(true);

    const userId = Cookies.get("userId");
    if (userId) {
      try {
        const res = await UserApi.getUserById(userId);
        setIsLoggedIn(true);
        dispatch(setUser(res));
      } catch (error) {
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }

    setIsLoading(false);
  };

  window["getUserInfo"] = getUserInfo;

  const connectToNotificationService = async () => {
    socketInstance.on("message", (message: string) => {
      console.log(message);
    });

    socketInstance.on("disconnect", () => {
      console.log("Lost connection to notification service, connecting...");
    });
  };

  useEffect(() => {
    getUserInfo();
    connectToNotificationService();
  }, []);

  return (
    <>
      {isLoading === false ? (
        <Routes>
          {/* Public routes */}
          <Route path="/auth/*" element={<NoLayout />} />
          {/* <Route path="/certificate" element={<NoLayout />} /> */}

          {/* Private routes */}
          <Route element={<RequireAuthLayout />}>
            <Route path="/course/:id/*" element={<CourseLayout />} />
          </Route>

          <Route path="/*" element={<MainLayout />} />
        </Routes>
      ) : (
        <div className="flex h-screen items-center justify-center">
          <Spinner interactionName="load" size="large" />
        </div>
      )}

      <Flags />
    </>
  );
};

export default App;
