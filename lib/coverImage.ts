const MAX_IMAGE_DIMENSION = 1200;
const INITIAL_JPEG_QUALITY = 0.82;
const MIN_JPEG_QUALITY = 0.56;
const TARGET_DATA_URL_LENGTH = 300 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('读取图片失败'));
    };
    reader.onerror = () => reject(new Error('读取图片失败'));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('图片解析失败'));
    image.src = dataUrl;
  });
}

export async function fileToCoverImageDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('请选择图片文件');
  }

  const originalDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(originalDataUrl);

  const scale = Math.min(
    1,
    MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight)
  );

  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('图片处理失败');
  }

  // Flatten transparency so stored data stays compact and predictable.
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  let quality = INITIAL_JPEG_QUALITY;
  let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

  while (compressedDataUrl.length > TARGET_DATA_URL_LENGTH && quality > MIN_JPEG_QUALITY) {
    quality = Math.max(MIN_JPEG_QUALITY, quality - 0.08);
    compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
  }

  return compressedDataUrl;
}
