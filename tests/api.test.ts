import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getSmartLocalResponse, loadApiKey } from '../src/apiApp';

describe('API Key Loader Utility', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should load key from process.env when available', () => {
    process.env.GEMINI_API_KEY = 'TEST_KEY_123';
    const key = loadApiKey();
    expect(key).toBe('TEST_KEY_123');
  });

  it('should not use "MOCK_KEY" as a real API key', () => {
    process.env.GEMINI_API_KEY = 'MOCK_KEY';
    const key = loadApiKey();
    // It should check config.json or fall back to empty/undefined
    expect(key).not.toBe('MOCK_KEY');
  });
});

describe('Offline AI Copilot - Smart Local Responder', () => {
  describe('New York / MetLife Stadium Rules', () => {
    it('should return clear bag policy guidelines when asked about bags', () => {
      const response = getSmartLocalResponse('Can I bring my backpack?', 'new_york');
      expect(response).toContain('Clear Bag Policy');
      expect(response).toContain('12" x 6" x 12"');
    });

    it('should return parking instructions when asked about car, parking, or driving', () => {
      const response = getSmartLocalResponse('where to park my car?', 'new_york');
      expect(response).toContain('Pre-Purchase Mandatory');
      expect(response).toContain('Tailgating');
    });

    it('should return public transit tips when asked about train or bus', () => {
      const response = getSmartLocalResponse('tell me transit or bus routes', 'new_york');
      expect(response).toContain('NJ Transit Rail');
      expect(response).toContain('351 Express Bus');
    });

    it('should return cashless and culinary specialties when asked about food or cards', () => {
      const response = getSmartLocalResponse('what food is there and can I pay cash?', 'new_york');
      expect(response).toContain('Taylor Ham');
      expect(response).toContain('cashless');
    });

    it('should return emergency text guidelines when asked about safety or medical concerns', () => {
      const response = getSmartLocalResponse('who do I contact in case of emergency', 'new_york');
      expect(response).toContain('MLSAFE');
      expect(response).toContain('First Aid');
    });

    it('should provide gate opening times when asked about doors or entry', () => {
      const response = getSmartLocalResponse('when do gates open?', 'new_york');
      expect(response).toContain('Bud Light Gate');
      expect(response).toContain('2 hours');
    });

    it('should return a high-quality default overview if query matches nothing specific', () => {
      const response = getSmartLocalResponse('tell me general info', 'new_york');
      expect(response).toContain('Welcome to MetLife Stadium');
      expect(response).toContain('🗽');
    });
  });

  describe('Mexico City / Estadio Azteca Rules', () => {
    it('should return metric clear bag rules', () => {
      const response = getSmartLocalResponse('bag policies', 'mexico_city');
      expect(response).toContain('30x15x30 cm');
    });

    it('should recommend Tren Ligero for transportation', () => {
      const response = getSmartLocalResponse('get to stadium', 'mexico_city');
      expect(response).toContain('Tren Ligero');
      expect(response).toContain('Tasqueña');
    });

    it('should return parking warnings', () => {
      const response = getSmartLocalResponse('parking lots', 'mexico_city');
      expect(response).toContain('Extremely Limited Parking');
    });
  });

  describe('Los Angeles / SoFi Stadium Rules', () => {
    it('should return Pink Zone tailgating rules for LA', () => {
      const response = getSmartLocalResponse('where can I park or tailgate?', 'los_angeles');
      expect(response).toContain('Pink Zone');
      expect(response).toContain('Pre-Booked Only');
    });

    it('should return Metro C Line connection details', () => {
      const response = getSmartLocalResponse('how to transit?', 'los_angeles');
      expect(response).toContain('Metro C Line');
      expect(response).toContain('shuttle');
    });
  });

  describe('Vancouver / BC Place Rules', () => {
    it('should return SkyTrain station tips', () => {
      const response = getSmartLocalResponse('train route to stadium', 'vancouver');
      expect(response).toContain('Stadium-Chinatown');
      expect(response).toContain('Yaletown-Roundhouse');
    });

    it('should return bag policies in inches', () => {
      const response = getSmartLocalResponse('bring bag', 'vancouver');
      expect(response).toContain('12" x 6" x 12"');
    });
  });

  describe('Monterrey / Estadio BBVA Rules', () => {
    it('should notify about permit-only parking restrictions', () => {
      const response = getSmartLocalResponse('parking spots', 'monterrey');
      expect(response).toContain('Permit Holders Only');
    });

    it('should recommend Metro Line 1 Exposición walking corridor', () => {
      const response = getSmartLocalResponse('transit directions', 'monterrey');
      expect(response).toContain('Exposición Station');
    });
  });
});
