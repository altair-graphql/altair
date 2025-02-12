import { describe, expect, test } from 'vitest';
import { formatSize, formatTime } from './format';

describe('formatSize', () => {
  test('returns bytes for sizes less than 1024', () => {
    expect(formatSize(512)).toBe('512 B');
    expect(formatSize(1023)).toBe('1023 B');
  });

  test('converts to kilobytes for sizes equal or above 1024', () => {
    expect(formatSize(1024)).toBe('1.00 KB');
    expect(formatSize(2048)).toBe('2.00 KB');
  });

  test('converts to megabytes correctly', () => {
    const fiveMB = 5 * 1024 * 1024; // 5 MB in bytes
    expect(formatSize(fiveMB)).toBe('5.00 MB');
  });

  test('converts to gigabytes correctly', () => {
    const threeGB = 3 * 1024 * 1024 * 1024; // 3 GB in bytes
    expect(formatSize(threeGB)).toBe('3.00 GB');
  });

  test('handles rounding for non-exact conversion', () => {
    // 1536 bytes = 1.5 KB
    expect(formatSize(1536)).toBe('1.50 KB');
  });
});

describe('formatTime', () => {
  test('returns milliseconds for times less than 1000', () => {
    expect(formatTime(500)).toBe('500 ms');
    expect(formatTime(123.456)).toBe('123.456 ms');
  });

  test('returns seconds for times between 1000 and 60000', () => {
    expect(formatTime(1000)).toBe('1 s');
    expect(formatTime(1500)).toBe('1.5 s');
    expect(formatTime(2750)).toBe('2.75 s');
  });

  test('returns minutes and seconds for times 60000 or more', () => {
    // 1 minute and 30 seconds
    expect(formatTime(90000)).toBe('1 min 30 s');
    // 1 minute and 0.5 seconds (60500 ms)
    expect(formatTime(60500)).toBe('1 min 0.5 s');
    // 2 minutes and 3.25 seconds (123250 ms)
    expect(formatTime(123250)).toBe('2 min 3.25 s');
  });
});
