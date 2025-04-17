import type { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ShoppingBag,
  Filter,
  Search,
  Tag,
  ArrowUpDown,
  Brain,
  Star,
  Image as ImageIcon,
  Video,
  Newspaper,
  Music,
  Zap,
  ChevronDown,
  Plus,
  FileBox
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Marketplace - SyntheticRights",
  description: "Buy and sell licenses and AI training rights for synthetic media",
};

// Sample marketplace listings
const SAMPLE_LISTINGS = [
  {
    id: "listing-1",
    title: "AI Portrait Generator - Commercial License",
    description: "License for commercial use of AI-generated portraits in marketing materials",
    price: 299,
    currency: "USD",
    licenseType: "commercial",
    mediaType: "image",
    seller: {
      id: "user-1",
      name: "Creative AI Studios",
      rating: 4.8,
      verified: true,
    },
    thumbnail: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=1974&auto=format&fit=crop",
    aiTrainingAllowed: true,
    featured: true,
    createdAt: "2025-03-15",
  },
  {
    id: "listing-2",
    title: "Synthetic Voice Pack - Personal Use",
    description: "Collection of synthetic voices for personal projects. No AI training allowed.",
    price: 49.99,
    currency: "USD",
    licenseType: "personal",
    mediaType: "audio",
    seller: {
      id: "user-2",
      name: "VoiceCraft AI",
      rating: 4.5,
      verified: true,
    },
    thumbnail: "https://images.unsplash.com/photo-1613479205646-c0dc1ee8413f?q=80&w=2070&auto=format&fit=crop",
    aiTrainingAllowed: false,
    featured: false,
    createdAt: "2025-04-01",
  },
  {
    id: "listing-3",
    title: "AI Training Dataset - Fashion Images",
    description: "Curated dataset of fashion images cleared for AI model training",
    price: 599,
    currency: "USD",
    licenseType: "ai-training",
    mediaType: "dataset",
    seller: {
      id: "user-3",
      name: "FashionTech AI",
      rating: 4.9,
      verified: true,
    },
    thumbnail: "https://images.unsplash.com/photo-1577899877822-73ddff378e8d?q=80&w=2069&auto=format&fit=crop",
    aiTrainingAllowed: true,
    featured: true,
    createdAt: "2025-04-05",
  },
  {
    id: "listing-4",
    title: "Synthetic Landscape Videos - Extended License",
    description: "AI-generated landscape videos with extended commercial rights",
    price: 199.95,
    currency: "USD",
    licenseType: "extended",
    mediaType: "video",
    seller: {
      id: "user-4",
      name: "Landscape AI",
      rating: 4.3,
      verified: false,
    },
    thumbnail: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=2070&auto=format&fit=crop",
    aiTrainingAllowed: true,
    featured: false,
    createdAt: "2025-04-10",
  },
  {
    id: "listing-5",
    title: "AI-Generated Article Templates",
    description: "Collection of AI-written article templates for various industries",
    price: 79.99,
    currency: "USD",
    licenseType: "commercial",
    mediaType: "text",
    seller: {
      id: "user-5",
      name: "ContentGenAI",
      rating: 4.6,
      verified: true,
    },
    thumbnail: "https://images.unsplash.com/photo-1583361704493-d4d4d1b1d70a?q=80&w=2070&auto=format&fit=crop",
    aiTrainingAllowed: true,
    featured: false,
    createdAt: "2025-04-12",
  },
  {
    id: "listing-6",
    title: "Neural Style Transfer - AI Training Rights",
    description: "Rights to train AI models on proprietary style transfer technique",
    price: 1299,
    currency: "USD",
    licenseType: "ai-training",
    mediaType: "algorithm",
    seller: {
      id: "user-6",
      name: "StyleAI Labs",
      rating: 5.0,
      verified: true,
    },
    thumbnail: "https://images.unsplash.com/photo-1617791160536-598cf32026fb?q=80&w=1964&auto=format&fit=crop",
    aiTrainingAllowed: true,
    featured: true,
    createdAt: "2025-04-15",
  },
];

export default async function MarketplacePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-muted-foreground">
            Buy and sell licenses and AI training rights for synthetic media
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/dashboard/marketplace/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              List New Item
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Browse Marketplace</span>
            <span className="sm:hidden">Browse</span>
          </TabsTrigger>
          <TabsTrigger value="ai-training" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">AI Training Rights</span>
            <span className="sm:hidden">AI Rights</span>
          </TabsTrigger>
          <TabsTrigger value="my-listings" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span className="hidden sm:inline">My Listings</span>
            <span className="sm:hidden">My Items</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Filters sidebar */}
          <Card className="md:w-64 flex-shrink-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Media Type</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="All media types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All media types</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="dataset">Datasets</SelectItem>
                    <SelectItem value="algorithm">Algorithms</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">License Type</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="All license types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All license types</SelectItem>
                    <SelectItem value="personal">Personal Use</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="extended">Extended Commercial</SelectItem>
                    <SelectItem value="ai-training">AI Training Rights</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Price Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" placeholder="Min" min="0" />
                  <Input type="number" placeholder="Max" min="0" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="ai-training" />
                  <label
                    htmlFor="ai-training"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    AI training allowed
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="verified-sellers" />
                  <label
                    htmlFor="verified-sellers"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Verified sellers only
                  </label>
                </div>
              </div>

              <Button className="w-full" size="sm" variant="outline">
                Apply Filters
              </Button>
            </CardContent>
          </Card>

          {/* Main content area */}
          <div className="flex-1 space-y-6">
            <TabsContent value="browse" className="space-y-6 m-0">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle>Featured Listings</CardTitle>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <ArrowUpDown className="h-3.5 w-3.5" />
                      Sort
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative mb-4">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search marketplace..."
                      className="pl-8"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {SAMPLE_LISTINGS.filter(listing => listing.featured).map(listing => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>All Listings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SAMPLE_LISTINGS.map(listing => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <div className="flex justify-center w-full">
                    <Button variant="outline" className="gap-1">
                      Load More <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="ai-training" className="space-y-6 m-0">
              <Card>
                <CardHeader>
                  <CardTitle>AI Training Rights</CardTitle>
                  <CardDescription>
                    Browse licenses specifically for training AI models
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative mb-4">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search AI training rights..."
                      className="pl-8"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {SAMPLE_LISTINGS.filter(listing =>
                      listing.licenseType === "ai-training" || listing.aiTrainingAllowed
                    ).map(listing => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4 flex justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing only items that allow AI training
                  </p>
                  <Button variant="outline" size="sm">
                    Learn More
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>AI Training Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    When purchasing AI training rights, you are acquiring the legal permission to use the content
                    to train artificial intelligence models. This is separate from usage rights for the content itself.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Dataset License</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">
                          Permission to use data for training AI models without rights to the output
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Derivative Works</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">
                          Rights to create new works based on the AI models trained with the content
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Commercial AI</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">
                          Rights to use the trained AI for commercial applications and services
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="my-listings" className="space-y-6 m-0">
              <Card>
                <CardHeader>
                  <CardTitle>My Listings</CardTitle>
                  <CardDescription>
                    Manage your marketplace listings and sales
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {/* If no listings */}
                  <div className="text-center py-12">
                    <FileBox className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                    <h3 className="text-lg font-medium">No listings yet</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                      You haven't listed any items in the marketplace yet
                    </p>
                    <Link href="/dashboard/marketplace/create">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Listing
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Analytics & Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Start selling licenses and AI training rights to view analytics
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}

function ListingCard({ listing }: { listing: any }) {
  // Get icon based on media type
  const getMediaIcon = () => {
    switch (listing.mediaType) {
      case "image":
        return <ImageIcon className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "audio":
        return <Music className="h-4 w-4" />;
      case "text":
        return <Newspaper className="h-4 w-4" />;
      case "dataset":
        return <FileBox className="h-4 w-4" />;
      case "algorithm":
        return <Zap className="h-4 w-4" />;
      default:
        return <FileBox className="h-4 w-4" />;
    }
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={listing.thumbnail}
          alt={listing.title}
          className="object-cover w-full h-full"
        />
        {listing.featured && (
          <Badge className="absolute top-2 right-2 bg-yellow-500/90 hover:bg-yellow-500/90">
            <Star className="h-3 w-3 mr-1 fill-current" />
            Featured
          </Badge>
        )}
        {listing.aiTrainingAllowed && (
          <Badge className="absolute top-2 left-2 bg-violet-600/90 hover:bg-violet-600/90">
            <Brain className="h-3 w-3 mr-1" />
            AI Training
          </Badge>
        )}
      </div>

      <CardContent className="py-4 flex-1">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="flex items-center gap-1 capitalize">
            {getMediaIcon()}
            {listing.mediaType}
          </Badge>
          <Badge variant="secondary" className="capitalize">
            {listing.licenseType.replace("-", " ")}
          </Badge>
        </div>

        <h3 className="font-medium line-clamp-2 mb-1 leading-tight">{listing.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {listing.description}
        </p>

        <div className="flex items-center text-sm text-muted-foreground">
          <span className="flex items-center">
            <Star className="h-3 w-3 mr-1 fill-current text-amber-500" />
            {listing.seller.rating}
          </span>
          <span className="mx-2">•</span>
          <span className="truncate">{listing.seller.name}</span>
          {listing.seller.verified && (
            <Badge variant="outline" className="ml-1 h-5 px-1">
              <Check className="h-3 w-3" />
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t pt-4 flex justify-between items-center">
        <div className="font-medium">
          ${listing.price.toLocaleString()}
          <span className="text-xs text-muted-foreground ml-1">
            {listing.currency}
          </span>
        </div>

        <Button size="sm">View Details</Button>
      </CardFooter>
    </Card>
  );
}
