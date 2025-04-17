"use client";

import React, { useState, useEffect } from "react";
import { BatchCertificateDownload } from "@/components/ui/batch-certificate-download";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Loader2, Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function BatchCertificatePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [works, setWorks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("uncertified");

  const fetchWorks = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, we would fetch works from the API
      // For now, we'll create sample data
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate 15 sample works
      const sampleWorks = Array.from({ length: 15 }, (_, i) => {
        const id = `work-${i + 1}-${Math.random().toString(36).substring(2, 8)}`;
        const hasCertificate = Math.random() > 0.6; // 40% have certificates already
        const type = ["IMAGE", "VIDEO", "AUDIO", "TEXT"][Math.floor(Math.random() * 4)];

        return {
          id,
          title: `Creative Work ${i + 1} - ${type.toLowerCase()} sample`,
          type,
          createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
          thumbnailUrl: type === "IMAGE" ? `https://picsum.photos/seed/${id}/200/150` : undefined,
          hasCertificate,
          certificateType: hasCertificate ? (Math.random() > 0.5 ? "standard" : "premium") : undefined,
          certificateId: hasCertificate ? `cert-${Date.now()}-${Math.random().toString(16).slice(2, 10)}` : undefined,
          selected: false
        };
      });

      setWorks(sampleWorks);
    } catch (error) {
      console.error("Error fetching works:", error);
      toast.error("Failed to load your creative works");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  // Filter works based on search and active tab
  const filteredWorks = works.filter(work => {
    const matchesSearch = searchQuery === "" ||
      work.title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = activeTab === "all" ||
      (activeTab === "certified" && work.hasCertificate) ||
      (activeTab === "uncertified" && !work.hasCertificate);

    return matchesSearch && matchesTab;
  });

  const handleRefresh = () => {
    fetchWorks();
  };

  const handleDownloadComplete = () => {
    toast.success("Certificates downloaded successfully");
    fetchWorks(); // Refresh works to update certificate status
  };

  return (
    <div className="container py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Batch Certificate Generation</h1>
          <p className="text-muted-foreground">
            Generate and download certificates for multiple creative works at once
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardContent className="p-6">
              <BatchCertificateDownload
                works={works}
                onDownloadComplete={handleDownloadComplete}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Works Overview</CardTitle>
              <CardDescription>
                Status of your creative works
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search works..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Tabs defaultValue="uncertified" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="uncertified">Uncertified</TabsTrigger>
                    <TabsTrigger value="certified">Certified</TabsTrigger>
                    <TabsTrigger value="all">All Works</TabsTrigger>
                  </TabsList>

                  <TabsContent value="uncertified" className="space-y-4 mt-4">
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : filteredWorks.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No uncertified works found</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredWorks.map((work) => (
                          <div key={work.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-accent">
                            <div className="truncate max-w-[200px]">
                              <p className="font-medium truncate">{work.title}</p>
                              <p className="text-xs text-muted-foreground">{new Date(work.createdAt).toLocaleDateString()}</p>
                            </div>
                            <Badge variant="outline">{work.type}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="certified" className="space-y-4 mt-4">
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : filteredWorks.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No certified works found</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredWorks.map((work) => (
                          <div key={work.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-accent">
                            <div className="truncate max-w-[200px]">
                              <p className="font-medium truncate">{work.title}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant={work.certificateType === "premium" ? "default" : "secondary"} className="text-xs">
                                  {work.certificateType === "premium" ? "Premium" : "Standard"}
                                </Badge>
                              </div>
                            </div>
                            <Badge variant="outline">{work.type}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="all" className="space-y-4 mt-4">
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : filteredWorks.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No works found</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredWorks.map((work) => (
                          <div key={work.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-accent">
                            <div className="truncate max-w-[200px]">
                              <p className="font-medium truncate">{work.title}</p>
                              <div className="flex items-center gap-2">
                                {work.hasCertificate ? (
                                  <Badge variant={work.certificateType === "premium" ? "default" : "secondary"} className="text-xs">
                                    {work.certificateType === "premium" ? "Premium" : "Standard"}
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-muted-foreground">No certificate</span>
                                )}
                              </div>
                            </div>
                            <Badge variant="outline">{work.type}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <div className="w-full text-sm">
                <div className="flex justify-between">
                  <span>Total works:</span>
                  <span>{works.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>With certificates:</span>
                  <span>{works.filter(w => w.hasCertificate).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Uncertified:</span>
                  <span>{works.filter(w => !w.hasCertificate).length}</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
