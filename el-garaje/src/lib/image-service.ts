import type { AstroConfig, ImageTransform, LocalImageService } from 'astro';
import sharpService from 'astro/assets/services/sharp';

function inferFormatFromSrc(src: string): string {
  const lower = src.toLowerCase();
  if (lower.endsWith('.png')) return 'png';
  if (lower.endsWith('.webp')) return 'webp';
  if (lower.endsWith('.avif')) return 'avif';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'jpeg';
  return 'jpeg';
}

const sharpServiceAny = sharpService as any;

const service: LocalImageService<any> = {
  getURL: sharpServiceAny.getURL,
  parseURL: sharpServiceAny.parseURL,
  getHTMLAttributes: sharpServiceAny.getHTMLAttributes,
  propertiesToHash: sharpServiceAny.propertiesToHash,
  async transform(inputBuffer: Uint8Array, options: { src: string; [key: string]: any }, imageConfig: AstroConfig['image']) {
    const src = typeof options?.src === 'string' ? options.src : '';
    const originalFormat = inferFormatFromSrc(src);

    try {
      const result = await sharpServiceAny.transform(inputBuffer, options, imageConfig);

      if (result?.data && result.data.length >= inputBuffer.length) {
        return { data: inputBuffer, format: originalFormat };
      }

      return result;
    } catch (err) {
      console.error('[image-service] image optimization failed', { src }, err);
      return { data: inputBuffer, format: originalFormat };
    }
  }
};

export default service;
export { inferFormatFromSrc };
