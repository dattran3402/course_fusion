import SuccessIcon from "@atlaskit/icon/glyph/check-circle";
import ErrorIcon from "@atlaskit/icon/glyph/error";
import { G300 } from "@atlaskit/theme/colors";
import { token } from "@atlaskit/tokens";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import { AutoDismissFlag, FlagGroup } from "@atlaskit/flag";

import { dismissFlag } from "@/redux/features/contextSlice";

const Flags = () => {
  const flags = useAppSelector((state) => state.context.flags);
  const dispatch = useAppDispatch();

  const getFlag = (flag) => {
    if (flag.color === "success") {
      return (
        <AutoDismissFlag
          id={flag.id}
          key={flag.id}
          appearance="success"
          icon={
            <SuccessIcon
              primaryColor={token(`color.icon.success`, G300)}
              label="Success"
              size="medium"
            />
          }
          title={`#${flag.content}`}
          description="I will auto dismiss after 8 seconds."
        />
      );
    } else {
      return (
        <AutoDismissFlag
          id={flag.id}
          key={flag.id}
          appearance="error"
          icon={
            <ErrorIcon
              primaryColor={token(`color.background.danger.bold`)}
              secondaryColor={token(`color.background.danger.bold`)}
              label="Fail"
              size="medium"
            />
          }
          title={`#${flag.content}`}
          description="I will auto dismiss after 8 seconds."
        />
      );
    }
  };

  return (
    <FlagGroup
      onDismissed={() => {
        dispatch(dismissFlag());
      }}
    >
      {flags.map((flag) => getFlag(flag))}
    </FlagGroup>
  );
};

export default Flags;
