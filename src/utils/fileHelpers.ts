export const getFileContents = (file: File): Promise<string> => {
  return new Promise((res, rej) => {
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function () {
      if (typeof reader.result === "string") res(reader.result);
      else rej();
    };
    reader.onerror = function (error) {
      console.log("Error: ", error);
      rej();
    };
  });
};
