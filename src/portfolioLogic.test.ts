import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateFrameIndex,
  calculateCoverGeometry,
  validateContactForm,
  buildMailtoUrl,
} from './portfolioLogic.ts';

describe('calculateFrameIndex', () => {
  it('returns 0 at the top of the page or when scrollTop is negative', () => {
    assert.equal(calculateFrameIndex(0, 5000, 192), 0);
    assert.equal(calculateFrameIndex(-120, 5000, 192), 0);
  });

  it('returns the last frame (191) at or beyond maxScroll', () => {
    assert.equal(calculateFrameIndex(5000, 5000, 192), 191);
    assert.equal(calculateFrameIndex(6200, 5000, 192), 191);
  });

  it('maps midpoint scroll to midpoint frame accurately', () => {
    const mid = calculateFrameIndex(2500, 5000, 192);
    assert.equal(mid, 95);
  });

  it('handles zero or invalid maxScroll safely without NaN', () => {
    assert.equal(calculateFrameIndex(100, 0, 192), 0);
    assert.equal(calculateFrameIndex(100, -50, 192), 0);
  });
});

describe('calculateCoverGeometry', () => {
  it('scales width to match canvas when canvas is wider than image aspect ratio', () => {
    const geom = calculateCoverGeometry(1920, 800, 1920, 1080, 0.5, 0.5);
    assert.equal(geom.drawWidth, 1920);
    assert.equal(geom.drawHeight, 1080);
    assert.equal(geom.offsetX, 0);
    assert.equal(geom.offsetY, -140);
  });

  it('scales height to match canvas on portrait/mobile viewports while centering subject', () => {
    const geom = calculateCoverGeometry(390, 844, 1920, 1080, 0.5, 0.42);
    assert.equal(geom.drawHeight, 844);
    assert.ok(geom.drawWidth > 390);
    assert.ok(geom.offsetX < 0);
  });

  it('returns zeroes when dimensions are non-positive', () => {
    const geom = calculateCoverGeometry(0, 800, 1920, 1080);
    assert.deepEqual(geom, { drawWidth: 0, drawHeight: 0, offsetX: 0, offsetY: 0 });
  });
});

describe('validateContactForm & buildMailtoUrl', () => {
  it('rejects empty or invalid fields with helpful messages', () => {
    const result = validateContactForm({
      name: 'J',
      email: 'not-an-email',
      subject: 'Hi',
      message: 'Short',
    });
    assert.equal(result.valid, false);
    assert.ok(result.errors.name);
    assert.ok(result.errors.email);
    assert.ok(result.errors.subject);
    assert.ok(result.errors.message);
  });

  it('accepts valid contact input and generates encoded mailto link', () => {
    const input = {
      name: 'Recruiter Name',
      email: 'recruiter@example.com',
      subject: 'Software Engineering Internship',
      message: 'Hello Jeevan, we reviewed your AttendAI Connect project and would love to connect.',
    };
    const result = validateContactForm(input);
    assert.equal(result.valid, true);
    assert.deepEqual(result.errors, {});

    const mailto = buildMailtoUrl('puchakayalajeevan@gmail.com', input);
    assert.ok(mailto.startsWith('mailto:puchakayalajeevan@gmail.com?'));
    assert.ok(mailto.includes('Software%20Engineering%20Internship'));
    assert.ok(mailto.includes('recruiter%40example.com'));
  });
});
