jest.mock('archiver', () => ({ ZipArchive: jest.fn() }));

import { parsePageSpec } from '../services/processors/pdf';

describe('parsePageSpec', () => {
  it('parses "all"', () => {
    expect(parsePageSpec('all', 3)).toEqual([[1, 2, 3]]);
  });

  it('parses comma lists and ranges into groups', () => {
    expect(parsePageSpec('1-3, 5', 6)).toEqual([[1, 2, 3], [5]]);
  });

  it('parses single pages and trims spaces', () => {
    expect(parsePageSpec(' 2 , 4 ', 5)).toEqual([[2], [4]]);
  });

  it('keeps groups as entered', () => {
    expect(parsePageSpec('3,1', 3)).toEqual([[3], [1]]);
  });

  it('throws on out-of-range pages', () => {
    expect(() => parsePageSpec('0', 3)).toThrow();
    expect(() => parsePageSpec('4', 3)).toThrow();
  });

  it('throws on garbage input', () => {
    expect(() => parsePageSpec('', 3)).toThrow();
    expect(() => parsePageSpec('abc', 3)).toThrow();
  });
});
