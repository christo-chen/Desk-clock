import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { Blob, Face, Font } from 'harfbuzzjs';
import { fonts } from '../src/data/fonts';
const fontverter = createRequire(import.meta.url)('fontverter') as {
  convert: (buffer: Buffer, format: string) => Promise<Buffer>;
};

describe('裁剪字体与许可证产物', () => {
  it.each(fonts)('%s 是可解码的 WOFF2，包含所有数字且仅保留规定字符', async (id) => {
    const bytes = readFileSync(`src/assets/fonts/${id}.woff2`);
    expect(bytes.toString('ascii', 0, 4)).toBe('wOF2');
    const sfnt = await fontverter.convert(bytes, 'sfnt');
    const face = new Face(new Blob(sfnt));
    const font = new Font(face);
    for (const digit of '0123456789') expect(font.nominalGlyph(digit.codePointAt(0)!)).toBeGreaterThan(0);
    const allowed = new Set(Array.from('0123456789:. AMP', c => c.codePointAt(0)!));
    expect(Array.from(face.collectUnicodes()).every(c => allowed.has(c))).toBe(true);
    expect(readFileSync(`public/licenses/${id}.txt`, 'utf8')).toMatch(/SIL OPEN FONT LICENSE/i);
  });

  it('DSEG 许可证与包根目录 DSEG-LICENSE.txt 原样一致', () => {
    expect(readFileSync('public/licenses/dseg.txt')).toEqual(readFileSync('node_modules/dseg/DSEG-LICENSE.txt'));
  });

  it('12款字体合计不超过150 KB', () => {
    const total = fonts.reduce((n, [id]) => n + readFileSync(`src/assets/fonts/${id}.woff2`).byteLength, 0);
    expect(total).toBeLessThanOrEqual(150 * 1024);
  });
});
