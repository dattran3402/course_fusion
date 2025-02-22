import { PDFDocument, rgb } from "pdf-lib";
import { useState, useEffect } from "react";
import Button from "@atlaskit/button";
import fontKit from "@pdf-lib/fontkit";
import { useParams } from "react-router-dom";
import { Document, Page } from "react-pdf";

import { saveFile } from "@/utils/helper";
import CourseApi from "@/api/courseApi";
import UserApi from "@/api/userApi";
import { Link } from "react-router-dom";
import { CourseType, UserType } from "@/utils/types";

const Certificate = () => {
  const { id } = useParams();
  const [fileUrl, setFileUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [studentCourseRelation, setStudentCourseRelation] = useState<any>(null);
  const [userData, setUserData] = useState<UserType>();
  const [courseData, setCourseData] = useState<CourseType>();

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const fetchData = async () => {
    try {
      const courseStudent = await CourseApi.getStudentCourseRelation(id);
      const courseStudentData = courseStudent.data;

      console.log("courseStudentData", courseStudentData);

      if (!courseStudentData.finishedDate) {
        throw Error("Not found");
      }

      const promises = [
        await UserApi.getUserById(courseStudentData.studentId),
        await CourseApi.getCourseById(courseStudentData.courseId),
      ];
      const res = await Promise.all(promises);

      const userRes = res[0];
      const courseRes = res[1];

      const instructor = await UserApi.getUserById(courseRes.teacherId);

      generateCertificatePDFFile({
        studentName: userRes.name,
        courseName: courseRes.name,
        teacherName: instructor.name,
        date: formatDate(new Date()),
        verifyUrl: window.location.href,
      });

      setUserData(userRes);
      setCourseData(courseRes);
      setStudentCourseRelation(courseStudentData);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const generateCertificatePDFFile = async ({
    studentName,
    courseName,
    teacherName,
    date,
    verifyUrl,
  }) => {
    setIsLoading(true);

    // Create a new blank PDF file
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontKit);

    // Get certificate PDF file template
    const existingPdfBytes = await fetch("../../cert.pdf").then((res) =>
      res.arrayBuffer()
    );
    const firstDonorPdfDoc = await PDFDocument.load(existingPdfBytes);
    const [firstDonorPage] = await pdfDoc.copyPages(firstDonorPdfDoc, [0]);

    // PDF first page size
    const pageSize = firstDonorPage.getSize();

    // Prepare fonts
    const dancingScriptRegularFontBytes = await fetch(
      "../../DancingScript-Regular.ttf"
    ).then((res) => res.arrayBuffer());
    const dancingScriptRegularFont = await pdfDoc.embedFont(
      dancingScriptRegularFontBytes
    );

    const openSansRegularFontBytes = await fetch(
      "../../open-sans.regular.ttf"
    ).then((res) => res.arrayBuffer());
    const openSansRegularFont = await pdfDoc.embedFont(
      openSansRegularFontBytes
    );

    // Calculate position for student name
    const studentNameText = studentName;
    const studentNameFontSize = 64;
    const studentNameFontWidth = dancingScriptRegularFont.widthOfTextAtSize(
      studentNameText,
      studentNameFontSize
    );
    const studentNameXPosition = (pageSize.width - studentNameFontWidth) / 2;

    // Draw student name to the page
    firstDonorPage.drawText(studentNameText, {
      x: studentNameXPosition,
      y: 336,
      size: studentNameFontSize,
      font: dancingScriptRegularFont,
      color: rgb(0, 0, 0),
    });

    // Calculate position for teacher name
    const teacherNameText = teacherName;
    const teacherNameFontSize = 18;
    const teacherNameFontWidth = openSansRegularFont.widthOfTextAtSize(
      teacherNameText,
      teacherNameFontSize
    );
    const teacherNameXPosition =
      (pageSize.width - 250 - teacherNameFontWidth) / 2;

    // Draw teacher name to the page
    firstDonorPage.drawText(teacherNameText, {
      x: teacherNameXPosition,
      y: 84,
      size: teacherNameFontSize,
      font: openSansRegularFont,
      color: rgb(0, 0, 0),
    });

    // Calculate position for course name
    const courseNameText = courseName;
    const courseNameFontSize = 18;
    const courseNameFontWidth = openSansRegularFont.widthOfTextAtSize(
      courseNameText,
      courseNameFontSize
    );
    const courseNameXPosition = (pageSize.width - courseNameFontWidth) / 2;

    // Draw course name to the page
    firstDonorPage.drawText(courseNameText, {
      x: courseNameXPosition,
      y: 270,
      size: courseNameFontSize,
      font: openSansRegularFont,
      color: rgb(0, 0, 0),
    });

    // Calculate position for date
    const dateText = date;
    const dateFontSize = 16;
    const dateFontWidth = openSansRegularFont.widthOfTextAtSize(
      dateText,
      dateFontSize
    );
    const dateXPosition = (pageSize.width - dateFontWidth) / 2;

    // Draw date to the page
    firstDonorPage.drawText(dateText, {
      x: dateXPosition,
      y: 210,
      size: dateFontSize,
      font: openSansRegularFont,
      color: rgb(141 / 255, 141 / 255, 141 / 255),
    });

    // Calculate position for verify url
    const verifyUrlText = `Verification URL: ${verifyUrl}`;
    const verifyUrlFontSize = 12;
    const verifyUrlFontWith = openSansRegularFont.widthOfTextAtSize(
      verifyUrlText,
      verifyUrlFontSize
    );
    const verifyUrlXPosition = (pageSize.width - verifyUrlFontWith) / 2;

    // Draw verify url to the page
    firstDonorPage.drawText(verifyUrlText, {
      x: verifyUrlXPosition,
      y: 174,
      size: verifyUrlFontSize,
      font: openSansRegularFont,
      color: rgb(0 / 255, 82 / 255, 204 / 255),
    });

    // Add the page to the PDF file
    pdfDoc.addPage(firstDonorPage);

    // Generate link for PDF file
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    setFileUrl(url);
    setIsLoading(false);
  };

  return (
    <div className="flex w-full flex-col items-center justify-center">
      {!isLoading && (
        <>
          {studentCourseRelation ? (
            <>
              <div className="mt-4 flex w-full flex-row items-center justify-center">
                <Document file={fileUrl}>
                  <Page
                    pageNumber={1}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                  />
                </Document>
              </div>

              <div className="m-4 flex w-[800px] justify-between">
                <div className="flex flex-col gap-2">
                  <Link to={"/profile/" + userData?.id}>
                    Link to student profile
                  </Link>
                  <div>Student name: {userData?.name}</div>
                  <div>Student email: {userData?.email}</div>
                  <Link to={"/course/" + courseData?.id}>Link to course</Link>
                  <div>Course name: {courseData?.name}</div>
                  <div>
                    Completed at:{" "}
                    {formatDate(new Date(studentCourseRelation.finishedDate))}
                  </div>
                </div>

                <Button
                  appearance="primary"
                  onClick={() => {
                    saveFile({ url: fileUrl });
                  }}
                >
                  Download as pdf
                </Button>
              </div>
            </>
          ) : (
            <div>NOT FOUND</div>
          )}
        </>
      )}
    </div>
  );
};

export default Certificate;
