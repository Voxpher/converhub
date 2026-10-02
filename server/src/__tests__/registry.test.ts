jest.mock('archiver', () => ({ ZipArchive: jest.fn() }));

import { TOOLS, getTool } from '../services/toolRegistry';
import { getProcessor } from '../services/processors/index';

describe('tool registry integrity', () => {
  it('registers all 35 tools', () => {
    expect(TOOLS).toHaveLength(35);
  });

  it('has unique ids', () => {
    const ids = TOOLS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every tool is enabled with a valid category and phase', () => {
    for (const t of TOOLS) {
      expect(t.enabled).toBe(true);
      expect(['pdf', 'image', 'audio-video', 'utility']).toContain(t.category);
      expect(t.phase).toBeGreaterThanOrEqual(1);
      expect(t.maxFiles).toBeGreaterThanOrEqual(1);
      expect(t.name.length).toBeGreaterThan(0);
      expect(t.tagline.length).toBeGreaterThan(0);
    }
  });

  it('every tool has a processor', () => {
    for (const t of TOOLS) {
      expect(getProcessor(t.id)).toBeDefined();
    }
  });

  it('getTool finds tools by id', () => {
    expect(getTool('merge-pdf')?.name).toMatch(/merge/i);
    expect(getTool('qr-generator')?.category).toBe('utility');
    expect(getTool('nope')).toBeUndefined();
  });

  it('every option schema entry is well-formed', () => {
    for (const t of TOOLS) {
      for (const f of t.optionsSchema) {
        expect(f.name).toMatch(/^[a-zA-Z0-9_-]+$/);
        expect(f.label.length).toBeGreaterThan(0);
        if (f.type === 'select') {
          expect(f.options && f.options.length).toBeGreaterThan(0);
        }
      }
    }
  });
});
