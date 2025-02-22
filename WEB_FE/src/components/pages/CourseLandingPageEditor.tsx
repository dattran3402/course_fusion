import { useAppSelector } from "@/redux/hook";
import { useState, useEffect, useCallback } from "react";
import Button from "@atlaskit/button";
import Breadcrumbs, { BreadcrumbsItem } from "@atlaskit/breadcrumbs";
import __noop from "@atlaskit/ds-lib/noop";
import ReactQuill from "react-quill";

import LoadingButton from "../common/buttons/LoadingButton";
import CourseApi from "@/api/courseApi";

const CourseLandingPageEditor = () => {
  const currentCourse = useAppSelector((state) => state.context.currentCourse);

  const [subtitle, setSubtitle] = useState(currentCourse.subtitle || "");
  const [description, setDescription] = useState(
    currentCourse.description || ""
  );
  const [whatWillLearn, setWhatWillLearn] = useState(
    currentCourse.whatWillLearn || ""
  );
  const [requirements, setRequirements] = useState(
    currentCourse.requirements || ""
  );
  const [whoThisCourseFor, setWhoThisCourseFor] = useState(
    currentCourse.whoThisCourseFor || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await CourseApi.updateCourse({
        courseId: currentCourse.id,
        subtitle,
        description,
        whatWillLearn,
        requirements,
        whoThisCourseFor,
      });
      setIsSubmitting(false);
    } catch (err) {
      setIsSubmitting(false);
      console.log("err", err);
      handleReset();
    }
    console.log("hi");
  };

  const handleReset = () => {
    setDescription(currentCourse.description || "");
    setWhatWillLearn(currentCourse.whatWillLearn || "");
    setRequirements(currentCourse.requirements || "");
    setWhoThisCourseFor(currentCourse.whoThisCourseFor || "");
  };

  return (
    <div className="mx-10 my-2.5">
      <Breadcrumbs onExpand={__noop}>
        <BreadcrumbsItem text="Manage" key="manage" />
        <BreadcrumbsItem text="Information" key="information" />
      </Breadcrumbs>

      <h4 className="mt-10">Subtitle</h4>
      <ReactQuill theme="snow" value={subtitle} onChange={setSubtitle} />

      <h4 className="mt-10">Description</h4>
      <ReactQuill theme="snow" value={description} onChange={setDescription} />

      <h4 className="mt-10">What you'll learn</h4>
      <ReactQuill
        theme="snow"
        value={whatWillLearn}
        onChange={setWhatWillLearn}
      />

      <h4 className="mt-10">Requirements</h4>
      <ReactQuill
        theme="snow"
        value={requirements}
        onChange={setRequirements}
      />

      <h4 className="mt-10">Who this course is for</h4>
      <ReactQuill
        theme="snow"
        value={whoThisCourseFor}
        onChange={setWhoThisCourseFor}
      />

      <div className="mb-20 mt-10 flex w-full justify-end gap-4">
        <Button onClick={() => handleReset()}>Reset</Button>
        <LoadingButton
          isLoading={isSubmitting}
          appearance="primary"
          content="Submit"
          onClick={() => {
            handleSubmit();
          }}
          type="Submit"
        ></LoadingButton>
      </div>
    </div>
  );
};

export default CourseLandingPageEditor;
