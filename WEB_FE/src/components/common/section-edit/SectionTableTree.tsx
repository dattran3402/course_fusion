import { useState, useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hook";

import ChevronDownIcon from "@atlaskit/icon/glyph/chevron-down";
import ChevronRightIcon from "@atlaskit/icon/glyph/chevron-right";
import MoreIcon from "@atlaskit/icon/glyph/more";
import DropdownMenu, {
  DropdownItem,
  DropdownItemGroup,
} from "@atlaskit/dropdown-menu";
import OpenIcon from "@atlaskit/icon/glyph/open";
import { Link } from "react-router-dom";

import { CourseSectionTypeEnum } from "@/utils/enum";
import { SectionType } from "@/utils/types";
import AddSection from "./AddSection";
import { setSections } from "@/redux/features/contextSlice";
import SectionApi from "@/api/sectionApi";
import EditSection from "./EditSection";

const SectionTableTree = ({ section }: { section: SectionType }) => {
  const dispatch = useAppDispatch();

  const sections = useAppSelector((state) => state.context.sections);
  const currentCourse = useAppSelector((state) => state.context.currentCourse);

  const [showChildren, setShowChildren] = useState<boolean>(true);
  const [childSections, setChildSections] = useState<SectionType[]>();
  const [showEditSection, setShowEditSection] = useState<boolean>(false);

  const currentSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const sectionId = queryParams.get("sectionId");
    if (sectionId === section.id) {
      setShowEditSection(true);
      if (currentSectionRef.current) {
        currentSectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }, []);

  useEffect(() => {
    const children = sections.filter(
      (sec) => sec.parentSectionId === section.id
    );
    setChildSections(children);
  }, [sections]);

  const moveSectionUp = async ({
    section,
    pad,
  }: {
    section: SectionType;
    pad: number;
  }) => {
    const brotherSectionToSwap = sections.filter(
      (sec) =>
        sec.parentSectionId === section.parentSectionId &&
        sec.order === section.order + pad
    )[0];

    if (brotherSectionToSwap === undefined) {
      return;
    }

    const sectionsToUpdate = [
      {
        id: brotherSectionToSwap.id,
        order: section.order,
      },
      {
        id: section.id,
        order: section.order + pad,
      },
    ];

    const updateRes = await SectionApi.updateSections(sectionsToUpdate);

    if (updateRes.status === 200) {
      const newSections = sections.map((sec) => {
        if (sec.id === section.id) {
          return {
            ...sec,
            order: section.order + pad,
          };
        }
        if (sec.id === brotherSectionToSwap.id) {
          return {
            ...sec,
            order: section.order,
          };
        }
        return sec;
      });

      dispatch(setSections(newSections));
    }
  };

  const handleDeleteSection = async (section: SectionType) => {
    const userConfirmed = window.confirm(
      "Are you sure you want to delete this section?"
    );

    if (userConfirmed) {
      const deleteRes = await SectionApi.deleteSectionById(section.id);
      if (deleteRes.status === 200) {
        const newSections = await SectionApi.getSectionsByCourseId(
          currentCourse.id
        );
        dispatch(setSections(newSections));
      }
    }
  };

  const Dropdown = () => {
    return (
      <DropdownMenu
        trigger={({ triggerRef, ...props }) => (
          <div
            className="cursor-pointer"
            ref={triggerRef as React.RefObject<HTMLDivElement>}
            {...props}
          >
            <MoreIcon label="" />
          </div>
        )}
      >
        <DropdownItemGroup>
          <DropdownItem onClick={() => moveSectionUp({ section, pad: -1 })}>
            Move up
          </DropdownItem>
          <DropdownItem onClick={() => moveSectionUp({ section, pad: 1 })}>
            Move down
          </DropdownItem>
          <DropdownItem onClick={() => handleDeleteSection(section)}>
            Delete
          </DropdownItem>
          <DropdownItem onClick={() => setShowEditSection(true)}>
            Edit
          </DropdownItem>
        </DropdownItemGroup>
      </DropdownMenu>
    );
  };

  return (
    <div ref={currentSectionRef}>
      <div className="flex h-12 flex-row items-center justify-between border-b border-solid border-b-[#ccc]">
        <div className="flex flex-row">
          {section.type === CourseSectionTypeEnum.LIST && (
            <button onClick={() => setShowChildren(!showChildren)}>
              {showChildren ? (
                <ChevronDownIcon label="" />
              ) : (
                <ChevronRightIcon label="" />
              )}
            </button>
          )}
          <div>{section.name}</div>
        </div>

        <div className="flex gap-2">
          <Link
            to={`/course/${currentCourse.id}/section/${section.id}`}
            target="_blank"
          >
            <OpenIcon label="" />
          </Link>
          <Dropdown />
        </div>
      </div>
      {showEditSection && (
        <EditSection
          section={section}
          setShowEditSection={setShowEditSection}
        />
      )}
      {showChildren && (
        <div className="ml-8">
          {childSections?.map((section) => (
            <SectionTableTree key={section.id} section={section} />
          ))}
          <AddSection parentSectionId={section.id} />
        </div>
      )}
    </div>
  );
};

export default SectionTableTree;
