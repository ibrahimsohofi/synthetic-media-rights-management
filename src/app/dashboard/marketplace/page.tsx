import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Filter,
  Image,
  FileText,
  Music,
  Video,
  DollarSign,
  PlusCircle,
  Users,
  Calendar,
  ShoppingCart,
  Heart,
  Bookmark,
  LayoutGrid,
  List,
  Tag,
  Clock,
  TrendingUp,
  Star,
  Copy
} from "lucide-react";
import Link from "next/link";

export default function MarketplacePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
            <p className="text-muted-foreground">
              Monetize your creative works and discover licensing opportunities.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/dashboard/marketplace/listings">
                <Tag className="h-4 w-4" /> My Listings
              </Link>
            </Button>
            <Button className="gap-2" asChild>
              <Link href="/dashboard/marketplace/create">
                <PlusCircle className="h-4 w-4" /> Create Listing
              </Link>
            </Button>
          </div>
        </div>

        {/* Marketplace Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">16</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30">
                  Live
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                +3 new in the last 30 days
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">$5,280</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30">
                  All time
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                +$780 in the last 30 days
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Interest Received</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">24</span>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30">
                  New inquiries
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                8 pending responses
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Marketplace Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">Top 5%</span>
                <Badge variant="outline">
                  Creator tier
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Based on sales and engagement
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Marketplace Tabs */}
        <Tabs defaultValue="discover" className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="discover" className="gap-2">
                <Search className="h-4 w-4" /> Discover
              </TabsTrigger>
              <TabsTrigger value="trending" className="gap-2">
                <TrendingUp className="h-4 w-4" /> Trending
              </TabsTrigger>
              <TabsTrigger value="saved" className="gap-2">
                <Bookmark className="h-4 w-4" /> Saved
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <Clock className="h-4 w-4" /> History
              </TabsTrigger>
            </TabsList>

            {/* View Options */}
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for creative works..."
                className="pl-8 w-full"
              />
            </div>
            <div className="flex gap-3">
              <Select>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="image">Images & Illustrations</SelectItem>
                  <SelectItem value="video">Videos & Animations</SelectItem>
                  <SelectItem value="audio">Music & Sound</SelectItem>
                  <SelectItem value="text">Text & Writing</SelectItem>
                  <SelectItem value="3d">3D Models</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" /> Filters
              </Button>
            </div>
          </div>

          <TabsContent value="discover">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Featured Listings</CardTitle>
                <CardDescription>
                  Curated opportunities for licensing creative works in various categories.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {marketplaceListings.map((listing) => (
                    <MarketplaceItem key={listing.id} listing={listing} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-end space-x-2 mt-8">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" className="px-4 hover:bg-violet-50 dark:hover:bg-violet-900/20">
                    1
                  </Button>
                  <Button variant="outline" size="sm" className="px-4">
                    2
                  </Button>
                  <Button variant="outline" size="sm" className="px-4">
                    3
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trending">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Trending Now</CardTitle>
                <CardDescription>
                  Popular and high-demand creative works gaining attention in the marketplace.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8">
                  <div className="text-center space-y-3">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto" />
                    <h3 className="text-lg font-medium">Trending Content</h3>
                    <p className="text-muted-foreground max-w-md">
                      This tab would display trending creative works based on views, saves, and licensing
                      activity in the marketplace, helping creators discover what's in demand.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Saved Items</CardTitle>
                <CardDescription>
                  Creative works you've bookmarked for future reference or licensing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8">
                  <div className="text-center space-y-3">
                    <Bookmark className="h-12 w-12 text-muted-foreground mx-auto" />
                    <h3 className="text-lg font-medium">Saved Listings</h3>
                    <p className="text-muted-foreground max-w-md">
                      This tab would display creative works that you've saved for later,
                      allowing you to track and compare potential licensing opportunities.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Browsing History</CardTitle>
                <CardDescription>
                  Recent creative works you've viewed in the marketplace.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8">
                  <div className="text-center space-y-3">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
                    <h3 className="text-lg font-medium">Browsing History</h3>
                    <p className="text-muted-foreground max-w-md">
                      This tab would display your recent browsing history, making it easy to
                      return to creative works you've previously viewed but didn't save.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Featured Collections */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Curated Collections</CardTitle>
            <CardDescription>
              Themed collections of creative works curated by our team and top creators.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className="group relative aspect-[1.5/1] rounded-lg overflow-hidden cursor-pointer border border-border/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center group-hover:opacity-80 transition-opacity">
                    {collection.icon}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                    <h3 className="text-white font-semibold">{collection.title}</h3>
                    <p className="text-white/80 text-sm">{collection.count} works</p>
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

// Marketplace Item Component
function MarketplaceItem({ listing }: { listing: MarketplaceListing }) {
  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      {/* Preview Area */}
      <div className="aspect-video relative bg-muted flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center">
          {listing.type === 'image' && <Image className="h-10 w-10 text-violet-600/40" />}
          {listing.type === 'video' && <Video className="h-10 w-10 text-red-600/40" />}
          {listing.type === 'audio' && <Music className="h-10 w-10 text-blue-600/40" />}
          {listing.type === 'text' && <FileText className="h-10 w-10 text-green-600/40" />}
        </div>

        <div className="absolute top-2 right-2 flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 bg-black/40 text-white hover:bg-black/60 hover:text-white">
            <Heart className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 bg-black/40 text-white hover:bg-black/60 hover:text-white">
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>

        <div className="absolute bottom-2 left-2">
          <Badge
            variant="outline"
            className="bg-black/70 text-white border-transparent text-xs"
          >
            {listing.licenseType}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-sm line-clamp-1">{listing.title}</h3>
            <p className="text-xs text-muted-foreground">{listing.creator}</p>
          </div>
          <Badge
            variant="outline"
            className={`
              ${listing.type === 'image' ? 'bg-violet-100 text-violet-700 border-violet-200' : ''}
              ${listing.type === 'video' ? 'bg-red-100 text-red-700 border-red-200' : ''}
              ${listing.type === 'audio' ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
              ${listing.type === 'text' ? 'bg-green-100 text-green-700 border-green-200' : ''}
              dark:bg-opacity-20
            `}
          >
            {listing.type.charAt(0).toUpperCase() + listing.type.slice(1)}
          </Badge>
        </div>

        <div className="flex items-center mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 mr-3">
            <Calendar className="h-3 w-3" />
            <span>{listing.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{listing.usage}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-1">
            <DollarSign className="h-5 w-5 text-violet-600" />
            <span className="font-semibold">{listing.price}</span>
          </div>
          <Button size="sm" className="gap-1">
            <Copy className="h-3.5 w-3.5" />
            <span>License</span>
          </Button>
        </div>

        <div className="flex items-center gap-1 mt-2">
          <Star className="h-3.5 w-3.5 text-amber-500 fill-current" />
          <Star className="h-3.5 w-3.5 text-amber-500 fill-current" />
          <Star className="h-3.5 w-3.5 text-amber-500 fill-current" />
          <Star className="h-3.5 w-3.5 text-amber-500 fill-current" />
          <Star className="h-3.5 w-3.5 text-amber-200 fill-current" />
          <span className="text-xs text-muted-foreground ml-1">(24)</span>
        </div>
      </div>
    </div>
  );
}

// Sample data
interface MarketplaceListing {
  id: string;
  title: string;
  creator: string;
  type: 'image' | 'video' | 'audio' | 'text';
  licenseType: string;
  duration: string;
  usage: string;
  price: string;
}

const marketplaceListings: MarketplaceListing[] = [
  {
    id: '1',
    title: 'Futuristic Character Design Series',
    creator: 'Sarah Johnson',
    type: 'image',
    licenseType: 'Commercial License',
    duration: '1-2 years',
    usage: 'Digital & Print',
    price: '$1,200'
  },
  {
    id: '2',
    title: 'Urban Landscape Photography Collection',
    creator: 'Michael Chen',
    type: 'image',
    licenseType: 'Exclusive Rights',
    duration: '3 years',
    usage: 'All Media',
    price: '$3,500'
  },
  {
    id: '3',
    title: 'Ambient Electronic Music Pack',
    creator: 'Elena Rodriguez',
    type: 'audio',
    licenseType: 'Non-Exclusive',
    duration: '1 year',
    usage: 'Digital Only',
    price: '$750'
  },
  {
    id: '4',
    title: 'Corporate Video Background Templates',
    creator: 'David Washington',
    type: 'video',
    licenseType: 'Limited License',
    duration: '6 months',
    usage: 'Single Project',
    price: '$450'
  },
  {
    id: '5',
    title: 'Sci-Fi Novel Series - Complete Rights',
    creator: 'Priya Patel',
    type: 'text',
    licenseType: 'Full Rights Transfer',
    duration: 'Permanent',
    usage: 'All Media Types',
    price: '$5,800'
  },
  {
    id: '6',
    title: 'Voice Narration for Commercials',
    creator: 'Thomas Müller',
    type: 'audio',
    licenseType: 'Commercial',
    duration: '1 year',
    usage: 'Broadcast & Digital',
    price: '$950'
  }
];

interface Collection {
  id: string;
  title: string;
  count: number;
  icon: React.ReactNode;
}

const collections: Collection[] = [
  {
    id: 'gaming',
    title: 'Gaming & Metaverse Assets',
    count: 156,
    icon: <Image className="h-16 w-16 text-white/30" />
  },
  {
    id: 'ai-training',
    title: 'AI Training Datasets',
    count: 89,
    icon: <FileText className="h-16 w-16 text-white/30" />
  },
  {
    id: 'music',
    title: 'Royalty-Free Music',
    count: 214,
    icon: <Music className="h-16 w-16 text-white/30" />
  },
];
