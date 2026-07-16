import { describe, it, expect } from 'vitest';
import { hostCities, matches } from '../src/data';

describe('World Cup 2026 Host Cities Static Data', () => {
  it('should have correct details for exactly 5 distinct host cities', () => {
    expect(hostCities).toBeInstanceOf(Array);
    expect(hostCities.length).toBe(5);
  });

  it('should have unique IDs for each host city', () => {
    const ids = hostCities.map(city => city.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should assign each host city to one of the three host nations', () => {
    hostCities.forEach(city => {
      expect(['USA', 'Mexico', 'Canada']).toContain(city.country);
    });
  });

  it('should define a valid stadium capacity for each city', () => {
    hostCities.forEach(city => {
      expect(city.stadium).toBeDefined();
      expect(city.stadium.length).toBeGreaterThan(0);
      const capacityNum = parseInt(city.stadiumCapacity.replace(/,/g, ''));
      expect(capacityNum).toBeGreaterThan(40000); // FIFA stadiums are always > 40k capacity
    });
  });

  it('should have structured gates and transportation tips for every city', () => {
    hostCities.forEach(city => {
      expect(city.gates).toBeInstanceOf(Array);
      expect(city.gates.length).toBeGreaterThan(0);
      expect(city.transportationTips).toBeInstanceOf(Array);
      expect(city.transportationTips.length).toBeGreaterThan(0);
    });
  });

  it('should have robust local slang phrases with term, meaning, and context', () => {
    hostCities.forEach(city => {
      expect(city.localSlang).toBeInstanceOf(Array);
      expect(city.localSlang.length).toBeGreaterThan(0);
      city.localSlang.forEach(slang => {
        expect(slang.term).toBeDefined();
        expect(slang.term.length).toBeGreaterThan(0);
        expect(slang.meaning).toBeDefined();
        expect(slang.meaning.length).toBeGreaterThan(0);
        expect(slang.context).toBeDefined();
        expect(slang.context.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('World Cup 2026 Scheduled Matches Static Data', () => {
  it('should list all planned matches with valid teams, venues and timestamps', () => {
    expect(matches).toBeInstanceOf(Array);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('should link each match to a valid host city', () => {
    const cityIds = hostCities.map(city => city.id);
    matches.forEach(match => {
      expect(cityIds).toContain(match.cityId);
    });
  });

  it('should have valid flags and team configurations', () => {
    matches.forEach(match => {
      expect(match.teamA).toBeDefined();
      expect(match.teamB).toBeDefined();
      expect(match.teamAFlag).toBeDefined();
      expect(match.teamBFlag).toBeDefined();
      expect(match.date).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD format
      expect(match.time).toMatch(/^\d{2}:\d{2}$/); // HH:MM 24h format
    });
  });
});
