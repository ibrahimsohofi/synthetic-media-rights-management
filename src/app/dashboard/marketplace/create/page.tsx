"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, AlertCircle, Info, Check, Tag, DollarSign, Clock, Calendar } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getUserCreativeWorks } from "@/lib/actions/rights-registry";
import { createMarketplaceListing } from "@/lib/actions/marketplace";
import { useRouter } from "next/navigation";

export default function CreateMarketplaceListingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [licenseType, setLicenseType] = useState<"COMMERCIAL" | "EXCLUSIVE" | "LIMITED" | "PERSONAL" | "EDUCATIONAL">("LIMITED");
  const [duration, setDuration] = useState<string>("90");
  const [selectedWorkId, setSelectedWorkId] = useState<string>("");
  const [featured, setFeatured] = useState(false);
  const [permissions, setPermissions] = useState({
    modification: false,
    distribution: true,
    attribution: true,
    commercialUse: false,
  });
  const [restrictions, setRestrictions] = useState({
    noDerivatives: false,
    noAiTraining: true,
    geographicRestriction: false,
    industriesExcluded: false,
  });

  // Works list for selection
  const [works, setWorks] = useState<any[]>([]);
  const [loadingWorks, setLoadingWorks] = useState(true);

  // Fetch user's creative works
  useEffect(() => {
    const fetchWorks = async () => {
      try {
        setLoadingWorks(true);
        const result = await getUserCreativeWorks();

        if (result.success) {
          // Filter only registered works that can be listed
          const eligibleWorks = result.works.filter(work =>
            work.registrationStatus === "REGISTERED" && work.visibility !== "PRIVATE"
          );
          setWorks(eligibleWorks);

          // Select first work by default if available
          if (eligibleWorks.length > 0) {
            setSelectedWorkId(eligibleWorks[0].id);
          }
        } else {
          setError("Failed to load your creative works");
        }
      } catch (err) {
        console.error("Error fetching works:", err);
        setError("An error occurred while loading your creative works");
      } finally {
        setLoadingWorks(false);
      }
    };

    fetchWorks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (!title) {
      setError("Please enter a title for your listing");
      return;
    }

    if (!description) {
      setError("Please provide a description for your listing");
      return;
    }

    if (!price || isNaN(Number.parseFloat(price)) || Number.parseFloat(price) <= 0) {
      setError("Please enter a valid price");
      return;
    }

    if (!selectedWorkId) {
      setError("Please select a creative work to list");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("licenseType", licenseType);
      formData.append("duration", duration);
      formData.append("creativeWorkId", selectedWorkId);
      formData.append("featured", featured.toString());

      // Convert permissions and restrictions to strings for storage
      const permissionsString = Object.entries(permissions)
        .filter(([_, enabled]) => enabled)
        .map(([name]) => name)
        .join(",");

      const restrictionsString = Object.entries(restrictions)
        .filter(([_, enabled]) => enabled)
        .map(([name]) => name)
        .join(",");

      formData.append("permissions", permissionsString);
      formData.append("restrictions", restrictionsString);

      const result = await createMarketplaceListing(formData);

      if (result.success) {
        setSuccess(true);
        toast.success("Marketplace listing created successfully");

        // Redirect after success message
        setTimeout(() => {
          router.push("/dashboard/marketplace");
        }, 2000);
      } else {
        setError(result.message || "Failed to create marketplace listing");
        toast.error(result.message || "Failed to create listing");
      }
    } catch (err) {
      console.error("Error creating listing:", err);
      setError("An error occurred while creating your listing");
      toast.error("Failed to create listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start">
          <div>
            <Link
              href="/dashboard/marketplace"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-1"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Marketplace
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Create Marketplace Listing</h1>
            <p className="text-muted-foreground">
              List your creative work for sale or licensing in the marketplace
            </p>
          </div>
        </div>

        <Card className="border-border/50">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Listing Details</CardTitle>
              <CardDescription>
                Provide information about what you're offering and how it can be used
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="flex items-start space-x-3 p-3 border border-red-200 rounded-md bg-red-50 dark:border-red-900/30 dark:bg-red-900/10">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center mt-0.5">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </div>
                </div>
              )}

              {success && (
                <div className="flex items-start space-x-3 p-3 border border-green-200 rounded-md bg-green-50 dark:border-green-900/30 dark:bg-green-900/10">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center mt-0.5">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    <p className="font-medium">Listing created successfully!</p>
                    <p>Your work is now available in the marketplace.</p>
                  </div>
                </div>
              )}

              {/* Work Selection */}
              <div className="space-y-3">
                <Label htmlFor="work-select" className="text-base font-medium">Select Work to List <span className="text-red-500">*</span></Label>
                {loadingWorks ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-10 bg-muted rounded"></div>
                    <div className="h-4 w-40 bg-muted rounded"></div>
                  </div>
                ) : works.length > 0 ? (
                  <>
                    <Select value={selectedWorkId} onValueChange={setSelectedWorkId}>
                      <SelectTrigger id="work-select">
                        <SelectValue placeholder="Select a creative work" />
                      </SelectTrigger>
                      <SelectContent>
                        {works.map((work) => (
                          <SelectItem key={work.id} value={work.id}>
                            {work.title} ({work.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Only registered works with public or limited visibility can be listed
                    </p>
                  </>
                ) : (
                  <div className="rounded-lg border border-dashed p-6 text-center">
                    <h3 className="text-sm font-medium mb-1">No Eligible Works Found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You need to register works with public or limited visibility before listing them
                    </p>
                    <Button asChild>
                      <Link href="/dashboard/rights-registry/register">
                        Register a Creative Work
                      </Link>
                    </Button>
                  </div>
                )}
              </div>

              {/* Listing Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Listing Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter an attractive title for your listing"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your work and how it can be used by licensees"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USD) <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="price"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        className="pl-8"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="license-type">License Type <span className="text-red-500">*</span></Label>
                    <Select value={licenseType} onValueChange={(val) => setLicenseType(val as any)}>
                      <SelectTrigger id="license-type">
                        <SelectValue placeholder="Select license type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COMMERCIAL">Commercial License</SelectItem>
                        <SelectItem value="EXCLUSIVE">Exclusive Rights</SelectItem>
                        <SelectItem value="LIMITED">Limited Usage</SelectItem>
                        <SelectItem value="PERSONAL">Personal Use Only</SelectItem>
                        <SelectItem value="EDUCATIONAL">Educational Use</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">License Duration <span className="text-red-500">*</span></Label>
                  <div className="flex gap-2 items-center">
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger id="duration" className="w-[180px]">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">6 months</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                        <SelectItem value="730">2 years</SelectItem>
                        <SelectItem value="1825">5 years</SelectItem>
                        <SelectItem value="0">Perpetual</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        {duration === "0"
                          ? "No expiration"
                          : `Expires after ${
                              Number.parseInt(duration) < 365
                                ? `${duration} days`
                                : `${Math.round(Number.parseInt(duration) / 365)} year${Math.round(Number.parseInt(duration) / 365) !== 1 ? 's' : ''}`
                            }`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Usage Permissions</Label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="permission-modification"
                      checked={permissions.modification}
                      onCheckedChange={(checked) =>
                        setPermissions({...permissions, modification: checked as boolean})
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="permission-modification" className="font-medium cursor-pointer">Modification Rights</Label>
                      <p className="text-xs text-muted-foreground">
                        Licensee can modify or create derivative works
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="permission-distribution"
                      checked={permissions.distribution}
                      onCheckedChange={(checked) =>
                        setPermissions({...permissions, distribution: checked as boolean})
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="permission-distribution" className="font-medium cursor-pointer">Distribution</Label>
                      <p className="text-xs text-muted-foreground">
                        Licensee can distribute the work in their projects
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="permission-attribution"
                      checked={permissions.attribution}
                      onCheckedChange={(checked) =>
                        setPermissions({...permissions, attribution: checked as boolean})
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="permission-attribution" className="font-medium cursor-pointer">Attribution Required</Label>
                      <p className="text-xs text-muted-foreground">
                        Licensee must credit you as the original creator
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="permission-commercial"
                      checked={permissions.commercialUse}
                      onCheckedChange={(checked) =>
                        setPermissions({...permissions, commercialUse: checked as boolean})
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="permission-commercial" className="font-medium cursor-pointer">Commercial Use</Label>
                      <p className="text-xs text-muted-foreground">
                        Licensee can use the work in commercial projects
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Restrictions */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Restrictions</Label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="restriction-derivatives"
                      checked={restrictions.noDerivatives}
                      onCheckedChange={(checked) =>
                        setRestrictions({...restrictions, noDerivatives: checked as boolean})
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="restriction-derivatives" className="font-medium cursor-pointer">No Derivatives</Label>
                      <p className="text-xs text-muted-foreground">
                        Work must be used as-is without modifications
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="restriction-ai"
                      checked={restrictions.noAiTraining}
                      onCheckedChange={(checked) =>
                        setRestrictions({...restrictions, noAiTraining: checked as boolean})
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="restriction-ai" className="font-medium cursor-pointer">No AI Training</Label>
                      <p className="text-xs text-muted-foreground">
                        Work cannot be used to train AI systems
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="restriction-geographic"
                      checked={restrictions.geographicRestriction}
                      onCheckedChange={(checked) =>
                        setRestrictions({...restrictions, geographicRestriction: checked as boolean})
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="restriction-geographic" className="font-medium cursor-pointer">Geographic Restrictions</Label>
                      <p className="text-xs text-muted-foreground">
                        Usage limited to specific regions (specify in description)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="restriction-industries"
                      checked={restrictions.industriesExcluded}
                      onCheckedChange={(checked) =>
                        setRestrictions({...restrictions, industriesExcluded: checked as boolean})
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="restriction-industries" className="font-medium cursor-pointer">Industry Exclusions</Label>
                      <p className="text-xs text-muted-foreground">
                        Certain industries excluded (specify in description)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Featured Option */}
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="featured"
                    checked={featured}
                    onCheckedChange={(checked) => setFeatured(checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="featured" className="font-medium cursor-pointer">Feature this listing</Label>
                    <p className="text-xs text-muted-foreground">
                      Featured listings appear at the top of search results and marketplace pages (additional fees may apply)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 border border-blue-200 rounded-md bg-blue-50 dark:border-blue-900/30 dark:bg-blue-900/10">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center mt-0.5">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  <p>Listing your work in the marketplace makes it available for licensing or purchase by other users. You will be notified when someone expresses interest in your listing.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-muted/50 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Listing..." : (
                  <>
                    <Tag className="mr-2 h-4 w-4" /> Create Listing
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
