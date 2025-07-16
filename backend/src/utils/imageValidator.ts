// src/utils/imageValidator.ts
import { MAX_HEIGHT, MAX_IMAGE_SIZE_BYTES, MAX_WIDTH } from '../constants';
import { imageSize } from 'image-size';

export const validateImage = (size: number, dimensions: ReturnType<typeof imageSize>) => {
  if (size > MAX_IMAGE_SIZE_BYTES) {
    return `Image size exceeds limit (500 KB).`;
  }
  if (dimensions.width! > MAX_WIDTH || dimensions.height! > MAX_HEIGHT) {
    return `Image dimensions exceed ${MAX_WIDTH}x${MAX_HEIGHT}`;
  }
  return null;
};
