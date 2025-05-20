import { GeoBlocking, GeoLocation } from '../geo-blocking';
import { redis } from '@/lib/redis';
import { EnhancedMonitoringService } from '@/lib/monitoring/service';
import axios from 'axios';

// Mock dependencies
jest.mock('@/lib/redis');
jest.mock('@/lib/monitoring/service');
jest.mock('axios');

describe('GeoBlocking', () => {
  let geoBlocking: GeoBlocking;
  let mockMonitoringService: jest.Mocked<typeof EnhancedMonitoringService>;

  const mockLocation: GeoLocation = {
    country: 'United States',
    countryCode: 'US',
    region: 'California',
    city: 'San Francisco',
    latitude: 37.7749,
    longitude: -122.4194,
    isp: 'Example ISP',
    organization: 'Example Org',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockMonitoringService = {
      getInstance: jest.fn().mockReturnValue({
        trackSecurityEvent: jest.fn(),
      }),
    } as any;
    (EnhancedMonitoringService as jest.Mock) = mockMonitoringService;
    geoBlocking = new GeoBlocking();
  });

  describe('isBlocked', () => {
    beforeEach(() => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockLocation,
      });
    });

    it('should block IPs from blocked countries', async () => {
      await geoBlocking.updateConfig({
        blockedCountries: ['US'],
      });

      const isBlocked = await geoBlocking.isBlocked('1.2.3.4');
      expect(isBlocked).toBe(true);
      expect(mockMonitoringService.getInstance().trackSecurityEvent)
        .toHaveBeenCalledWith(expect.objectContaining({
          type: 'geo_block',
          severity: 'medium',
          details: expect.objectContaining({
            reason: 'blocked_country',
            location: mockLocation,
          }),
        }));
    });

    it('should allow IPs from non-blocked countries', async () => {
      await geoBlocking.updateConfig({
        blockedCountries: ['CN'],
      });

      const isBlocked = await geoBlocking.isBlocked('1.2.3.4');
      expect(isBlocked).toBe(false);
    });

    it('should block IPs not in allowed countries list', async () => {
      await geoBlocking.updateConfig({
        allowedCountries: ['GB', 'DE'],
      });

      const isBlocked = await geoBlocking.isBlocked('1.2.3.4');
      expect(isBlocked).toBe(true);
      expect(mockMonitoringService.getInstance().trackSecurityEvent)
        .toHaveBeenCalledWith(expect.objectContaining({
          type: 'geo_block',
          severity: 'medium',
          details: expect.objectContaining({
            reason: 'not_allowed_country',
          }),
        }));
    });

    it('should allow IPs from allowed countries', async () => {
      await geoBlocking.updateConfig({
        allowedCountries: ['US'],
      });

      const isBlocked = await geoBlocking.isBlocked('1.2.3.4');
      expect(isBlocked).toBe(false);
    });

    it('should block unknown locations when configured', async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error('Location lookup failed'));
      await geoBlocking.updateConfig({
        blockUnknownLocations: true,
      });

      const isBlocked = await geoBlocking.isBlocked('1.2.3.4');
      expect(isBlocked).toBe(true);
      expect(mockMonitoringService.getInstance().trackSecurityEvent)
        .toHaveBeenCalledWith(expect.objectContaining({
          type: 'geo_block',
          severity: 'medium',
          details: expect.objectContaining({
            reason: 'location_error',
          }),
        }));
    });

    it('should allow unknown locations when not configured to block', async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error('Location lookup failed'));
      await geoBlocking.updateConfig({
        blockUnknownLocations: false,
      });

      const isBlocked = await geoBlocking.isBlocked('1.2.3.4');
      expect(isBlocked).toBe(false);
    });
  });

  describe('location caching', () => {
    it('should cache location lookups', async () => {
      await geoBlocking.isBlocked('1.2.3.4');
      await geoBlocking.isBlocked('1.2.3.4');

      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should refresh cache after update interval', async () => {
      jest.useFakeTimers();
      await geoBlocking.isBlocked('1.2.3.4');
      
      // Advance time past update interval
      jest.advanceTimersByTime(25 * 60 * 60 * 1000); // 25 hours
      
      await geoBlocking.isBlocked('1.2.3.4');
      expect(axios.get).toHaveBeenCalledTimes(2);
      
      jest.useRealTimers();
    });

    it('should clear cache when update interval changes', async () => {
      await geoBlocking.isBlocked('1.2.3.4');
      await geoBlocking.updateConfig({
        updateInterval: 12 * 60 * 60 * 1000, // 12 hours
      });
      await geoBlocking.isBlocked('1.2.3.4');

      expect(axios.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('configuration management', () => {
    it('should update configuration', async () => {
      const newConfig = {
        blockedCountries: ['CN', 'RU'],
        allowedCountries: ['US', 'CA'],
        blockUnknownLocations: false,
      };

      await geoBlocking.updateConfig(newConfig);
      const blocked = await geoBlocking.getBlockedCountries();
      const allowed = await geoBlocking.getAllowedCountries();

      expect(blocked).toEqual(['CN', 'RU']);
      expect(allowed).toEqual(['US', 'CA']);
      expect(mockMonitoringService.getInstance().trackSecurityEvent)
        .toHaveBeenCalledWith(expect.objectContaining({
          type: 'geo_block_config_update',
          severity: 'low',
        }));
    });

    it('should maintain existing config for unspecified values', async () => {
      await geoBlocking.updateConfig({
        blockedCountries: ['CN'],
      });
      await geoBlocking.updateConfig({
        allowedCountries: ['US'],
      });

      const blocked = await geoBlocking.getBlockedCountries();
      const allowed = await geoBlocking.getAllowedCountries();

      expect(blocked).toEqual(['CN']);
      expect(allowed).toEqual(['US']);
    });
  });

  describe('location cache management', () => {
    it('should return valid cached locations', async () => {
      await geoBlocking.isBlocked('1.2.3.4');
      const cache = await geoBlocking.getLocationCache();

      expect(cache.size).toBe(1);
      expect(cache.get('1.2.3.4')).toEqual(mockLocation);
    });

    it('should clear location cache', async () => {
      await geoBlocking.isBlocked('1.2.3.4');
      await geoBlocking.clearLocationCache();
      const cache = await geoBlocking.getLocationCache();

      expect(cache.size).toBe(0);
    });

    it('should filter out expired cache entries', async () => {
      jest.useFakeTimers();
      await geoBlocking.isBlocked('1.2.3.4');
      
      // Advance time past update interval
      jest.advanceTimersByTime(25 * 60 * 60 * 1000); // 25 hours
      
      const cache = await geoBlocking.getLocationCache();
      expect(cache.size).toBe(0);
      
      jest.useRealTimers();
    });
  });
}); 