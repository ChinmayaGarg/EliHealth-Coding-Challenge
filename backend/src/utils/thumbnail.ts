import gm from 'gm';
import path from 'path';

export const generateThumbnail = (
  inputPath: string,
  outputDir: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(
      outputDir,
      path.basename(inputPath, path.extname(inputPath)) + '-thumb.jpg'
    );

    gm(inputPath)
      .resize(200, 200)
      .noProfile()
      .write(outputPath, (err) => {
        if (err) return reject(err);
        resolve(outputPath);
      });
  });
};
