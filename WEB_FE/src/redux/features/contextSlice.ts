import { createSlice, PayloadAction, current } from "@reduxjs/toolkit";
import { CourseType, SectionType, UserType } from "@/utils/types";
import { CourseSectionTypeEnum } from "@/utils/enum";
import { getSectionByOffset } from "@/utils/helper";

interface ContextType {
  courses: CourseType[];
  currentCourse: CourseType; // Adjust this based on your actual requirements
  sections: SectionType[];
  lectureAndQuiz: SectionType[];
  courseProgress: any[];
  currentSection: SectionType;
  studentCourseRelation: any;
  openEditSectionModal: boolean;
  user: UserType | null;
  flags: {
    id: string;
    color: string;
    content: string;
  }[];
}

const initialState: ContextType = {
  user: null,
  courses: [],
  courseProgress: [],
  currentCourse: {
    id: "",
    name: "",
    teacherId: "",
    backgroundFileId: "",
    price: 0,
    status: "",
  },
  currentSection: {
    id: "",
    name: "",
    courseId: "",
    description: "",
    order: -1,
    parentSectionId: "",
    type: CourseSectionTypeEnum.LIST,
    openDate: 0,
    dueDate: 0,
  },
  sections: [],
  lectureAndQuiz: [],
  openEditSectionModal: false,
  flags: [],
  studentCourseRelation: null,
};

export const contextSlice = createSlice({
  name: "context",
  initialState,
  reducers: {
    setCurrentCourse: (state, action: PayloadAction<CourseType>) => {
      state.currentCourse = action.payload;
    },
    setCourses: (state, action: PayloadAction<CourseType[]>) => {
      state.courses = action.payload;
    },
    setSections: (state, action: PayloadAction<SectionType[]>) => {
      const newSections = action.payload.sort((a, b) => a.order - b.order);

      const newLectureAndQuiz: any[] = [];
      const getNext = (id) => {
        const section = getSectionByOffset({
          sections: newSections,
          currentSectionId: id,
          offset: 1,
        });

        if (section) {
          newLectureAndQuiz.push(section);
          getNext(section.id);
        }
      };

      const firstLevelSections = newSections.filter(
        (section) => section.parentSectionId === ""
      );

      if (firstLevelSections?.length > 0) {
        getNext(firstLevelSections[0].id);
      }

      state.sections = newSections;
      state.lectureAndQuiz = newLectureAndQuiz;
    },
    setCourseLectureAndQuiz: (state, action: PayloadAction<any | null>) => {
      state.lectureAndQuiz = action.payload;
    },
    setCourseProgress: (state, action: PayloadAction<any | null>) => {
      state.courseProgress = action.payload;
    },
    setUser: (state, action: PayloadAction<UserType | null>) => {
      state.user = action.payload;
    },
    setOpenSectionModal: (state, action: PayloadAction<boolean>) => {
      state.openEditSectionModal = action.payload;
    },
    setCurrentSection: (state, action: PayloadAction<SectionType>) => {
      state.currentSection = action.payload;
    },
    setStudentCourseRelation: (state, action: PayloadAction<any>) => {
      state.studentCourseRelation = action.payload;
    },
    addFlag: (
      state,
      action: PayloadAction<{
        color: string;
        content: string;
      }>
    ) => {
      const oldFlags = state.flags;

      const newFlagId = oldFlags.length + 1;
      const newFlags = oldFlags.slice();
      newFlags.splice(0, 0, {
        id: newFlagId.toString(),
        color: action.payload.color,
        content: action.payload.content,
      });

      state.flags = newFlags;
    },
    dismissFlag: (state) => {
      const oldFlags = state.flags;
      state.flags = oldFlags.slice(1);
    },
  },
});

export const {
  setCurrentCourse,
  setCourses,
  setSections,
  setUser,
  setOpenSectionModal,
  setCurrentSection,
  addFlag,
  dismissFlag,
  setStudentCourseRelation,
  setCourseProgress,
  setCourseLectureAndQuiz,
} = contextSlice.actions;

export default contextSlice.reducer;
