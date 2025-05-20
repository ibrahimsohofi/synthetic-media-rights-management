import React, { useEffect, useState } from 'react';
import { ThreatEvent } from '@/lib/security/threat-detection';
import { IPBehavior } from '@/lib/security/behavioral-analysis';
import { LineChart, BarChart, PieChart } from '@/components/charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

interface ThreatAnalysisProps {
  events: ThreatEvent[];
  behavioralData: IPBehavior[];
  timeRange: '1h' | '24h' | '7d' | '30d';
  onTimeRangeChange?: (range: '1h' | '24h' | '7d' | '30d') => void;
  className?: string;
}

export function ThreatAnalysis({
  events,
  behavioralData,
  timeRange,
  onTimeRangeChange,
  className,
}: ThreatAnalysisProps) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [filteredEvents, setFilteredEvents] = useState<ThreatEvent[]>([]);
  const [filteredBehavioralData, setFilteredBehavioralData] = useState<IPBehavior[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | string>('all');

  useEffect(() => {
    setIsLoading(true);
    const now = Date.now();
    const timeWindow = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    }[timeRange];

    const filtered = events.filter(event => {
      const eventTime = new Date(event.timestamp).getTime();
      const isInTimeWindow = now - eventTime <= timeWindow;
      const matchesSeverity = selectedSeverity === 'all' || event.severity === selectedSeverity;
      const matchesCategory = selectedCategory === 'all' || event.details.category === selectedCategory;
      return isInTimeWindow && matchesSeverity && matchesCategory;
    });

    const filteredBehavioral = behavioralData.filter(behavior => {
      const behaviorTime = new Date(behavior.lastSeen).getTime();
      return now - behaviorTime <= timeWindow;
    });

    setFilteredEvents(filtered);
    setFilteredBehavioralData(filteredBehavioral);
    setIsLoading(false);
  }, [events, behavioralData, timeRange, selectedSeverity, selectedCategory]);

  const categories = Array.from(new Set(events.map(event => event.details.category)));
  const severities = ['critical', 'high', 'medium', 'low'] as const;

  const severityColors = {
    critical: 'text-red-500',
    high: 'text-orange-500',
    medium: 'text-yellow-500',
    low: 'text-blue-500',
  };

  const categoryColors = {
    injection: 'text-red-500',
    xss: 'text-orange-500',
    dos: 'text-yellow-500',
    scanning: 'text-blue-500',
    malware: 'text-purple-500',
    other: 'text-gray-500',
  };

  const timeRangeLabels = {
    '1h': 'Last Hour',
    '24h': 'Last 24 Hours',
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
  };

  const renderTimelineData = () => {
    const timePoints = Array.from({ length: 24 }, (_, i) => {
      const time = new Date();
      time.setHours(time.getHours() - (23 - i));
      return time;
    });

    return timePoints.map(time => {
      const eventsInHour = filteredEvents.filter(event => {
        const eventTime = new Date(event.timestamp);
        return (
          eventTime.getHours() === time.getHours() &&
          eventTime.getDate() === time.getDate()
        );
      });

      return {
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        critical: eventsInHour.filter(e => e.severity === 'critical').length,
        high: eventsInHour.filter(e => e.severity === 'high').length,
        medium: eventsInHour.filter(e => e.severity === 'medium').length,
        low: eventsInHour.filter(e => e.severity === 'low').length,
      };
    });
  };

  const renderCategoryData = () => {
    return categories.map(category => ({
      category,
      count: filteredEvents.filter(event => event.details.category === category).length,
      color: categoryColors[category as keyof typeof categoryColors] || 'text-gray-500',
    }));
  };

  const renderBehavioralData = () => {
    return filteredBehavioralData.map(behavior => ({
      ipAddress: behavior.ipAddress,
      score: behavior.score,
      patterns: behavior.patterns,
      lastSeen: new Date(behavior.lastSeen).toLocaleString(),
    }));
  };

  const renderSeverityDistribution = () => {
    return severities.map(severity => ({
      severity,
      count: filteredEvents.filter(event => event.severity === severity).length,
      color: severityColors[severity],
    }));
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-[400px] w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Threat Analysis</h2>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(timeRangeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              {severities.map(severity => (
                <SelectItem key={severity} value={severity}>
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="behavioral">Behavioral Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Threat Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart
                data={renderTimelineData()}
                xAxis="time"
                series={severities.map(severity => ({
                  key: severity,
                  label: severity.charAt(0).toUpperCase() + severity.slice(1),
                  color: severityColors[severity].replace('text-', ''),
                }))}
                height={400}
                theme={theme}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Severity Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart
                  data={renderSeverityDistribution()}
                  valueKey="count"
                  labelKey="severity"
                  colorKey="color"
                  height={300}
                  theme={theme}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={renderCategoryData()}
                  xAxis="category"
                  valueKey="count"
                  colorKey="color"
                  height={300}
                  theme={theme}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {categories.map(category => {
                  const categoryEvents = filteredEvents.filter(
                    event => event.details.category === category
                  );
                  const severityCounts = severities.reduce(
                    (acc, severity) => ({
                      ...acc,
                      [severity]: categoryEvents.filter(event => event.severity === severity).length,
                    }),
                    {} as Record<string, number>
                  );

                  return (
                    <Card key={category}>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                          <Badge variant="outline">{categoryEvents.length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {severities.map(severity => (
                            <div key={severity} className="flex items-center justify-between">
                              <span className={severityColors[severity]}>
                                {severity.charAt(0).toUpperCase() + severity.slice(1)}
                              </span>
                              <span>{severityCounts[severity]}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavioral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Behavioral Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredBehavioralData.length === 0 ? (
                  <Alert>
                    <AlertTitle>No Behavioral Data</AlertTitle>
                    <AlertDescription>
                      No behavioral data available for the selected time range.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {renderBehavioralData().map(behavior => (
                      <Card key={behavior.ipAddress}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>{behavior.ipAddress}</span>
                            <Badge
                              variant={behavior.score > 0.7 ? 'destructive' : behavior.score > 0.4 ? 'warning' : 'default'}
                            >
                              Score: {Math.round(behavior.score * 100)}%
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Last Seen:</span>
                              <span>{behavior.lastSeen}</span>
                            </div>
                            <div>
                              <span className="font-medium">Detected Patterns:</span>
                              <div className="mt-1 flex flex-wrap gap-2">
                                {behavior.patterns.map(pattern => (
                                  <Badge key={pattern} variant="outline">
                                    {pattern}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 