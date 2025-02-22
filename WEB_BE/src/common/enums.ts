export enum CourseSectionType {
  LIST = "LIST",
  VIDEO = "VIDEO",
  FILES = "FILES",
  ASSIGNMENT = "ASSIGNMENT",
  QUIZ = "QUIZ",
}

export enum AssignmentStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export enum QuizStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export enum QuizQuestionType {
  SELECT = "SELECT",
  MULTI_SELECT = "MULTI_SELECT",
  FILL = "FILL",
  SORT = "SORT",
}

export enum TokenType {
  TYPE_RESEND = "TOKEN_TYPE_RESEND",
}

export enum UserStatus {
  NEW = "NEW",
  VERIFIED = "VERIFIED",
  INACTIVE = "INACTIVE",
}

export enum HttpMethod {
  ALL = "ALL",
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export enum ChatAuthor {
  AI = "AI",
  ME = "ME",
}

export enum FileUploadStatus {
  PROGRESSING = "PROGRESSING",
  FAILED = "FAILED",
  SUCCEED = "SUCCEED",
}

export enum UserRole {
  NORMAL = "NORMAL",
  ADMIN = "ADMIN",
}

export enum CourseStatus {
  PRIVATE = "PRIVATE",
  REVIEW = "REVIEW",
  PUBLIC = "PUBLIC",
}
