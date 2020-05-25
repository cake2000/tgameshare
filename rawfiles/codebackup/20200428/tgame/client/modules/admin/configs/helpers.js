
export const getBase64String = (file, size, callback) => {
  const reader = new FileReader();

  reader.onloadend = function () {
    const tempImg = new Image();

    tempImg.src = reader.result;
    tempImg.onload = function () {
      let tempH; let tempW;
      const MAX_WIDTH = size.width;
      const MAX_HEIGHT = size.height;
      const canvas = document.createElement('canvas');

      tempW = tempImg.width;
      tempH = tempImg.height;
      if (tempW > tempH) {
        if (tempW > MAX_WIDTH) {
          tempH *= MAX_WIDTH / tempW;
          tempW = MAX_WIDTH;
        }
      } else if (tempH > MAX_HEIGHT) {
        tempW *= MAX_HEIGHT / tempH;
        tempH = MAX_HEIGHT;
      }
      canvas.width = tempW;
      canvas.height = tempH;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(this, 0, 0, tempW, tempH);
      const dataURL = canvas.toDataURL(file.type || 'image/png');

      callback(dataURL);
    };
  };
  reader.readAsDataURL(file);
};

export const test = () => {
  console.log('test');
};
