import { useAppSelector } from "@/redux/hook";
import Breadcrumbs, { BreadcrumbsItem } from "@atlaskit/breadcrumbs";
import __noop from "@atlaskit/ds-lib/noop";

import SectionTableTree from "./SectionTableTree";
import AddSection from "./AddSection";

const ManageSection = () => {
  const sections = useAppSelector((state) => state.context.sections);

  return (
    <div className="mx-10 my-2.5">
      <Breadcrumbs onExpand={__noop}>
        <BreadcrumbsItem text="Manage" key="manage" />
        <BreadcrumbsItem text="Sections" key="sections" />
      </Breadcrumbs>

      <div className="my-10">
        {sections
          .filter((section) => section.parentSectionId === "")
          .map((section) => (
            <SectionTableTree key={section.id} section={section} />
          ))}
        <AddSection parentSectionId="" />
      </div>

      <div className="h-60"></div>
    </div>
  );
};

export default ManageSection;
