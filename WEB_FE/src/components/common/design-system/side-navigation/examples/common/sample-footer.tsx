import { Fragment } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hook";

import Button from "@atlaskit/button";
import Icon from "@atlaskit/icon";
import { CustomItemComponentProps } from "@atlaskit/menu";

import { Footer } from "@atlaskit/side-navigation";

import SampleIcon from "./next-gen-project-icon";

export const CustomItemFooter = ({
  children,
  ...props
}: CustomItemComponentProps) => {
  const Component = props.onClick ? "a" : "div";
  return <Component {...props}>{children}</Component>;
};

// This example footer conforms to a design taken from Jira designs found at
// https://www.figma.com/file/GA22za6unqO2WsBWM0Ddxk/Jira-navigation-3?node-id=124%3A7194
const ExampleFooter = () => {
  const currentCourse = useAppSelector((state) => state.context.currentCourse);

  return (
    <Footer
      useDeprecatedApi={false}
      description={
        <Fragment>
          <Button appearance="subtle-link" href="/feedback" spacing="none">
            Give feedback
          </Button>
          {" ∙ "}
          <Button appearance="subtle-link" href="/learn" spacing="none">
            Learn more
          </Button>
        </Fragment>
      }
      iconBefore={<Icon label="mode" glyph={SampleIcon} />}
    ></Footer>
  );
};

export default ExampleFooter;
