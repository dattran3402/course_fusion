import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import routes from "@/routes";
import { ReactNode, useState } from "react";

import Footer from "../common/footer/Footer";
import Header from "../common/header/Header";
import { RoutesType } from "@/utils/types";

const MainLayout = () => {
  const getRoutes = (routes: RoutesType[]): ReactNode => {
    return routes.map((prop, key) => {
      if (prop.layout === "main-layout") {
        return (
          <Route path={`/${prop.path}`} element={prop.component} key={key} />
        );
      } else {
        return null;
      }
    });
  };

  return (
    <div className="h-full min-h-webkit">
      <div className={`relative z-0 box-border flex min-h-webkit`}>
        <div className="relative flex h-full min-h-webkit w-full flex-col">
          <Header />
          <div className="h-full min-h-[calc(100vh_-_120px)] w-full flex-1">
            <Routes>{getRoutes(routes)}</Routes>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
