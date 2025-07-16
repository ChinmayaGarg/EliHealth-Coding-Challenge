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
  return avgBrightness > 70;
}
