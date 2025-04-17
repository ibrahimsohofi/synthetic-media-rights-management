"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import {
  BarChart2,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  FileBarChart,
  Download,
  Calendar,
  Image as ImageIcon,
  Music,
  FilmIcon,
  File,
  AlertTriangle,
  Shield,
  ChevronDown,
  Info
} from "lucide-react";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("last30");
  const [chartView, setChartView] = useState("violations");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Detection Analytics</h1>
            <p className="text-muted-foreground">
              Track and analyze violations, detection patterns, and content protection metrics
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 self-start">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7">Last 7 days</SelectItem>
                <SelectItem value="last30">Last 30 days</SelectItem>
                <SelectItem value="last90">Last 90 days</SelectItem>
                <SelectItem value="year">This year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Violations
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">267</div>
              <p className="text-xs text-muted-foreground">
                +32 from previous period
              </p>
              <div className="mt-2 h-1 w-full bg-muted">
                <div className="h-full w-[45%] bg-violet-500 rounded-full" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                45% increase in detection rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Resolution Rate
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs text-muted-foreground">
                +5% from previous period
              </p>
              <div className="mt-2 h-1 w-full bg-muted">
                <div className="h-full w-[78%] bg-green-500 rounded-full" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                203 violations resolved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Response Time
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4 days</div>
              <p className="text-xs text-muted-foreground">
                -0.6 days from previous
              </p>
              <div className="mt-2 h-1 w-full bg-muted">
                <div className="h-full w-[65%] bg-blue-500 rounded-full" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Faster response to violations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Protected Works
              </CardTitle>
              <FileBarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92</div>
              <p className="text-xs text-muted-foreground">
                +8 new registrations
              </p>
              <div className="mt-2 h-1 w-full bg-muted">
                <div className="h-full w-[92%] bg-amber-500 rounded-full" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                92% of content is monitored
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main charts section */}
        <Tabs value={chartView} onValueChange={setChartView} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="violations" className="gap-2">
              <BarChart2 className="h-4 w-4" /> Violations
            </TabsTrigger>
            <TabsTrigger value="mediaTypes" className="gap-2">
              <PieChartIcon className="h-4 w-4" /> Media Types
            </TabsTrigger>
            <TabsTrigger value="trends" className="gap-2">
              <LineChartIcon className="h-4 w-4" /> Trends
            </TabsTrigger>
          </TabsList>

          {/* Violations Data */}
          <TabsContent value="violations" className="space-y-4">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Violations Over Time</CardTitle>
                <CardDescription>
                  Detection patterns by violation type and resolution status
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={violationsOverTimeData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [value, name === 'confirmed' ? 'Confirmed' : name === 'resolved' ? 'Resolved' : 'Pending']}
                      labelFormatter={(label) => `Period: ${label}`}
                    />
                    <Legend formatter={(value) => value === 'confirmed' ? 'Confirmed' : value === 'resolved' ? 'Resolved' : 'Pending'} />
                    <Bar dataKey="pending" stackId="a" fill="#FFB547" name="Pending" />
                    <Bar dataKey="confirmed" stackId="a" fill="#FF8F80" name="Confirmed" />
                    <Bar dataKey="resolved" stackId="a" fill="#4CAF50" name="Resolved" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Violations by Platform</CardTitle>
                  <CardDescription>
                    Distribution of detected violations across platforms
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={violationsByPlatformData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {violationsByPlatformData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={platformColors[index % platformColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resolution Methods</CardTitle>
                  <CardDescription>
                    Breakdown of successful resolution approaches
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={resolutionMethodsData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Media Types Data */}
          <TabsContent value="mediaTypes" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Violations by Media Type</CardTitle>
                  <CardDescription>
                    Distribution of violations across different content types
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={violationsByMediaTypeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {violationsByMediaTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={mediaTypeColors[index % mediaTypeColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Protected Content by Type</CardTitle>
                  <CardDescription>
                    Breakdown of registered works in your portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={registeredWorksByTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {registeredWorksByTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={mediaTypeColors[index % mediaTypeColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Media Type Violation Rates</CardTitle>
                <CardDescription>
                  Violation frequency compared to total registered works by type
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={violationRatesByTypeData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [value, name === 'registered' ? 'Total Registered' : 'Violations']}
                      labelFormatter={(label) => `Media Type: ${label}`}
                    />
                    <Legend formatter={(value) => value === 'registered' ? 'Total Registered' : 'Violations'} />
                    <Bar dataKey="registered" fill="#82ca9d" name="Total Registered" />
                    <Bar dataKey="violations" fill="#8884d8" name="Violations" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-sm">
                <p className="font-medium">Media Type Insights</p>
                <p className="text-muted-foreground">
                  Images (52%) and videos (30%) account for the majority of violations. However, audio content has the highest violation rate per registered work at 38%, suggesting it may be most vulnerable to unauthorized use.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Trends Data */}
          <TabsContent value="trends" className="space-y-4">
            <Card className="col-span-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Detection Rate Trends</CardTitle>
                  <CardDescription>
                    Monthly detection rates and resolution efficiency
                  </CardDescription>
                </div>
                <Select defaultValue="combined">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="combined">Combined</SelectItem>
                    <SelectItem value="detected">Detected Only</SelectItem>
                    <SelectItem value="resolved">Resolved Only</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={detectionTrendsData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [value, name === 'detected' ? 'Detected' : 'Resolved']} />
                    <Legend />
                    <Line type="monotone" dataKey="detected" stroke="#8884d8" activeDot={{ r: 8 }} name="Detected" />
                    <Line type="monotone" dataKey="resolved" stroke="#82ca9d" name="Resolved" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Trend Analysis</CardTitle>
                  <CardDescription>
                    Violation trends by platform over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={platformTrendsData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="social" stackId="1" stroke="#8884d8" fill="#8884d8" />
                      <Area type="monotone" dataKey="marketplaces" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                      <Area type="monotone" dataKey="websites" stackId="1" stroke="#ffc658" fill="#ffc658" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Response Effectiveness</CardTitle>
                  <CardDescription>
                    Success rate of different enforcement actions
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={responseEffectivenessData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                      <Bar dataKey="successRate" fill="#8884d8" name="Success Rate (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>AI Training Opt-Out Impact</CardTitle>
                <CardDescription>
                  Effect of AI training restrictions on violation rates
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">With AI Training Restrictions</h4>
                        <p className="text-xs text-muted-foreground">Content with AI training opt-out enabled</p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                        12% Violation Rate
                      </Badge>
                    </div>
                    <Progress value={12} className="h-2" />
                    <p className="text-xs text-muted-foreground">Based on 45 works with AI training restrictions</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Without AI Training Restrictions</h4>
                        <p className="text-xs text-muted-foreground">Content allowing AI training</p>
                      </div>
                      <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                        27% Violation Rate
                      </Badge>
                    </div>
                    <Progress value={27} className="h-2" />
                    <p className="text-xs text-muted-foreground">Based on 47 works without AI training restrictions</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-md">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Impact Analysis</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        Works with AI training restrictions show a 56% lower violation rate compared to unrestricted works.
                        This suggests that enabling AI training restrictions is an effective measure for reducing unauthorized use.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Sample data for charts
const violationsOverTimeData = [
  { name: 'Jan', pending: 4, confirmed: 10, resolved: 15 },
  { name: 'Feb', pending: 5, confirmed: 12, resolved: 18 },
  { name: 'Mar', pending: 7, confirmed: 15, resolved: 20 },
  { name: 'Apr', pending: 3, confirmed: 18, resolved: 22 },
  { name: 'May', pending: 6, confirmed: 14, resolved: 25 },
  { name: 'Jun', pending: 8, confirmed: 20, resolved: 28 },
  { name: 'Jul', pending: 10, confirmed: 22, resolved: 30 },
];

const platformColors = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658'];

const violationsByPlatformData = [
  { name: 'Social Media', value: 86 },
  { name: 'NFT Marketplaces', value: 42 },
  { name: 'Stock Websites', value: 35 },
  { name: 'E-commerce', value: 28 },
  { name: 'AI Generators', value: 54 },
  { name: 'Blogs/News', value: 22 },
];

const resolutionMethodsData = [
  { name: 'DMCA Takedown', value: 87 },
  { name: 'Direct Contact', value: 45 },
  { name: 'Platform Report', value: 65 },
  { name: 'Licensing Agreement', value: 32 },
  { name: 'Legal Action', value: 8 },
];

const mediaTypeColors = ['#FF8042', '#0088FE', '#00C49F', '#FFBB28', '#A569BD'];

const violationsByMediaTypeData = [
  { name: 'Images', value: 138 },
  { name: 'Videos', value: 79 },
  { name: 'Audio', value: 38 },
  { name: 'Text', value: 12 },
];

const registeredWorksByTypeData = [
  { name: 'Images', value: 42 },
  { name: 'Videos', value: 24 },
  { name: 'Audio', value: 16 },
  { name: 'Text', value: 10 },
];

const violationRatesByTypeData = [
  { name: 'Images', registered: 42, violations: 138 },
  { name: 'Videos', registered: 24, violations: 79 },
  { name: 'Audio', registered: 16, violations: 38 },
  { name: 'Text', registered: 10, violations: 12 },
];

const detectionTrendsData = [
  { name: 'Jan', detected: 29, resolved: 22 },
  { name: 'Feb', detected: 35, resolved: 28 },
  { name: 'Mar', detected: 42, resolved: 33 },
  { name: 'Apr', detected: 43, resolved: 38 },
  { name: 'May', detected: 45, resolved: 42 },
  { name: 'Jun', detected: 56, resolved: 48 },
  { name: 'Jul', detected: 62, resolved: 53 },
];

const platformTrendsData = [
  { name: 'Jan', social: 18, marketplaces: 7, websites: 4 },
  { name: 'Feb', social: 20, marketplaces: 9, websites: 6 },
  { name: 'Mar', social: 22, marketplaces: 12, websites: 8 },
  { name: 'Apr', social: 21, marketplaces: 14, websites: 8 },
  { name: 'May', social: 24, marketplaces: 13, websites: 8 },
  { name: 'Jun', social: 29, marketplaces: 17, websites: 10 },
  { name: 'Jul', social: 32, marketplaces: 18, websites: 12 },
];

const responseEffectivenessData = [
  { name: 'DMCA', successRate: 92 },
  { name: 'Platform Report', successRate: 78 },
  { name: 'Direct Contact', successRate: 65 },
  { name: 'Licensing', successRate: 88 },
  { name: 'Legal Action', successRate: 95 },
];
