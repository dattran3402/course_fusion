import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import routes from "@/routes";
import { ReactNode, useState } from "react";

import Footer from "../common/footer/Footer";
import Header from "../common/header/Header";
import { RoutesType } from "@/utils/types";

const HomeLayout = () => {
  const getRoutes = (routes: RoutesType[]): ReactNode => {
    console.log("Home layout")
    return routes.map((prop, key) => {
      return (
        <Route path={`/${prop.path}`} element={prop.component} key={key} />
      );
    });
  };

  return (
    <div className="h-full min-h-webkit">
      <div className={`relative z-0 box-border flex min-h-webkit`}>
        <div className="relative flex h-full min-h-webkit w-full flex-col">
          <Header />
          <div className="w-full flex-1">
            <Routes>
              {getRoutes(routes)}
              <Route path="/" element={<Navigate to="/default" replace />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default HomeLayout;
