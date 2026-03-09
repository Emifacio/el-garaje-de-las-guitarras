import sharp from 'sharp';
import { imageOptimizerConfig } from '../config/image-optimizer.config';

export interface ImageOptimizationResult {
  original: Buffer;
  variants: Record<string, Buffer>;
  usedOriginalFor: string[];
}

export interface OptimizeImageBufferOptions {
  input: Buffer;
  imageId?: string;
}

export async function optimizeImageBuffer(
  options: OptimizeImageBufferOptions
): Promise<ImageOptimizationResult> {
  const { input, imageId } = options;

  const variants: Record<string, Buffer> = {};
  const usedOriginalFor: string[] = [];

  const original = input;

  const tryVariant = async (format: 'webp' | 'avif' | 'jpeg'): Promise<void> => {
    try {
      let out: Buffer;

      if (format === 'webp') {
        out = await sharp(original)
          .webp({ quality: imageOptimizerConfig.quality.webp })
          .toBuffer();
      } else if (format === 'avif') {
        out = await sharp(original)
          .avif({ quality: imageOptimizerConfig.quality.avif })
          .toBuffer();
      } else {
        out = await sharp(original)
          .jpeg({ quality: imageOptimizerConfig.quality.jpeg, mozjpeg: true })
          .toBuffer();
      }

      if (out.length >= original.length) {
        variants[format] = original;
        usedOriginalFor.push(format);
        return;
      }

      variants[format] = out;
    } catch (err) {
      variants[format] = original;
      usedOriginalFor.push(format);
      console.error(
        '[image-optimizer] Failed to optimize image',
        { imageId, format },
        err
      );
    }
  };

  await Promise.all([
    tryVariant('webp'),
    tryVariant('avif'),
    tryVariant('jpeg')
  ]);

  return {
    original,
    variants,
    usedOriginalFor
  };
}
