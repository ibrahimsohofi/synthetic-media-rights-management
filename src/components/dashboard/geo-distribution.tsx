import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Shield, AlertTriangle, Map } from "lucide-react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { GeoLocation, SecurityEvent } from '@/lib/monitoring/types';

interface GeoDistributionProps {
  locations: Map<string, GeoLocation>;
  events: SecurityEvent[];
  timeRange: '1h' | '24h' | '7d' | '30d';
}

const GEO_COLORS = {
  regions: {
    na: '#3b82f6', // North America
    eu: '#10b981', // Europe
    as: '#f59e0b', // Asia
    sa: '#ef4444', // South America
    af: '#8b5cf6', // Africa
    oc: '#6366f1', // Oceania
  },
  severity: {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#7f1d1d',
  },
  status: {
    blocked: '#ef4444',
    allowed: '#10b981',
    suspicious: '#f59e0b',
  },
};

export function GeoDistribution({ locations, events, timeRange }: GeoDistributionProps) {
  // Process data for visualization
  const processData = () => {
    // Group locations by region
    const regionData = new Map<string, { count: number; events: number; blocked: number }>();
    const countryData = new Map<string, { count: number; events: number; blocked: number }>();
    
    // Initialize regions
    Object.keys(GEO_COLORS.regions).forEach(region => {
      regionData.set(region, { count: 0, events: 0, blocked: 0 });
    });

    // Process locations and events
    locations.forEach((location, ip) => {
      const region = getRegionFromCountry(location.countryCode);
      const regionStats = regionData.get(region) || { count: 0, events: 0, blocked: 0 };
      const countryStats = countryData.get(location.countryCode) || { count: 0, events: 0, blocked: 0 };

      // Update region stats
      regionStats.count++;
      regionData.set(region, regionStats);

      // Update country stats
      countryStats.count++;
      countryData.set(location.countryCode, countryStats);
    });

    // Process security events
    events.forEach(event => {
      const location = locations.get(event.ipAddress);
      if (location) {
        const region = getRegionFromCountry(location.countryCode);
        const regionStats = regionData.get(region) || { count: 0, events: 0, blocked: 0 };
        const countryStats = countryData.get(location.countryCode) || { count: 0, events: 0, blocked: 0 };

        // Update region stats
        regionStats.events++;
        if (event.type === 'geo_block') regionStats.blocked++;
        regionData.set(region, regionStats);

        // Update country stats
        countryStats.events++;
        if (event.type === 'geo_block') countryStats.blocked++;
        countryData.set(location.countryCode, countryStats);
      }
    });

    return {
      regionData: Array.from(regionData.entries()).map(([region, stats]) => ({
        region: region.toUpperCase(),
        ...stats,
      })),
      countryData: Array.from(countryData.entries())
        .map(([country, stats]) => ({
          country,
          ...stats,
        }))
        .sort((a, b) => b.events - a.events)
        .slice(0, 10), // Top 10 countries
    };
  };

  const { regionData, countryData } = processData();

  // Calculate summary metrics
  const totalLocations = locations.size;
  const totalEvents = events.length;
  const blockedIPs = events.filter(e => e.type === 'geo_block').length;
  const uniqueCountries = new Set(Array.from(locations.values()).map(l => l.countryCode)).size;

  // Calculate trends
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Get region from country code
  const getRegionFromCountry = (countryCode: string): string => {
    const regions: Record<string, string[]> = {
      na: ['US', 'CA', 'MX'], // North America
      eu: ['GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI'], // Europe
      as: ['CN', 'JP', 'KR', 'IN', 'SG', 'MY', 'ID', 'TH', 'VN', 'PH'], // Asia
      sa: ['BR', 'AR', 'CO', 'PE', 'CL', 'VE', 'EC'], // South America
      af: ['ZA', 'NG', 'EG', 'KE', 'MA', 'GH', 'ET'], // Africa
      oc: ['AU', 'NZ', 'FJ', 'PG'], // Oceania
    };

    for (const [region, countries] of Object.entries(regions)) {
      if (countries.includes(countryCode)) return region;
    }
    return 'other';
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLocations}</div>
            <div className="text-xs text-muted-foreground">
              {uniqueCountries} unique countries
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <div className="text-xs text-muted-foreground">
              {blockedIPs} blocked IPs
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Block Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((blockedIPs / totalLocations) * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              of total locations
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Coverage</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCountries}</div>
            <div className="text-xs text-muted-foreground">
              countries monitored
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Regional Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Regional Distribution</CardTitle>
            <CardDescription>
              Traffic and events by region
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={regionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis yAxisId="left" label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Events', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="count"
                    fill={GEO_COLORS.regions.na}
                    name="Locations"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="events"
                    stroke={GEO_COLORS.severity.high}
                    name="Events"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="blocked"
                    stroke={GEO_COLORS.status.blocked}
                    name="Blocked"
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
            <CardDescription>
              Events and blocks by country
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={countryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="country" />
                  <YAxis yAxisId="left" label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Events', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="count"
                    fill={GEO_COLORS.regions.eu}
                    name="Locations"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="events"
                    stroke={GEO_COLORS.severity.high}
                    name="Events"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="blocked"
                    stroke={GEO_COLORS.status.blocked}
                    name="Blocked"
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Event Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Event Distribution</CardTitle>
            <CardDescription>
              Security events by severity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={events.reduce((acc, event) => {
                      const severity = event.severity;
                      const existing = acc.find(item => item.name === severity);
                      if (existing) {
                        existing.value++;
                      } else {
                        acc.push({ name: severity, value: 1 });
                      }
                      return acc;
                    }, [] as { name: string; value: number }[])}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {events.map((event, index) => (
                      <Cell
                        key={event.severity}
                        fill={GEO_COLORS.severity[event.severity as keyof typeof GEO_COLORS.severity]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Block Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Block Distribution</CardTitle>
            <CardDescription>
              Geographic blocks by reason
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={events
                      .filter(event => event.type === 'geo_block')
                      .reduce((acc, event) => {
                        const reason = event.details.reason;
                        const existing = acc.find(item => item.name === reason);
                        if (existing) {
                          existing.value++;
                        } else {
                          acc.push({ name: reason, value: 1 });
                        }
                        return acc;
                      }, [] as { name: string; value: number }[])}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {events
                      .filter(event => event.type === 'geo_block')
                      .map((event, index) => (
                        <Cell
                          key={event.details.reason}
                          fill={GEO_COLORS.status[event.details.reason as keyof typeof GEO_COLORS.status]}
                        />
                      ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 