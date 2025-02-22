/* eslint-disable @typescript-eslint/no-explicit-any */
import _ from "lodash";

import { SectionType, AntdFileType } from "./types";
import { CourseSectionTypeEnum } from "./enum";

export const reSplitAlphaNumeric = /([0-9]+)/gm;

export const setStorage = (key: string, value: string) => {
  window.localStorage.setItem(key, value);
};

export const getStorage = (key: string) => window.localStorage.getItem(key);

export const removeStorage = (key: string) =>
  window.localStorage.removeItem(key);

const isEmpty = (value?: string | null) => value == null || value === "";

export const isEmail = (value: string) => {
  // Let's not start a debate on email regex. This is just for an example app!
  if (
    !isEmpty(value) &&
    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
  ) {
    return "Invalid email address";
  }
  return false;
};

// eslint-disable-next-line no-control-regex
export const isHalfsize = (value: string) => /^[\u0000-\u00ff]+$/.test(value);

type Classname = string | { [key: string]: unknown };

export const classnames = (...classname: Classname[]) =>
  classname
    .reduce((list: unknown[], name) => {
      if (typeof name == "string") list.push(name.trim());
      else {
        Object.entries(name).forEach(([key, value]) => {
          if (!!value) list.push(key);
        });
      }
      return list;
    }, [])
    .join(" ");

export const convertKeysToSnakeCase = (
  obj: Record<string, any>
): Record<string, any> => {
  const snakeCaseObject = _.mapKeys(obj, (_value, key) => _.snakeCase(key));
  return snakeCaseObject;
};

export const getHoursMinutes = (value: string) => {
  if (value) {
    const datetime = new Date(value);
    const hour = datetime.getHours();
    const minute = datetime.getMinutes();

    return hour + ":" + minute;
  }
};

export function generateRandomString(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    result += characters.charAt(randomIndex);
  }

  return result;
}

export function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function formatBytes(bytes) {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YiB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  let formattedBytes: number;

  if (i === 1) {
    formattedBytes = Math.round(bytes / Math.pow(k, i));
  } else {
    formattedBytes = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  }

  return `${formattedBytes} ${sizes[i]}`;
}

export function sortObjects<T>(
  objects: T[],
  attribute: string,
  desc = true
): T[] {
  return objects.sort((a, b) => {
    const valueA = a[attribute];
    const valueB = b[attribute];

    if (valueA === valueB) {
      return 0;
    }

    if (desc) {
      return valueA.toLowerCase() > valueB.toLowerCase() ? -1 : 1;
    } else {
      return valueA.toLowerCase() < valueB.toLowerCase() ? -1 : 1;
    }
  });
}

export const getPercent = (value: number, total: number) => {
  if (value === 0) return 0;
  if (value && total) {
    // return (value * 100) / total;
    return (value * 100) / total >= 0.5 ? (value * 100) / total : 0.5;
  }
};

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date string");
  }

  // plug time + 7 hours
  date.setHours(date.getHours() + 7);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes} ${day}/${month}/${year}`;
}

export const isNull = (obj) => {
  return obj === undefined || obj === null;
};

export const isEmptyArray = (array: Array<any>) => {
  return array.length === 0 && (isNull(array) || isNull(array[0]));
};

export const formatDateToYYYYMMDD = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}/${month}/${day}`;
};

export const toTimestamp = (strDate: string) => {
  const dt = Date.parse(strDate);
  return dt / 1000;
};

export const isNumeric = (str: any) => {
  if (typeof str != "string") {
    return false; // we only process strings!
  }
  return /^\d+$/.test(str);
};

export const getFileUrl = (fileId) => {
  if (fileId) {
    return import.meta.env.VITE_BASE_API_URL + "/document/view/" + fileId;
  } else {
    return "";
  }
};

export const getSectionByOffset = ({
  sections,
  currentSectionId,
  offset,
}: {
  sections: SectionType[];
  currentSectionId?: string;
  offset: number;
}) => {
  const arr: any[] = [];

  const findFirstCourse = (section) => {
    arr.push(section);
    const childrenSections = sections.filter(
      (sec) => sec.parentSectionId === section.id
    );
    childrenSections.forEach((childSection) => findFirstCourse(childSection));
  };

  sections
    .filter((section) => section.parentSectionId === "")
    .forEach((section) => findFirstCourse(section));

  let currentSectionIndex = -1;
  if (currentSectionId) {
    currentSectionIndex = arr.findIndex(
      (section) => section.id === currentSectionId
    );
  }

  if (offset === 0) {
    return arr.filter(
      (section) => section.type !== CourseSectionTypeEnum.LIST
    )[0];
  } else if (offset > 0) {
    return arr.filter(
      (section, index) =>
        section.type !== CourseSectionTypeEnum.LIST &&
        index > currentSectionIndex
    )[0];
  } else {
    return arr
      .filter(
        (section, index) =>
          section.type !== CourseSectionTypeEnum.LIST &&
          index < currentSectionIndex
      )
      .reverse()[0];
  }
};

export const getBase64 = (file: AntdFileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export const saveFile = ({ fileName = "hihi", url }) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
};

export const truncateString = (str, maxLength) => {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength - 3) + "...";
};

export const getSectionTypes = (sections) => {
  const video = sections.filter(
    (section) => section.type === CourseSectionTypeEnum.VIDEO
  );
  const files = sections.filter(
    (section) => section.type === CourseSectionTypeEnum.FILES
  );
  const quiz = sections.filter(
    (section) => section.type === CourseSectionTypeEnum.QUIZ
  );
  const assignment = sections.filter(
    (section) => section.type === CourseSectionTypeEnum.ASSIGNMENT
  );
  const list = sections.filter(
    (section) => section.type === CourseSectionTypeEnum.LIST
  );

  return {
    video,
    files,
    quiz,
    assignment,
    list,
    lecture: [...files, ...video],
  };
};
