import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import jpeg from 'jpeg-js';
import { Buffer } from 'buffer';

export async function checkImageBrightness(uri: string): Promise<boolean> {

  const resized = await ImageManipulator.manipulateAsync(uri, [
    { resize: { width: 20, height: 20 } },
  ], { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG });



  const base64 = await FileSystem.readAsStringAsync(resized.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });


  const jpegData = Buffer.from(base64, 'base64');

  const raw = jpeg.decode(jpegData, { useTArray: true });
  let totalBrightness = 0;
  const { data, width, height } = raw;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
    totalBrightness += brightness;
  }

  const avgBrightness = totalBrightness / (width * height);
  return avgBrightness > 50;
}

const computeVariance = (array: number[]) => {
  const mean = array.reduce((sum, val) => sum + val, 0) / array.length;
  return array.reduce((acc, val) => acc + (val - mean) ** 2, 0) / array.length;
};

export const estimateBlur = async (uri: string): Promise<number> => {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const jpegData = Buffer.from(base64, 'base64');
  const rawImageData = jpeg.decode(jpegData, { useTArray: true });

  const { width, height, data } = rawImageData;

  const grayscale: number[] = [];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // convert to grayscale
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    grayscale.push(gray);
  }

  const variance = computeVariance(grayscale);
  return variance;
};