import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import routes from "@/routes";
import { ReactNode, useState } from "react";

import { RoutesType } from "@/utils/types";

const NoLayout = () => {
  const getRoutes = (routes: RoutesType[]): ReactNode => {
    return routes.map((prop, key) => {
      if (prop.layout === "no-layout") {
        console.log("no-layout");

        return (
          <Route path={`/${prop.path}`} element={prop.component} key={key} />
        );
      } else {
        return null;
      }
    });
  };

  return <Routes>{getRoutes(routes)}</Routes>;
};

export default NoLayout;
