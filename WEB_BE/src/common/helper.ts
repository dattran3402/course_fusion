export const getContentType = (filePath: string): string => {
  if (filePath.endsWith(".pdf")) {
    return "application/pdf";
  } else if (filePath.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  } else if (filePath.endsWith(".pptx")) {
    return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  } else if (filePath.endsWith(".xlsx")) {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  } else if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) {
    return "image/jpeg";
  } else if (filePath.endsWith(".png")) {
    return "image/png";
  } else if (filePath.endsWith(".txt")) {
    return "text/plain";
  } else if (filePath.endsWith(".csv")) {
    return "text/csv";
  } else if (filePath.endsWith(".html")) {
    return "text/html";
  } else if (filePath.endsWith(".json")) {
    return "application/json";
  } else if (filePath.endsWith(".mp3")) {
    return "audio/mpeg";
  } else if (filePath.endsWith(".mp4")) {
    return "video/mp4";
  } else if (filePath.endsWith(".mov")) {
    return "video/quicktime";
  } else if (filePath.endsWith(".rar")) {
    return "application/vnd.rar";
  } else if (filePath.endsWith(".7z")) {
    return "application/x-7z-compressed";
  } else {
    return "";
  }
};

export const getUpdateData = (updateFields) => {
  const updateData = {};
  for (const [field, value] of Object.entries(updateFields)) {
    if (value !== undefined) {
      updateData[field] = value;
    }
  }

  return updateData;
};

export const getRandomElements = (arr: any[], n: number) => {
  // Make a copy of the array to avoid mutating the original array
  const arrayCopy = [...arr];

  // Shuffle the array using Fisher-Yates algorithm
  for (let i = arrayCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
  }

  // Return the first n elements of the shuffled array
  return arrayCopy.slice(0, n);
};
