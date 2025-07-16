// src/utils/imageValidator.ts

import { MAX_HEIGHT, MAX_IMAGE_SIZE_BYTES, MAX_WIDTH } from '../constants';
import { imageSize } from 'image-size';

export const validateImage = (
  size: number,
  dimensions: ReturnType<typeof imageSize>
): string | null => {
  if (size > MAX_IMAGE_SIZE_BYTES) {
    return `Image size exceeds the 500 KB limit.`;
  }

  const { width, height } = dimensions;

  if (!width || !height) {
    return 'Invalid image dimensions.';
  }

  if (width > MAX_WIDTH || height > MAX_HEIGHT) {
    return `Image dimensions exceed ${MAX_WIDTH}x${MAX_HEIGHT} pixels.`;
  }

  return null;
};
