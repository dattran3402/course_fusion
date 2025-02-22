export const Http = {
  BASE_URL: "https://dev-api.pdftalk.jp:8000",
  REQUEST_TIMEOUT: 60000, // 60s
  REQUEST_TIMEOUT_UPLOAD: 600000, // 10 minutes
  PATH: {
    auth: {
      login: "/auth/sign-in",
      register: "/auth/register",
      verify: "auth/verify",
      resendEmail: "auth/resend-email",
    },
    versions: "/versions",
    upload: "/upload",
    answer: "/answer",
  },
};

export const StatusChildAccount = {
  STATUS: {
    ACTIVE: "Active",
    DEACTIVE: "Deactive",
  },
};

export const ConstantRegex = {
  REGEX: {
    PDF_REGEX: /\.pdf/i,
    IMAGE_REGEX: /\.(png|jpg)/i,
    OFFICE_REGEX: /\.(xlsx|bmp|pptx|doc)/i,
    REGEX_LINK:
      /(https?:\/\/[^\s「」]+(?:「[^」]*」)?(?:\.[^\s「」]+[^\s「」.,)\]-]))/g,
  },
  TYPE_LINK: {
    PDF: "PDF",
    IMAGE: "IMAGE",
    OFFICE: "OFFICE",
  },
};
