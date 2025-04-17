"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Filter,
  Table as TableIcon,
  CheckSquare,
  Square,
  Loader2,
  AlertTriangle,
  FileDown,
  ChevronDown,
  ChevronRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type WorkItem = {
  id: string;
  title: string;
  type: string;
  thumbnailUrl?: string;
  hasCertificate: boolean;
  certificateType?: string;
  certificateId?: string;
  createdAt: string;
  selected?: boolean;
};

interface BatchCertificateGeneratorProps {
  onSuccess?: () => void;
}

export function BatchCertificateGenerator({ onSuccess }: BatchCertificateGeneratorProps) {
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorks, setSelectedWorks] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [certificateType, setCertificateType] = useState<string>("standard");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [generating, setGenerating] = useState(false);
  const [processingState, setProcessingState] = useState<{
    total: number;
    processed: number;
    errors: number;
    success: number;
    currentItem?: string;
  }>({ total: 0, processed: 0, errors: 0, success: 0 });
  const [showResults, setShowResults] = useState(false);
  const [tab, setTab] = useState("eligible");
  const [registerOnBlockchain, setRegisterOnBlockchain] = useState(true);

  // Add new state for enhanced features
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [watermarkText, setWatermarkText] = useState("SYNTHETIC RIGHTS CERTIFICATE");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "title">("newest");
  const [processingHistory, setProcessingHistory] = useState<Array<{
    id: string;
    title: string;
    status: "pending" | "success" | "error";
    message?: string;
    timestamp: Date;
  }>>([]);

  // Fetch works from the API
  useEffect(() => {
    const fetchWorks = async () => {
      setLoading(true);
      try {
        // In a real implementation, we would fetch the works from the API
        // For now, we'll simulate it with sample data
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Create 15 sample works
        const sampleWorks: WorkItem[] = Array.from({ length: 15 }, (_, i) => {
          const id = `work-${i + 1}-${Math.random().toString(36).substring(2, 8)}`;
          const type = ["IMAGE", "VIDEO", "AUDIO", "TEXT"][Math.floor(Math.random() * 4)];
          const hasCertificate = Math.random() > 0.7; // 30% have certificates already

          return {
            id,
            title: `Creative Work ${i + 1} - ${type.toLowerCase()} sample`,
            type,
            thumbnailUrl: type === "IMAGE"
              ? `https://picsum.photos/seed/${id}/200/150`
              : type === "VIDEO"
                ? "https://picsum.photos/seed/video/200/150"
                : undefined,
            hasCertificate,
            certificateType: hasCertificate
              ? ["standard", "premium"][Math.floor(Math.random() * 2)]
              : undefined,
            certificateId: hasCertificate
              ? `cert-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
              : undefined,
            createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
              .toISOString(),
            selected: false
          };
        });

        setWorks(sampleWorks);
      } catch (error) {
        console.error("Error fetching works:", error);
        toast.error("Failed to load works");
      } finally {
        setLoading(false);
      }
    };

    fetchWorks();
  }, []);

  // Add sorting function for works
  const sortWorks = (works: WorkItem[]) => {
    switch (sortOrder) {
      case "newest":
        return [...works].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return [...works].sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "title":
        return [...works].sort((a, b) => a.title.localeCompare(b.title));
      default:
        return works;
    }
  };

  // Apply sorting to filtered works
  const filteredWorks = works.filter((work) => {
    const matchesSearch = searchQuery === "" ||
      work.title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "all" || work.type === typeFilter;

    const eligibleFilter = tab === "eligible" ? !work.hasCertificate : true;
    const certificateFilter = tab === "certified" ? work.hasCertificate : true;

    return matchesSearch && matchesType && eligibleFilter && certificateFilter;
  });

  const sortedFilteredWorks = sortWorks(filteredWorks);

  // Toggle select all works
  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    if (newSelectAll) {
      setSelectedWorks(sortedFilteredWorks.map(work => work.id));
    } else {
      setSelectedWorks([]);
    }
  };

  // Toggle selection of a single work
  const toggleWorkSelection = (workId: string) => {
    if (selectedWorks.includes(workId)) {
      setSelectedWorks(selectedWorks.filter(id => id !== workId));
      if (selectAll) setSelectAll(false);
    } else {
      setSelectedWorks([...selectedWorks, workId]);
      if (selectedWorks.length + 1 === sortedFilteredWorks.length) {
        setSelectAll(true);
      }
    }
  };

  // Enhanced certificate generation logic
  const generateCertificates = async () => {
    if (selectedWorks.length === 0) {
      toast.error("Please select at least one work for certificate generation");
      return;
    }

    setGenerating(true);
    setShowResults(true);
    setProcessingState({
      total: selectedWorks.length,
      processed: 0,
      errors: 0,
      success: 0
    });

    const newProcessingHistory: typeof processingHistory = [];

    // Process each work sequentially to avoid overwhelming the API
    for (const workId of selectedWorks) {
      const work = works.find(w => w.id === workId);

      setProcessingState(prev => ({
        ...prev,
        currentItem: work?.title || workId
      }));

      // Add to processing history as pending
      newProcessingHistory.push({
        id: workId,
        title: work?.title || "Unknown work",
        status: "pending",
        timestamp: new Date()
      });

      setProcessingHistory([...newProcessingHistory]);

      try {
        // Simulate API call to generate certificate
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));

        // Randomly simulate success or failure (90% success rate for the demo)
        const success = Math.random() > 0.1;

        if (success) {
          // Update the works array to mark this work as having a certificate
          setWorks(prevWorks =>
            prevWorks.map(w =>
              w.id === workId
                ? {
                    ...w,
                    hasCertificate: true,
                    certificateType,
                    certificateId: `cert-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
                  }
                : w
            )
          );

          setProcessingState(prev => ({
            ...prev,
            processed: prev.processed + 1,
            success: prev.success + 1
          }));

          // Update processing history item
          const historyIndex = newProcessingHistory.findIndex(item => item.id === workId);
          if (historyIndex >= 0) {
            newProcessingHistory[historyIndex] = {
              ...newProcessingHistory[historyIndex],
              status: "success",
              message: "Certificate generated successfully"
            };
            setProcessingHistory([...newProcessingHistory]);
          }
        } else {
          throw new Error("Failed to generate certificate");
        }
      } catch (error) {
        console.error(`Error generating certificate for work ${workId}:`, error);

        setProcessingState(prev => ({
          ...prev,
          processed: prev.processed + 1,
          errors: prev.errors + 1
        }));

        // Update processing history item with error
        const historyIndex = newProcessingHistory.findIndex(item => item.id === workId);
        if (historyIndex >= 0) {
          newProcessingHistory[historyIndex] = {
            ...newProcessingHistory[historyIndex],
            status: "error",
            message: error instanceof Error ? error.message : "Unknown error"
          };
          setProcessingHistory([...newProcessingHistory]);
        }
      }
    }

    // Clear selected works after processing
    setSelectedWorks([]);
    setSelectAll(false);

    // Notify completion
    toast.success(`Generated ${processingState.success} certificates successfully`);

    if (processingState.errors > 0) {
      toast.error(`Failed to generate ${processingState.errors} certificates`);
    }

    setGenerating(false);

    // Call the onSuccess callback if provided
    if (onSuccess) {
      onSuccess();
    }
  };

  // Download a report of the generated certificates
  const downloadReport = () => {
    const certificateData = works
      .filter(work => work.hasCertificate)
      .map(work => ({
        title: work.title,
        id: work.id,
        certificateId: work.certificateId,
        certificateType: work.certificateType,
        createdAt: new Date(work.createdAt).toLocaleString()
      }));

    const jsonStr = JSON.stringify(certificateData, null, 2);
    const dataBlob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate-report-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Certificate report downloaded");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Batch Certificate Generator
          </span>
          {works.some(w => w.hasCertificate) && (
            <Button
              variant="outline"
              size="sm"
              onClick={downloadReport}
              className="gap-1"
            >
              <FileDown className="h-4 w-4" />
              <span>Download Report</span>
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Generate certificates for multiple creative works at once
        </CardDescription>
      </CardHeader>

      <Tabs defaultValue={tab} value={tab} onValueChange={setTab}>
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="eligible">Eligible Works</TabsTrigger>
            <TabsTrigger value="certified">Certified Works</TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="p-6 pt-4">
          {/* Enhanced filters and controls */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search works by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={generating}
              />
            </div>

            <Select
              value={typeFilter}
              onValueChange={setTypeFilter}
              disabled={generating}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Content Types</SelectLabel>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="IMAGE">Images</SelectItem>
                  <SelectItem value="VIDEO">Videos</SelectItem>
                  <SelectItem value="AUDIO">Audio</SelectItem>
                  <SelectItem value="TEXT">Text</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Enhanced sorting select */}
            <Select
              value={sortOrder}
              onValueChange={(value) => setSortOrder(value as typeof sortOrder)}
              disabled={generating}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sort By</SelectLabel>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="title">Title (A-Z)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {tab === "eligible" && (
              <Select
                value={certificateType}
                onValueChange={setCertificateType}
                disabled={generating}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Certificate Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Certificate Type</SelectLabel>
                    <SelectItem value="standard">Standard Certificate</SelectItem>
                    <SelectItem value="premium">Premium Certificate</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}

            {/* Filter indicators */}
            {(searchQuery || typeFilter !== "all") && (
              <Badge variant="outline" className="gap-1">
                <Filter className="h-3 w-3" />
                <span>{sortedFilteredWorks.length} results</span>
              </Badge>
            )}
          </div>

          <TabsContent value="eligible" className="mt-0">
            {/* Display advanced options toggle */}
            {!generating && (
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="text-xs"
                >
                  {showAdvancedOptions ? (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-1" />
                  )}
                  Advanced Options
                </Button>
              </div>
            )}

            {/* Advanced options panel */}
            {showAdvancedOptions && !generating && (
              <div className="mb-4 p-3 border rounded-md bg-muted/20 space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="blockchain-reg"
                    checked={registerOnBlockchain}
                    onCheckedChange={() => setRegisterOnBlockchain(!registerOnBlockchain)}
                    disabled={generating}
                  />
                  <label
                    htmlFor="blockchain-reg"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Register selected works on blockchain for verification
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="watermark-text" className="text-sm">Watermark Text</Label>
                    <Input
                      id="watermark-text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="Enter custom watermark text..."
                      className="h-8 text-sm"
                      disabled={generating}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="certificate-info" className="text-sm">Include Additional Info</Label>
                      <Switch id="certificate-info" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Add copyright information and usage restrictions to certificates
                    </p>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">Loading your creative works...</p>
              </div>
            ) : sortedFilteredWorks.length === 0 ? (
              <div className="text-center py-8 border rounded-md bg-muted/30">
                <TableIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No eligible works found</p>
                <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or adding new works to your registry</p>
              </div>
            ) : (
              <>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]">
                          <div className="flex items-center justify-center">
                            <Checkbox
                              checked={selectAll}
                              onCheckedChange={toggleSelectAll}
                              disabled={generating || sortedFilteredWorks.length === 0}
                              aria-label="Select all works"
                            />
                          </div>
                        </TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead className="w-[100px]">Type</TableHead>
                        <TableHead className="text-right w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedFilteredWorks.map((work) => (
                        <TableRow key={work.id}>
                          <TableCell>
                            <div className="flex items-center justify-center">
                              <Checkbox
                                checked={selectedWorks.includes(work.id)}
                                onCheckedChange={() => toggleWorkSelection(work.id)}
                                disabled={generating || work.hasCertificate}
                                aria-label={`Select ${work.title}`}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {work.thumbnailUrl ? (
                                <div className="h-9 w-12 rounded overflow-hidden bg-muted flex-shrink-0">
                                  <img
                                    src={work.thumbnailUrl}
                                    alt={work.title}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="h-9 w-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs text-muted-foreground">
                                    {work.type.substring(0, 1)}
                                  </span>
                                </div>
                              )}
                              <div className="truncate max-w-[280px]">
                                <p className="text-sm font-medium truncate">{work.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  Created: {new Date(work.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{work.type}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={generating || work.hasCertificate}
                              onClick={() => toggleWorkSelection(work.id)}
                              className="h-7 px-2"
                            >
                              {selectedWorks.includes(work.id) ? (
                                <CheckSquare className="h-4 w-4" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                              <span className="sr-only">Select</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    {selectedWorks.length} of {sortedFilteredWorks.length} works selected
                  </p>

                  <Button
                    onClick={generateCertificates}
                    disabled={generating || selectedWorks.length === 0}
                    className="gap-2"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Generate Certificates
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="certified" className="mt-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">Loading certificates...</p>
              </div>
            ) : sortedFilteredWorks.length === 0 ? (
              <div className="text-center py-8 border rounded-md bg-muted/30">
                <ShieldCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No certificates found</p>
                <p className="text-xs text-muted-foreground mt-1">Generate certificates for your works to see them here</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Certificate Type</TableHead>
                      <TableHead>Certificate ID</TableHead>
                      <TableHead className="text-right">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedFilteredWorks.map((work) => (
                      <TableRow key={work.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {work.thumbnailUrl ? (
                              <div className="h-9 w-12 rounded overflow-hidden bg-muted flex-shrink-0">
                                <img
                                  src={work.thumbnailUrl}
                                  alt={work.title}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="h-9 w-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                                <span className="text-xs text-muted-foreground">
                                  {work.type.substring(0, 1)}
                                </span>
                              </div>
                            )}
                            <div className="truncate max-w-[280px]">
                              <p className="text-sm font-medium truncate">{work.title}</p>
                              <p className="text-xs text-muted-foreground">
                                <Badge variant="outline" size="sm">{work.type}</Badge>
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={work.certificateType === "premium" ? "default" : "secondary"}>
                            {work.certificateType === "premium" ? "Premium" : "Standard"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs font-mono">
                            {work.certificateId ? work.certificateId.substring(0, 14) + "..." : "N/A"}
                          </code>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm">
                            {new Date(work.createdAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Enhanced progress visualization */}
          {showResults && (
            <div className="mt-6 space-y-3">
              {/* Progress bar with completion percentage */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Processing certificates</span>
                  <span>
                    {processingState.processed} of {processingState.total} complete
                  </span>
                </div>
                <div className="relative pt-1">
                  <Progress
                    value={
                      processingState.total > 0
                        ? (processingState.processed / processingState.total) * 100
                        : 0
                    }
                    className="h-2"
                  />
                  {/* Add processing completion percentage */}
                  <span className="absolute right-0 top-0 text-xs text-muted-foreground">
                    {processingState.total > 0 ?
                      Math.round((processingState.processed / processingState.total) * 100) : 0}%
                  </span>
                </div>
              </div>

              {processingState.currentItem && generating && (
                <p className="text-xs text-muted-foreground animate-pulse">
                  Currently processing: {processingState.currentItem}
                </p>
              )}

              {/* Enhanced processing history */}
              {processingHistory.length > 0 && (
                <div className="border rounded-md overflow-hidden mt-4">
                  <div className="bg-muted/30 p-2 px-3 text-sm font-medium border-b">
                    Processing History
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    {processingHistory.map((item, index) => (
                      <div
                        key={`${item.id}-${index}`}
                        className="flex items-center justify-between p-2 px-3 text-sm border-b last:border-b-0"
                      >
                        <div className="flex items-center gap-2">
                          {item.status === "pending" && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                          {item.status === "success" && <Check className="h-3 w-3 text-green-500" />}
                          {item.status === "error" && <AlertTriangle className="h-3 w-3 text-red-500" />}
                          <span className="truncate max-w-[240px]">{item.title}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.status === "pending" ? "Processing..." :
                           item.status === "success" ? "Certificate generated" :
                           item.message || "Error"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {processingState.processed > 0 && (
                <Alert variant={processingState.errors > 0 ? "warning" : "success"} className="mt-4">
                  {processingState.errors > 0 ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    Generated {processingState.success} certificates successfully
                    {processingState.errors > 0 && (
                      <>, with {processingState.errors} failures</>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Tabs>

      <CardFooter className="flex justify-between border-t px-6 py-4">
        <p className="text-sm text-muted-foreground">
          Total works: {works.length} | Certified: {works.filter(w => w.hasCertificate).length}
        </p>
      </CardFooter>
    </Card>
  );
}
