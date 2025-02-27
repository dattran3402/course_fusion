import { css, jsx } from "@emotion/react";

import { token } from "@atlaskit/tokens";

import { useTheme } from "../../theme";

import { IconButtonSkeletonProps } from "./types";

const buttonHeight = token("space.400", "32px");

const skeletonStyles = css({
  borderRadius: token("border.radius.circle", "50%"),
  opacity: 0.15,
});

// Not exported to consumers, only used in NavigationSkeleton
export const IconButtonSkeleton = ({
  className,
  marginLeft,
  marginRight,
  size,
}: IconButtonSkeletonProps) => {
  const theme = useTheme();

  const dynamicStyles = {
    marginLeft:
      typeof marginLeft === "number" ? marginLeft : token("space.050", "4px"),
    marginRight: typeof marginRight === "number" ? marginRight : 0,
    width: typeof size === "number" ? size : buttonHeight,
    height: typeof size === "number" ? size : buttonHeight,
    ...theme.mode.skeleton,
  };

  return (
    <div
      className={className}
      style={dynamicStyles as React.CSSProperties}
      css={skeletonStyles}
    />
  );
};
