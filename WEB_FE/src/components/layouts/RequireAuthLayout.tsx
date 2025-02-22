import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/redux/hook";

const RequireAuthLayout = () => {
  const location = useLocation();

  const user = useAppSelector((state) => state.context.user);

  return user ? (
    <Outlet />
  ) : (
    <Navigate to="/" state={{ from: location }} replace />
  );
};

export default RequireAuthLayout;
