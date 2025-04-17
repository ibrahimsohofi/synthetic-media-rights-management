import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  ActivitySquare,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Shield,
  FileCheck,
  AlertTriangle,
  CheckCheck,
  XCircle,
  Calendar,
  Eye,
  ThumbsUp,
  BookOpen,
  Award,
  Share2,
  Globe,
  Search,
  Link2
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track and analyze the performance of your synthetic media rights management
          </p>
        </div>

        {/* Analytics Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Total Detected Violations
              </CardTitle>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">163</div>
              <div className="flex items-center space-x-2 mt-1 text-xs">
                <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  +12 this month
                </Badge>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Protection Effectiveness
              </CardTitle>
              <Shield className="w-4 h-4 text-violet-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92%</div>
              <div className="flex items-center space-x-2 mt-1 text-xs">
                <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  5%
                </Badge>
                <span className="text-muted-foreground">increased from 87%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Licensing Revenue
              </CardTitle>
              <DollarSign className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$21,587</div>
              <div className="flex items-center space-x-2 mt-1 text-xs">
                <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  12%
                </Badge>
                <span className="text-muted-foreground">year over year</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Average Detection Time
              </CardTitle>
              <ActivitySquare className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18 hrs</div>
              <div className="flex items-center space-x-2 mt-1 text-xs">
                <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  2 hrs
                </Badge>
                <span className="text-muted-foreground">slower than goal</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="detection" className="space-y-6">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="detection" className="gap-2">
              <AlertTriangle className="h-4 w-4" /> Detection
            </TabsTrigger>
            <TabsTrigger value="licensing" className="gap-2">
              <FileCheck className="h-4 w-4" /> Licensing
            </TabsTrigger>
            <TabsTrigger value="engagement" className="gap-2">
              <Eye className="h-4 w-4" /> Engagement
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2">
              <BookOpen className="h-4 w-4" /> Content
            </TabsTrigger>
          </TabsList>

          {/* Detection Analytics */}
          <TabsContent value="detection">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Violation Status</CardTitle>
                  <CardDescription>
                    Distribution of violations by current status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <div className="relative h-[240px] w-[240px]">
                      {/* Mock pieChart - in a real app this would be a chart component */}
                      <div className="absolute inset-0 rounded-full border-[30px] border-l-violet-500 border-r-amber-500 border-t-blue-500 border-b-green-500 transform -rotate-[15deg]"></div>
                      <div className="absolute inset-[30px] bg-background rounded-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-3xl font-bold">163</div>
                          <div className="text-xs text-muted-foreground">Total violations</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                      <div className="text-sm">Pending (42)</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-violet-500"></div>
                      <div className="text-sm">Confirmed (58)</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <div className="text-sm">Resolved (45)</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <div className="text-sm">Dismissed (18)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Violation Sources</CardTitle>
                  <CardDescription>
                    Where violations are most commonly found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-violet-500"></div>
                        <div className="text-sm">Social Media</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium">68</div>
                        <div className="w-[120px] h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 rounded-full" style={{ width: "42%" }}></div>
                        </div>
                        <div className="text-sm text-muted-foreground">42%</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        <div className="text-sm">Marketplaces</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium">42</div>
                        <div className="w-[120px] h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: "26%" }}></div>
                        </div>
                        <div className="text-sm text-muted-foreground">26%</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                        <div className="text-sm">Generative AI</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium">29</div>
                        <div className="w-[120px] h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: "18%" }}></div>
                        </div>
                        <div className="text-sm text-muted-foreground">18%</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <div className="text-sm">News/Blogs</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium">24</div>
                        <div className="w-[120px] h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: "14%" }}></div>
                        </div>
                        <div className="text-sm text-muted-foreground">14%</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-medium mb-4">Detection Method Distribution</h4>
                    <div className="flex justify-between items-center">
                      <div className="text-sm">Automated detection</div>
                      <div className="flex items-center gap-3">
                        <div className="w-[120px] h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 rounded-full" style={{ width: "76%" }}></div>
                        </div>
                        <div className="text-sm text-muted-foreground">76%</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <div className="text-sm">User reported</div>
                      <div className="flex items-center gap-3">
                        <div className="w-[120px] h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: "18%" }}></div>
                        </div>
                        <div className="text-sm text-muted-foreground">18%</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <div className="text-sm">Partner network</div>
                      <div className="flex items-center gap-3">
                        <div className="w-[120px] h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: "6%" }}></div>
                        </div>
                        <div className="text-sm text-muted-foreground">6%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/50 mt-6">
              <CardHeader>
                <CardTitle>Detection Trends</CardTitle>
                <CardDescription>
                  Monthly detection activity over the past year
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full relative border-b border-l">
                  {/* Mock line chart - in a real app this would be a chart component */}
                  <div className="absolute bottom-0 left-0 w-full h-full flex items-end">
                    {months.map((month, i) => (
                      <div key={month} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-4/5 bg-violet-500/80 rounded-t-sm"
                          style={{
                            height: `${(violationTrendData[i] / 25) * 100}%`,
                            maxHeight: "90%"
                          }}
                        ></div>
                        <div className="text-xs text-muted-foreground mt-2 rotate-45 origin-left translate-x-4">
                          {month}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="absolute left-0 bottom-0 transform -translate-y-1/4 -translate-x-3 text-xs text-muted-foreground">0</div>
                  <div className="absolute left-0 bottom-0 transform -translate-y-1/2 -translate-x-3 text-xs text-muted-foreground">12</div>
                  <div className="absolute left-0 bottom-0 transform -translate-y-3/4 -translate-x-3 text-xs text-muted-foreground">18</div>
                  <div className="absolute left-0 top-0 transform -translate-x-3 text-xs text-muted-foreground">25</div>
                </div>

                <div className="flex justify-center items-center space-x-4 mt-8">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-violet-500"></div>
                    <span>Violations Detected</span>
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Total:</span> 163 in the past year
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 mt-6">
              <CardHeader>
                <CardTitle>Detection Efficiency</CardTitle>
                <CardDescription>
                  Key performance indicators for detection systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-y-8 gap-x-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">Average Detection Time</div>
                      <div className="text-sm font-bold">18h</div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: "70%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div>Target: 12h</div>
                      <div>Threshold: 24h</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">Detection Accuracy</div>
                      <div className="text-sm font-bold">92%</div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: "92%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div>Target: 95%</div>
                      <div>Threshold: 85%</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">Resolution Time</div>
                      <div className="text-sm font-bold">3.2 days</div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: "80%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div>Target: 2 days</div>
                      <div>Threshold: 5 days</div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 mt-8 pt-8 border-t">
                  <div>
                    <h4 className="text-sm font-medium mb-4">Detection Performance by Media Type</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4 text-violet-500" />
                          <div className="text-sm">Images</div>
                        </div>
                        <div className="text-sm font-medium">97%</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-blue-500" />
                          <div className="text-sm">Videos</div>
                        </div>
                        <div className="text-sm font-medium">88%</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-green-500" />
                          <div className="text-sm">Text</div>
                        </div>
                        <div className="text-sm font-medium">85%</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Music className="h-4 w-4 text-amber-500" />
                          <div className="text-sm">Audio</div>
                        </div>
                        <div className="text-sm font-medium">92%</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-4">Enforcement Actions by Type</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="text-sm">Takedown notice</div>
                        <div className="text-sm font-medium">48%</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm">Licensing offer</div>
                        <div className="text-sm font-medium">24%</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm">DMCA filed</div>
                        <div className="text-sm font-medium">18%</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm">Attribution request</div>
                        <div className="text-sm font-medium">10%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end mt-6">
              <Button>
                <BarChartIcon className="mr-2 h-4 w-4" />
                Generate Detailed Report
              </Button>
            </div>
          </TabsContent>

          {/* Licensing Analytics */}
          <TabsContent value="licensing">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Revenue by License Type</CardTitle>
                  <CardDescription>
                    Distribution of revenue across different license categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <div className="relative h-[240px] w-[240px]">
                      {/* Mock donut chart - in a real app this would be a chart component */}
                      <div className="absolute inset-0 rounded-full border-[30px] border-l-violet-500 border-r-blue-500 border-t-green-500 border-b-amber-500 transform rotate-[30deg]"></div>
                      <div className="absolute inset-[30px] bg-background rounded-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold">$21.5k</div>
                          <div className="text-xs text-muted-foreground">Total revenue</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-violet-500"></div>
                      <div className="text-sm">Commercial ($9.8k)</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <div className="text-sm">Exclusive ($6.3k)</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <div className="text-sm">Limited ($3.2k)</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                      <div className="text-sm">Educational ($2.2k)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Active License Metrics</CardTitle>
                  <CardDescription>
                    Key performance indicators for your licensing portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Total Active Licenses</span>
                        <span>87 licenses</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 rounded-full" style={{ width: "87%" }}></div>
                        </div>
                        <span className="text-xs text-muted-foreground">Target: 100</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Average License Value</span>
                        <span>$248 / license</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: "82%" }}></div>
                        </div>
                        <span className="text-xs text-muted-foreground">+12%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Renewal Rate</span>
                        <span>78%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: "78%" }}></div>
                        </div>
                        <span className="text-xs text-muted-foreground">Target: 85%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">License Utilization</span>
                        <span>92%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: "92%" }}></div>
                        </div>
                        <span className="text-xs text-muted-foreground">Target: 90%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t space-y-4">
                    <h4 className="text-sm font-medium">Active License Distribution</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center p-3 border rounded-md bg-muted/30">
                        <FileCheck className="h-6 w-6 text-violet-600 mb-2" />
                        <div className="text-xl font-bold">42</div>
                        <div className="text-xs text-muted-foreground">Commercial</div>
                      </div>
                      <div className="flex flex-col items-center p-3 border rounded-md bg-muted/30">
                        <FileCheck className="h-6 w-6 text-blue-600 mb-2" />
                        <div className="text-xl font-bold">16</div>
                        <div className="text-xs text-muted-foreground">Exclusive</div>
                      </div>
                      <div className="flex flex-col items-center p-3 border rounded-md bg-muted/30">
                        <FileCheck className="h-6 w-6 text-green-600 mb-2" />
                        <div className="text-xl font-bold">23</div>
                        <div className="text-xs text-muted-foreground">Limited</div>
                      </div>
                      <div className="flex flex-col items-center p-3 border rounded-md bg-muted/30">
                        <FileCheck className="h-6 w-6 text-amber-600 mb-2" />
                        <div className="text-xl font-bold">6</div>
                        <div className="text-xs text-muted-foreground">Educational</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/50 mt-6">
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>
                  Monthly licensing revenue over the past year
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full relative border-b border-l">
                  {/* Mock bar chart - in a real app this would be a chart component */}
                  <div className="absolute bottom-0 left-0 w-full h-full flex items-end">
                    {months.map((month, i) => (
                      <div key={month} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-4/5 bg-gradient-to-t from-violet-500 to-blue-500 rounded-t-sm"
                          style={{
                            height: `${(revenueData[i] / 2500) * 100}%`,
                            maxHeight: "90%"
                          }}
                        ></div>
                        <div className="text-xs text-muted-foreground mt-2 rotate-45 origin-left translate-x-4">
                          {month}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="absolute left-0 bottom-0 transform -translate-y-1/4 -translate-x-8 text-xs text-muted-foreground">$500</div>
                  <div className="absolute left-0 bottom-0 transform -translate-y-1/2 -translate-x-8 text-xs text-muted-foreground">$1,250</div>
                  <div className="absolute left-0 bottom-0 transform -translate-y-3/4 -translate-x-8 text-xs text-muted-foreground">$1,875</div>
                  <div className="absolute left-0 top-0 transform -translate-x-8 text-xs text-muted-foreground">$2,500</div>
                </div>

                <div className="flex justify-center items-center space-x-4 mt-8">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-violet-500"></div>
                    <span>Monthly Revenue</span>
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">YTD Total:</span> $21,587
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 mt-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Top Performing Content</CardTitle>
                  <CardDescription>
                    Your most profitable works by license revenue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topContentByRevenue.map((item, i) => (
                      <div key={i} className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-md flex items-center justify-center bg-${item.color}-100 dark:bg-${item.color}-900/20 flex-shrink-0`}>
                          {item.icon}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="text-sm font-bold">${item.revenue}</p>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <p className="text-muted-foreground">{item.type} • {item.licenses} licenses</p>
                            <Badge variant="outline" className={`bg-${item.color}-50 text-${item.color}-700 border-${item.color}-200 dark:bg-${item.color}-900/20 dark:text-${item.color}-400 dark:border-${item.color}-800/30`}>
                              {item.growth}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Licensing Opportunities</CardTitle>
                  <CardDescription>
                    Potential revenue sources based on market analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {licensingOpportunities.map((opportunity, i) => (
                      <div key={i} className="flex items-start p-3 border rounded-md bg-muted/30">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-${opportunity.color}-100 dark:bg-${opportunity.color}-900/20 flex-shrink-0 mr-3`}>
                          {opportunity.icon}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium">{opportunity.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {opportunity.potentialRevenue}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{opportunity.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end mt-6">
              <Button>
                <LineChartIcon className="mr-2 h-4 w-4" />
                Generate Revenue Report
              </Button>
            </div>
          </TabsContent>

          {/* Engagement Analytics */}
          <TabsContent value="engagement">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Content Engagement Overview</CardTitle>
                  <CardDescription>
                    How users interact with your protected content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div>
                      <div className="flex justify-between mb-2">
                        <h4 className="text-sm font-medium">Total Content Views</h4>
                        <span className="text-sm font-bold">24,872</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Previous: 18,345</span>
                          <span className="text-green-600 font-medium">+35.6%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 rounded-full" style={{ width: "86%" }}></div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <h4 className="text-sm font-medium">Average Time Spent</h4>
                        <span className="text-sm font-bold">3:42 min</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Previous: 2:58 min</span>
                          <span className="text-green-600 font-medium">+24.7%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: "78%" }}></div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <h4 className="text-sm font-medium">Licensing Conversion</h4>
                        <span className="text-sm font-bold">3.2%</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Previous: 2.7%</span>
                          <span className="text-green-600 font-medium">+0.5%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: "64%" }}></div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <h4 className="text-sm font-medium">Social Shares</h4>
                        <span className="text-sm font-bold">1,245</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Previous: 876</span>
                          <span className="text-green-600 font-medium">+42.1%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: "84%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                  <CardDescription>
                    Where your content is being viewed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {trafficSources.map((source) => (
                      <div key={source.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {source.icon}
                            <span className="text-sm font-medium">{source.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {source.percentage}%
                          </Badge>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${source.color}`}
                            style={{ width: `${source.percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{source.views.toLocaleString()} views</span>
                          <span className={source.trend > 0 ? "text-green-600" : "text-red-600"}>
                            {source.trend > 0 ? "+" : ""}{source.trend}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mt-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Engagement by Device</CardTitle>
                  <CardDescription>
                    How users access your content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center pb-4">
                    <div className="relative h-[180px] w-[180px]">
                      {/* Mock donut chart */}
                      <div className="absolute inset-0 rounded-full border-[24px] border-l-violet-500 border-r-blue-500 border-t-green-500 border-b-gray-200 transform rotate-[110deg]"></div>
                      <div className="absolute inset-[24px] bg-background rounded-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-xl font-bold">24.8k</div>
                          <div className="text-xs text-muted-foreground">Total views</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-violet-500"></div>
                      <div className="text-sm">Mobile (48%)</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <div className="text-sm">Desktop (34%)</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <div className="text-sm">Tablet (12%)</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-gray-300"></div>
                      <div className="text-sm">Other (6%)</div>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t">
                    <h4 className="text-sm font-medium mb-3">Platform Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>iOS</span>
                        <span>11,568 views (46.5%)</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Android</span>
                        <span>8,456 views (34.0%)</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Windows</span>
                        <span>3,254 views (13.1%)</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>macOS</span>
                        <span>1,462 views (5.9%)</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Linux</span>
                        <span>132 views (0.5%)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                  <CardDescription>
                    Where your content is being viewed globally
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px] relative border border-border/50 rounded-md bg-muted/30 flex items-center justify-center mb-6">
                    <div className="text-center text-muted-foreground text-sm">
                      [World Map Visualization]
                      <p className="text-xs mt-2">Shows global distribution of content views</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">United States</span>
                      <div className="flex items-center gap-3">
                        <div className="w-[120px] h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 rounded-full" style={{ width: "42%" }}></div>
                        </div>
                        <span className="text-xs font-medium">42%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">European Union</span>
                      <div className="flex items-center gap-3">
                        <div className="w-[120px] h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 rounded-full" style={{ width: "24%" }}></div>
                        </div>
                        <span className="text-xs font-medium">24%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Asia Pacific</span>
                      <div className="flex items-center gap-3">
                        <div className="w-[120px] h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 rounded-full" style={{ width: "18%" }}></div>
                        </div>
                        <span className="text-xs font-medium">18%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Latin America</span>
                      <div className="flex items-center gap-3">
                        <div className="w-[120px] h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 rounded-full" style={{ width: "9%" }}></div>
                        </div>
                        <span className="text-xs font-medium">9%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Other regions</span>
                      <div className="flex items-center gap-3">
                        <div className="w-[120px] h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 rounded-full" style={{ width: "7%" }}></div>
                        </div>
                        <span className="text-xs font-medium">7%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/50 mt-6">
              <CardHeader>
                <CardTitle>Engagement Trends</CardTitle>
                <CardDescription>
                  Monthly view and engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full relative border-b border-l">
                  {/* Mock line chart - in a real app this would be a chart component */}
                  <div className="absolute bottom-0 left-0 w-full h-full flex items-end">
                    {months.map((month, i) => (
                      <div key={month} className="flex-1 flex flex-col items-center">
                        <div
                          className="relative w-4/5"
                        >
                          {/* Views bar */}
                          <div
                            className="absolute bottom-0 w-full bg-violet-500/90 rounded-t-sm"
                            style={{
                              height: `${(viewsData[i] / 5000) * 100}%`,
                              maxHeight: "90%"
                            }}
                          ></div>
                          {/* Engagement line */}
                          <div
                            className="absolute bottom-0 w-full bg-blue-500/30 rounded-t-sm"
                            style={{
                              height: `${(engagementData[i] / 5000) * 100}%`,
                              maxHeight: "90%"
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2 rotate-45 origin-left translate-x-4">
                          {month}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="absolute left-0 bottom-0 transform -translate-y-1/4 -translate-x-8 text-xs text-muted-foreground">1,250</div>
                  <div className="absolute left-0 bottom-0 transform -translate-y-1/2 -translate-x-8 text-xs text-muted-foreground">2,500</div>
                  <div className="absolute left-0 bottom-0 transform -translate-y-3/4 -translate-x-8 text-xs text-muted-foreground">3,750</div>
                  <div className="absolute left-0 top-0 transform -translate-x-8 text-xs text-muted-foreground">5,000</div>
                </div>

                <div className="flex justify-center items-center space-x-6 mt-8">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-violet-500"></div>
                    <span>Views</span>
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-blue-500/50"></div>
                    <span>Engagement</span>
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">YTD Total:</span> 24,872 views
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end mt-6">
              <Button>
                <LineChartIcon className="mr-2 h-4 w-4" />
                Generate Engagement Report
              </Button>
            </div>
          </TabsContent>

          {/* Content Analytics */}
          <TabsContent value="content">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Content Analytics</CardTitle>
                <CardDescription>
                  Insights into your content portfolio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Content Analytics</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    This section will display detailed analytics on your content portfolio, including popularity, performance, and trends.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* AI Recommendations */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
            <CardDescription>
              Insights and suggestions to improve your rights management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-3 border rounded-lg bg-muted/30"
                >
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center dark:bg-violet-900/20 flex-shrink-0">
                    {recommendation.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">{recommendation.title}</h3>
                    <p className="text-sm text-muted-foreground">{recommendation.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Sample data
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const violationTrendData = [8, 12, 10, 14, 9, 11, 15, 18, 21, 17, 14, 18];

// Revenue data (monthly)
const revenueData = [1250, 1450, 1300, 1650, 1800, 2100, 2300, 1950, 2150, 2400, 2150, 2250];

// Top content by revenue
const topContentByRevenue = [
  {
    title: "Neon Cityscape Series",
    type: "IMAGE",
    licenses: 12,
    revenue: 3240,
    growth: "+18%",
    icon: <ImageIcon className="h-5 w-5 text-violet-600" />,
    color: "violet"
  },
  {
    title: "Ambient Soundscape Collection",
    type: "AUDIO",
    licenses: 8,
    revenue: 2160,
    growth: "+24%",
    icon: <Music className="h-5 w-5 text-blue-600" />,
    color: "blue"
  },
  {
    title: "Abstract Motion Series",
    type: "VIDEO",
    licenses: 6,
    revenue: 1890,
    growth: "+12%",
    icon: <Video className="h-5 w-5 text-green-600" />,
    color: "green"
  },
  {
    title: "Digital Portrait Series",
    type: "IMAGE",
    licenses: 9,
    revenue: 1620,
    growth: "+8%",
    icon: <ImageIcon className="h-5 w-5 text-amber-600" />,
    color: "amber"
  }
];

// Licensing opportunities
const licensingOpportunities = [
  {
    title: "Enterprise Licensing Package",
    potentialRevenue: "$4,500+",
    description: "Bundle your top performing assets into an enterprise package for corporate clients.",
    icon: <Award className="h-4 w-4 text-violet-600" />,
    color: "violet"
  },
  {
    title: "Educational Institution Discounts",
    potentialRevenue: "$2,800+",
    description: "Offer specialized pricing for universities and educational institutions.",
    icon: <BookOpen className="h-4 w-4 text-blue-600" />,
    color: "blue"
  },
  {
    title: "AI Training Licensing",
    potentialRevenue: "$6,200+",
    description: "Selective opt-in licensing for AI model training with proper attribution.",
    icon: <ThumbsUp className="h-4 w-4 text-green-600" />,
    color: "green"
  },
  {
    title: "Seasonal Content Bundle",
    potentialRevenue: "$1,900+",
    description: "Create themed bundles for upcoming seasonal marketing campaigns.",
    icon: <Calendar className="h-4 w-4 text-amber-600" />,
    color: "amber"
  }
];

// Recommendations
const recommendations = [
  {
    icon: <Shield className="h-4 w-4 text-violet-600" />,
    title: "Enhance detection for audio content",
    description: "Your audio detection accuracy is below target. Consider enabling advanced audio fingerprinting for your music assets."
  },
  {
    icon: <FileCheck className="h-4 w-4 text-blue-600" />,
    title: "Review pending license requests",
    description: "You have 5 pending license requests that have been waiting for over 72 hours. Promptly reviewing requests can increase conversion."
  },
  {
    icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
    title: "Potential training data leakage",
    description: "Our analysis indicates your portfolio may be used in 2 AI training datasets without proper permissions. Consider conducting an audit."
  },
  {
    icon: <Award className="h-4 w-4 text-green-600" />,
    title: "Opportunity for revenue growth",
    description: "Based on current licensing trends, offering enterprise licensing packages could increase your revenue by 18%."
  }
];

// Engagement data
const viewsData = [1850, 2100, 1950, 2300, 2450, 2200, 1900, 2050, 2400, 2700, 2300, 2550];
const engagementData = [850, 950, 1050, 1250, 1350, 1200, 1000, 1100, 1300, 1450, 1200, 1350];

// Traffic sources data
const trafficSources = [
  {
    name: "Social Media",
    icon: <Share2 className="h-4 w-4 text-violet-600" />,
    percentage: 36,
    views: 8954,
    trend: 12.4,
    color: "bg-violet-500"
  },
  {
    name: "Direct Traffic",
    icon: <Globe className="h-4 w-4 text-blue-600" />,
    percentage: 24,
    views: 5970,
    trend: 8.2,
    color: "bg-blue-500"
  },
  {
    name: "Search Engines",
    icon: <Search className="h-4 w-4 text-green-600" />,
    percentage: 22,
    views: 5472,
    trend: -2.5,
    color: "bg-green-500"
  },
  {
    name: "Referrals",
    icon: <Link2 className="h-4 w-4 text-amber-600" />,
    percentage: 18,
    views: 4476,
    trend: 15.8,
    color: "bg-amber-500"
  }
];
