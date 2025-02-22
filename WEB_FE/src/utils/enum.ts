export enum UploadActionEnum {
  UPLOAD = "upload",
  UPLOADS = "uploads",
  UPLOAD_FROM_URL = "upload_fromUrl",
}

export enum UploadTypeEnum {
  FILE = "FILE",
  URL = "URL",
  FILES = "FILES",
}

export enum SubscriptionPlanEnum {
  MONTHLY = "MONTHLY",
  ANNUAL = "ANNUAL",
}

export enum PlanEnum {
  TRIAL = "trial",
  BUSINESS = "business",
}

export enum ChatModeEnum {
  SINGLE = "single",
  MULTIPLE = "multiple",
}

export enum ProductEnum {
  TRIAL = "trial",
  BUSINESS = "business",
  PREMIUM = "premium",
}

export enum CourseSectionTypeEnum {
  LIST = "LIST",
  VIDEO = "VIDEO",
  FILES = "FILES",
  ASSIGNMENT = "ASSIGNMENT",
  QUIZ = "QUIZ",
}

export enum FileTypeEnum {
  PDF = "application/pdf",
  DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  PPTX = "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  JPEG = "image/jpeg",
  PNG = "image/png",
  TXT = "text/plain",
  CSV = "text/csv",
  HTML = "text/html",
  JSON = "application/json",
  MP3 = "audio/mpeg",
  MP4 = "video/mp4",
  MOV = "video/quicktime",
  RAR = "application/vnd.rar",
  SEVEN_ZIP = "application/x-7z-compressed",
  UNKNOWN = "",
}

export enum AssignmentStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export enum QuizQuestionTypeEnum {
  SELECT = "SELECT",
  MULTI_SELECT = "MULTI_SELECT",
  FILL = "FILL",
  SORT = "SORT",
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

export enum CourseFilterEnum {
  YOUR_LEARNING = "YOUR_LEARNING",
  RECOMMEND = "RECOMMEND",
  TOP_RATE = "TOP_RATE",
  POPULATE = "POPULATE",
  NEW = "NEW",
  ALL = "ALL",
  WISH_LIST = "WISH_LIST",
}
