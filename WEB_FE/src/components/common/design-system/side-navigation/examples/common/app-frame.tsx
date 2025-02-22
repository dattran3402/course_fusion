import { HORIZONTAL_GLOBAL_NAV_HEIGHT } from "@atlaskit/atlassian-navigation";
import { N40 } from "@atlaskit/theme/colors";
import { token } from "@atlaskit/tokens";

import GlobalNav from "./global-nav";

interface AppFrameProps {
  children: React.ReactNode;
  content?: React.ReactNode;
  shouldHideAppBar?: boolean;
  shouldHideBorder?: boolean;
}

const AppFrame = ({
  children,
  shouldHideAppBar,
  shouldHideBorder,
  content,
}: AppFrameProps) => {
  return (
    // eslint-disable-next-line
    <div
      onClick={(e) => e.preventDefault()}
      style={{
        height: "100%",
        minHeight: 600,
      }}
    >
      {shouldHideAppBar || (
        <div style={{ zIndex: 10, position: "relative" }}>
          <GlobalNav />
        </div>
      )}
      <div
        style={{
          height: shouldHideAppBar
            ? "100%"
            : `calc(100% - ${HORIZONTAL_GLOBAL_NAV_HEIGHT}px)`,
          minHeight: 600,
          display: "flex",
        }}
      >
        <div
          style={{
            minHeight: 600,
            borderRight: shouldHideBorder
              ? undefined
              : `1px solid ${token("color.border", N40)}`,
          }}
        >
          {children}
        </div>

        {content}
      </div>
    </div>
  );
};

export default AppFrame;
