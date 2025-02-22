import Breadcrumbs, { BreadcrumbsItem } from "@atlaskit/breadcrumbs";
import __noop from "@atlaskit/ds-lib/noop";
import { useAppSelector } from "@/redux/hook";
import PageHeader from "@atlaskit/page-header";
import { useMemo } from "react";

import { SectionType } from "@/utils/types";

const SectionHeader = () => {
  const currentSection = useAppSelector(
    (state) => state.context.currentSection
  );
  const sections = useAppSelector((state) => state.context.sections);

  const renderBreadcrumbs = useMemo(() => {
    if (currentSection && sections.length > 0) {
      let temp = currentSection;
      const sectionList: SectionType[] = [];
      // sectionList.unshift(temp);
      while (temp.parentSectionId !== "") {
        temp = sections.filter(
          (section) => section.id === temp.parentSectionId
        )[0];
        sectionList.unshift(temp);
      }

      return (
        <Breadcrumbs onExpand={__noop}>
          {sectionList.map((section) => (
            <BreadcrumbsItem text={section.name} key={section.id} />
          ))}
        </Breadcrumbs>
      );
    }
  }, [sections, currentSection]);

  return (
    <PageHeader breadcrumbs={renderBreadcrumbs}>
      {currentSection.name}
    </PageHeader>
  );
};

export default SectionHeader;
