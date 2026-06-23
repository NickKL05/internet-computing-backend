'use strict';

const reg = require('../src/services/registrationService');

describe('timesOverlap', () => {
  test('overlapping ranges conflict', () => {
    expect(reg.timesOverlap('10:00:00', '11:20:00', '11:00:00', '12:20:00')).toBe(true);
  });

  test('back to back ranges do not conflict', () => {
    expect(reg.timesOverlap('10:00:00', '11:20:00', '11:20:00', '12:40:00')).toBe(false);
  });

  test('disjoint ranges do not conflict', () => {
    expect(reg.timesOverlap('08:00:00', '09:00:00', '10:00:00', '11:00:00')).toBe(false);
  });
});

describe('schedulesConflict', () => {
  const monMorning = [{ day_of_week: 'Monday', start_time: '10:00:00', end_time: '11:20:00' }];

  test('same day overlapping meetings conflict', () => {
    const other = [{ day_of_week: 'Monday', start_time: '11:00:00', end_time: '12:20:00' }];
    expect(reg.schedulesConflict(monMorning, other)).toBe(true);
  });

  test('same time on a different day does not conflict', () => {
    const other = [{ day_of_week: 'Tuesday', start_time: '10:00:00', end_time: '11:20:00' }];
    expect(reg.schedulesConflict(monMorning, other)).toBe(false);
  });

  test('any overlapping meeting across multiple days conflicts', () => {
    const multi = [
      { day_of_week: 'Wednesday', start_time: '09:00:00', end_time: '10:00:00' },
      { day_of_week: 'Monday', start_time: '10:30:00', end_time: '11:30:00' },
    ];
    expect(reg.schedulesConflict(monMorning, multi)).toBe(true);
  });
});
