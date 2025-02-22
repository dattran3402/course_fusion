import { CourseSectionTypeEnum, AssignmentStatus, UserRole } from "./enum";
import { GetProp, UploadProps } from "antd";

export type AntdFileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

export interface RoutesType {
  name: string;
  layout: string;
  component: JSX.Element;
  icon: JSX.Element | string;
  path: string;
  secondary?: boolean;
  intro?: boolean;
}

export interface CourseType {
  id: string;
  name: string;
  teacherId: string;
  price: number;
  backgroundFileId?: string;
  configuration?: string;
  status: string;
  tags?: string[];
  description?: string;
  whatWillLearn?: string;
  requirements?: string;
  whoThisCourseFor?: string;
  promoVideoFileId?: string;
  subtitle?: string;
  totalReview?: number;
  totalReviewStar?: number;
  totalStudents?: number;
  requiresSequentialViewing?: boolean;
  percentToViewNext?: number;
}

export interface SectionType {
  id: string;
  name: string;
  courseId: string;
  order: number;
  parentSectionId: string;
  type: CourseSectionTypeEnum;
  description: string;
  openDate: number;
  dueDate: number;
  // children: SectionType[];
}

export interface UserType {
  id: string;
  name: string;
  email: string;
  avatarFileId: string;
  headline?: string;
  biography?: string;
  website?: string;
  twitter?: string;
  facebook?: string;
  linkedIn?: string;
  youtube?: string;
  stripeCustomerId?: string;
  role?: UserRole;
  favouriteCourseIds?: string[];
}

export interface FileType {
  id: string;
  name: string;
  sectionId: string;
  size: number;
  type: string;
  url: string;
}

export interface AssignmentStudent {
  assignmentId: string;
  userId: string;
  status: AssignmentStatus;
  grade: number;
  createdAt: string;
}

export interface QuizQuestionType {
  id: string;
  type: string;
  question: string;
  options?: {
    id: string;
    content: string;
  }[];
  answer?: string;
  tags?: string[];
  courseId: string;
}

export interface SelectOptionType {
  label: string;
  value: string;
}
