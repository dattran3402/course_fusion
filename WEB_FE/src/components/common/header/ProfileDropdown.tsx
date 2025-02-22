import { Profile } from "@atlaskit/atlassian-navigation";
import Avatar from "@atlaskit/avatar";
import { useAppSelector } from "@/redux/hook";
import DropdownMenu, {
  DropdownItem,
  DropdownItemGroup,
} from "@atlaskit/dropdown-menu";
import Cookies from "js-cookie";
import { useNavigate, Link } from "react-router-dom";

import styled from "styled-components";
import { getFileUrl, truncateString } from "@/utils/helper";
import { UserRole } from "@/utils/enum";

const DashLineStyles = styled.div`
  width: 100%;
  background-color: #cecece;
  height: 0.5px;
`;

const ProfileDropdown = () => {
  const user = useAppSelector((state) => state.context.user);

  const handleLogout = () => {
    Cookies.remove("userId");
    // window.location.reload();
    window.location.href = "/auth/sign-in";
  };

  if (user) {
    return (
      <DropdownMenu
        trigger={({ triggerRef, ...props }) => (
          <Profile
            icon={
              <Avatar
                size="small"
                src={getFileUrl(user.avatarFileId)}
                name="Atlassian account: Emil Rottmayer"
                ref={triggerRef}
                {...props}
              />
            }
            tooltip="Your profile and settings"
          />
        )}
      >
        <DropdownItemGroup>
          <DropdownItem isDisabled>
            <div className="flex">
              <div className="px-2">
                <Avatar
                  size="medium"
                  src={getFileUrl(user.avatarFileId)}
                  name="Atlassian account: Emil Rottmayer"
                />
              </div>
              <div className="flex flex-col">
                <div>{truncateString(user.name, 20)}</div>
                <div>{user.email}</div>
              </div>
            </div>
          </DropdownItem>

          <DashLineStyles />

          <Link to={"/profile/" + user.id}>
            <DropdownItem>Profile</DropdownItem>
          </Link>

          <DashLineStyles />

          <Link to={"/account/"}>
            <DropdownItem>Account settings</DropdownItem>
          </Link>

          <Link to={"/teacher/"}>
            <DropdownItem>Teacher view</DropdownItem>
          </Link>

          {user?.role === UserRole.ADMIN && (
            <DropdownItem>
              <Link to={"/admin/"}>Admin view</Link>
            </DropdownItem>
          )}

          <DashLineStyles />

          <DropdownItem onClick={handleLogout}>Logout</DropdownItem>
        </DropdownItemGroup>
      </DropdownMenu>
    );
  } else {
    return null;
  }
};

export default ProfileDropdown;
