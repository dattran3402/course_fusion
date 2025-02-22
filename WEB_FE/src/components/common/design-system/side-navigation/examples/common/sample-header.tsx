import { useAppSelector, useAppDispatch } from "@/redux/hook";
import { useNavigate } from "react-router-dom";

import Icon from "@atlaskit/icon";
import { CustomItemComponentProps } from "@atlaskit/menu";
import { Header } from "@atlaskit/side-navigation";

import SampleIcon from "./sample-logo";

const Container = ({ children, ...props }: CustomItemComponentProps) => {
  return <div {...props}>{children}</div>;
};

const ExampleHeader = () => {
  const navigate = useNavigate();

  const currentCourse = useAppSelector((state) => state.context.currentCourse);

  return (
    <Header
      component={Container}
      // description="Next-gen service desk"
      iconBefore={<Icon label="" glyph={SampleIcon} size="medium" />}
      onClick={() => navigate(`/course/${currentCourse.id}`)}
    >
      <div className="cursor-pointer">{currentCourse?.name}</div>
    </Header>
  );
};

export default ExampleHeader;
