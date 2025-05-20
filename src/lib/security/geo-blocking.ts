import { redis } from '@/lib/redis';
import { EnhancedMonitoringService } from '@/lib/monitoring/service';
import axios from 'axios';

export interface GeoBlockingConfig {
  blockedCountries: string[];
  allowedCountries: string[];
  blockUnknownLocations: boolean;
  updateInterval: number;
  maxmindLicenseKey?: string;
}

export interface GeoLocation {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  isp: string;
  organization: string;
}

const DEFAULT_CONFIG: GeoBlockingConfig = {
  blockedCountries: [],
  allowedCountries: [],
  blockUnknownLocations: true,
  updateInterval: 24 * 60 * 60 * 1000, // 24 hours
};

export class GeoBlocking {
  private config: GeoBlockingConfig;
  private monitoringService: typeof EnhancedMonitoringService;
  private locationCache: Map<string, { location: GeoLocation; timestamp: number }>;

  constructor(config: Partial<GeoBlockingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.monitoringService = EnhancedMonitoringService;
    this.locationCache = new Map();
  }

  async isBlocked(ipAddress: string): Promise<boolean> {
    try {
      const location = await this.getLocation(ipAddress);
      
      // Check if country is explicitly blocked
      if (this.config.blockedCountries.includes(location.countryCode)) {
        await this.logBlockedAccess(ipAddress, location, 'blocked_country');
        return true;
      }

      // Check if country is in allowed list (if allowedCountries is not empty)
      if (this.config.allowedCountries.length > 0 && 
          !this.config.allowedCountries.includes(location.countryCode)) {
        await this.logBlockedAccess(ipAddress, location, 'not_allowed_country');
        return true;
      }

      // Check if unknown locations should be blocked
      if (this.config.blockUnknownLocations && !location.countryCode) {
        await this.logBlockedAccess(ipAddress, location, 'unknown_location');
        return true;
      }

      return false;
    } catch (error) {
      // If we can't determine location, block based on blockUnknownLocations setting
      if (this.config.blockUnknownLocations) {
        await this.logBlockedAccess(ipAddress, {
          country: 'Unknown',
          countryCode: '',
          region: 'Unknown',
          city: 'Unknown',
          latitude: 0,
          longitude: 0,
          isp: 'Unknown',
          organization: 'Unknown',
        }, 'location_error');
        return true;
      }
      return false;
    }
  }

  private async getLocation(ipAddress: string): Promise<GeoLocation> {
    // Check cache first
    const cached = this.locationCache.get(ipAddress);
    if (cached && Date.now() - cached.timestamp < this.config.updateInterval) {
      return cached.location;
    }

    // Try MaxMind GeoIP2 first if license key is available
    if (this.config.maxmindLicenseKey) {
      try {
        const location = await this.getMaxMindLocation(ipAddress);
        this.locationCache.set(ipAddress, {
          location,
          timestamp: Date.now(),
        });
        return location;
      } catch (error) {
        console.warn('MaxMind GeoIP2 lookup failed:', error);
      }
    }

    // Fallback to ipapi.co
    try {
      const response = await axios.get(`https://ipapi.co/${ipAddress}/json/`);
      const location: GeoLocation = {
        country: response.data.country_name,
        countryCode: response.data.country_code,
        region: response.data.region,
        city: response.data.city,
        latitude: response.data.latitude,
        longitude: response.data.longitude,
        isp: response.data.org,
        organization: response.data.org,
      };

      this.locationCache.set(ipAddress, {
        location,
        timestamp: Date.now(),
      });

      return location;
    } catch (error) {
      throw new Error(`Failed to get location for IP ${ipAddress}: ${error}`);
    }
  }

  private async getMaxMindLocation(ipAddress: string): Promise<GeoLocation> {
    // Implementation would use MaxMind's GeoIP2 API
    // This is a placeholder for the actual implementation
    throw new Error('MaxMind GeoIP2 implementation required');
  }

  private async logBlockedAccess(
    ipAddress: string,
    location: GeoLocation,
    reason: 'blocked_country' | 'not_allowed_country' | 'unknown_location' | 'location_error'
  ) {
    const monitoringService = this.monitoringService.getInstance();
    await monitoringService.trackSecurityEvent({
      type: 'geo_block',
      severity: 'medium',
      ipAddress,
      timestamp: new Date(),
      details: {
        reason,
        location,
        config: {
          blockedCountries: this.config.blockedCountries,
          allowedCountries: this.config.allowedCountries,
          blockUnknownLocations: this.config.blockUnknownLocations,
        },
      },
    });
  }

  async updateConfig(newConfig: Partial<GeoBlockingConfig>) {
    this.config = { ...this.config, ...newConfig };
    
    // Clear location cache if update interval changed
    if (newConfig.updateInterval) {
      this.locationCache.clear();
    }

    // Log config update
    const monitoringService = this.monitoringService.getInstance();
    await monitoringService.trackSecurityEvent({
      type: 'geo_block_config_update',
      severity: 'low',
      timestamp: new Date(),
      details: {
        oldConfig: this.config,
        newConfig,
      },
    });
  }

  async getBlockedCountries(): Promise<string[]> {
    return [...this.config.blockedCountries];
  }

  async getAllowedCountries(): Promise<string[]> {
    return [...this.config.allowedCountries];
  }

  async getLocationCache(): Promise<Map<string, GeoLocation>> {
    const now = Date.now();
    const validLocations = new Map<string, GeoLocation>();

    for (const [ip, { location, timestamp }] of this.locationCache.entries()) {
      if (now - timestamp < this.config.updateInterval) {
        validLocations.set(ip, location);
      }
    }

    return validLocations;
  }

  async clearLocationCache(): Promise<void> {
    this.locationCache.clear();
  }
} 