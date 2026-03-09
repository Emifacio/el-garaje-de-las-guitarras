import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import sharp from 'sharp';
import { optimizeImageBuffer } from './image-optimizer';

describe('optimizeImageBuffer', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should fall back to original when optimization throws', async () => {
    const original = await sharp({
      create: {
        width: 400,
        height: 300,
        channels: 3,
        background: { r: 120, g: 120, b: 120 }
      }
    })
      .jpeg({ quality: 95, mozjpeg: true })
      .toBuffer();

    const webpSpy = vi.spyOn(sharp.prototype as any, 'webp').mockImplementation(() => {
      throw new Error('forced webp failure');
    });

    const result = await optimizeImageBuffer({ input: original, imageId: 'test-image' });

    expect(result.variants.webp).toEqual(original);
    expect(result.usedOriginalFor).toContain('webp');
    expect(consoleErrorSpy).toHaveBeenCalled();

    webpSpy.mockRestore();
  });

  it('should fall back to original when optimized output is larger', async () => {
    const original = await sharp({
      create: {
        width: 400,
        height: 300,
        channels: 3,
        background: { r: 10, g: 200, b: 10 }
      }
    })
      .jpeg({ quality: 95, mozjpeg: true })
      .toBuffer();

    const fakeLargeBuffer = Buffer.concat([original, Buffer.from('xxxxxxxxxxxxxxxx')]);

    const toBufferSpy = vi
      .spyOn(sharp.prototype as any, 'toBuffer')
      .mockResolvedValue(fakeLargeBuffer);

    const result = await optimizeImageBuffer({ input: original, imageId: 'test-image-2' });

    expect(result.usedOriginalFor.length).toBeGreaterThan(0);
    result.usedOriginalFor.forEach((format) => {
      expect(result.variants[format]).toEqual(original);
    });

    toBufferSpy.mockRestore();
  });
});
