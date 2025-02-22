import { FC, ReactNode } from "react";
import { token } from "@atlaskit/tokens";
import Avatar from "@atlaskit/avatar";

import { SizeType } from "@atlaskit/avatar";

const UserAvatar = ({
  userName = "None",
  avatarUrl = "",
  size = "medium",
}: {
  userName?: string;
  avatarUrl?: string;
  size?: SizeType;
}) => {
  const NameWrapper: FC<{ children: ReactNode }> = ({ children }) => (
    <span
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      {children}
    </span>
  );

  const AvatarWrapper: FC<{ children: ReactNode }> = ({ children }) => (
    <div
      style={{
        marginRight: token("space.100", "8px"),
      }}
    >
      {children}
    </div>
  );

  return (
    <NameWrapper>
      <AvatarWrapper>
        <Avatar name={avatarUrl} size={size} />
      </AvatarWrapper>
      {userName}
    </NameWrapper>
  );
};

export default UserAvatar;
