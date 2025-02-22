import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AtlassianIcon } from "@atlaskit/logo";
import {
  AtlassianNavigation,
  PrimaryButton,
  Search,
  Settings,
  Help,
  Notifications,
  ProductHome,
  SignIn,
} from "@atlaskit/atlassian-navigation";
import { useAppSelector } from "@/redux/hook";
import styled from "styled-components";

import ProfileDropdown from "./ProfileDropdown";
import NotificationDropdown from "./NotificationDropdown";
import MyLearningDropdown from "./MyLearningDropdown";
import WishlistDropdown from "./WishlistDropdown";

const HeaderStyles = styled.header`
  background-color: var(--ds-surface, #ffffff);
  color: var(--ds-text-subtlest, #6b778c);
  display: flex;
  box-sizing: border-box;
  height: 56px;
  padding-right: var(--ds-space-150, 12px);
  padding-left: var(--ds-space-150, 12px);
  position: relative;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-pack: justify;
  justify-content: space-between;
  border-bottom: 1px solid var(--ds-border, #ebecf0);

  div[role="search"] {
    width: 50%;

    input {
      height: 40px;
      width: 100%;
    }
  }
`;

const Header = () => {
  const user = useAppSelector((state) => state.context.user);

  const DefaultSignIn = () => {
    if (!user) {
      return <SignIn href="/auth/sign-in" tooltip="Sign in" />;
    } else {
      return null;
    }
  };

  const AtlassianProductHome = () => (
    <Link to={"/"}>
      <ProductHome
        icon={AtlassianIcon}
        logo={() => (
          <div className="flex items-center">
            <AtlassianIcon appearance="brand" size="small" />
            <div className="text-xl font-semibold">CourseFusion</div>
          </div>
        )}
      />
    </Link>
  );

  const DefaultNotifications = () => {
    return <NotificationDropdown />;
  };

  return (
    <div className="sticky left-0 top-0 z-10">
      <HeaderStyles>
        <div className="flex gap-4">
          <AtlassianProductHome />
          <MyLearningDropdown />
          <WishlistDropdown />
        </div>

        <div className="flex flex-row items-center gap-2">
          <DefaultNotifications />
          <ProfileDropdown />
          <DefaultSignIn />
        </div>
      </HeaderStyles>
    </div>
  );
};

export default Header;
