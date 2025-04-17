"use client";

import { useState } from "react";
import { ShieldCheck, Plus, LayoutGrid, List, Filter, SlidersHorizontal, MoreVertical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

// Mock certificate data
const mockCertificates = [
  {
    id: "cert-1681234567-abc123",
    title: "Forest Landscape",
    type: "IMAGE",
    certificateType: "premium",
    thumbnail: "https://picsum.photos/id/10/300/200",
    registeredAt: "2025-03-15T10:30:00Z",
    blockchainVerified: true,
    owner: "John Davis"
  },
  {
    id: "cert-1681298765-def456",
    title: "Ocean Waves Sound",
    type: "AUDIO",
    certificateType: "standard",
    thumbnail: null,
    registeredAt: "2025-03-12T14:22:00Z",
    blockchainVerified: true,
    owner: "John Davis"
  },
  {
    id: "cert-1681345678-ghi789",
    title: "City Time-lapse",
    type: "VIDEO",
    certificateType: "premium",
    thumbnail: "https://picsum.photos/id/28/300/200",
    registeredAt: "2025-03-10T09:15:00Z",
    blockchainVerified: true,
    owner: "John Davis"
  },
  {
    id: "cert-1681387654-jkl012",
    title: "Short Story Collection",
    type: "TEXT",
    certificateType: "standard",
    thumbnail: null,
    registeredAt: "2025-03-05T16:40:00Z",
    blockchainVerified: false,
    owner: "John Davis"
  },
  {
    id: "cert-1681429876-mno345",
    title: "Mountain Sunset",
    type: "IMAGE",
    certificateType: "standard",
    thumbnail: "https://picsum.photos/id/29/300/200",
    registeredAt: "2025-03-01T11:20:00Z",
    blockchainVerified: true,
    owner: "John Davis"
  }
];

export default function CertificatesPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState("");
  const [certificates, setCertificates] = useState(mockCertificates);
  const [loading, setLoading] = useState(false);

  const filteredCertificates = certificates.filter(cert =>
    cert.title.toLowerCase().includes(filter.toLowerCase()) ||
    cert.certificateType.toLowerCase().includes(filter.toLowerCase()) ||
    cert.type.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/rights-registry">Rights Registry</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink>Certificates</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <h1 className="text-2xl font-bold mt-2">Certificates</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your certificates of authenticity
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            placeholder="Search certificates..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-auto min-w-[200px]"
          />
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <div className="flex items-center rounded-md border p-1 h-10">
            <TabsList className="grid grid-cols-2 h-8">
              <TabsTrigger
                value="grid"
                onClick={() => setView("grid")}
                className={view === "grid" ? "bg-background" : ""}
                data-state={view === "grid" ? "active" : ""}
              >
                <LayoutGrid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger
                value="list"
                onClick={() => setView("list")}
                className={view === "list" ? "bg-background" : ""}
                data-state={view === "list" ? "active" : ""}
              >
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/dashboard/rights-registry/certificates/batch">
              <ShieldCheck className="h-4 w-4" />
              Batch Generate
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/rights-registry/register">
              <Plus className="h-4 w-4 mr-2" />
              Register New Work
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading certificates...</p>
        </div>
      ) : filteredCertificates.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg border">
          <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-medium text-lg mb-1">No certificates found</h3>
          <p className="text-muted-foreground mb-6">You haven't registered any certificates yet or none match your filter.</p>
          <Button asChild>
            <Link href="/dashboard/rights-registry/register">
              <Plus className="h-4 w-4 mr-2" />
              Register a work
            </Link>
          </Button>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map(certificate => (
            <Card key={certificate.id} className="overflow-hidden">
              <div className="relative aspect-video bg-muted">
                {certificate.thumbnail ? (
                  <img
                    src={certificate.thumbnail}
                    alt={certificate.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Badge variant="outline" className="text-xs">
                      {certificate.type}
                    </Badge>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-7 w-7 bg-background/80 backdrop-blur-sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuItem>
                          <Link href={`/dashboard/rights-registry/${certificate.id}`} className="w-full">
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href={`/dashboard/rights-registry/${certificate.id}/certificate`} className="w-full">
                            View Certificate
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Download Certificate</DropdownMenuItem>
                      <DropdownMenuItem>Share Certificate</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base truncate">
                  <Link href={`/dashboard/rights-registry/${certificate.id}`}>
                    {certificate.title}
                  </Link>
                </CardTitle>
                <CardDescription>
                  {new Date(certificate.registeredAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <Badge variant={certificate.certificateType === "premium" ? "default" : "secondary"}>
                  {certificate.certificateType}
                </Badge>
                {certificate.blockchainVerified && (
                  <Badge variant="outline" className="text-xs">Blockchain Verified</Badge>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-2 px-4 font-medium text-sm">Certificate</th>
                <th className="text-left py-2 px-4 font-medium text-sm hidden sm:table-cell">Type</th>
                <th className="text-left py-2 px-4 font-medium text-sm hidden md:table-cell">Registration Date</th>
                <th className="text-left py-2 px-4 font-medium text-sm hidden md:table-cell">Status</th>
                <th className="py-2 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCertificates.map(certificate => (
                <tr key={certificate.id} className="hover:bg-muted/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-muted rounded overflow-hidden flex-shrink-0">
                        {certificate.thumbnail ? (
                          <img
                            src={certificate.thumbnail}
                            alt={certificate.title}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xs">{certificate.type.substring(0, 1)}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <Link href={`/dashboard/rights-registry/${certificate.id}`} className="font-medium hover:underline">
                          {certificate.title}
                        </Link>
                        <div className="text-xs text-muted-foreground sm:hidden">{certificate.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <Badge variant="outline">{certificate.type}</Badge>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell text-sm text-muted-foreground">
                    {new Date(certificate.registeredAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <Badge variant={certificate.certificateType === "premium" ? "default" : "secondary"}>
                      {certificate.certificateType}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuItem>
                            <Link href={`/dashboard/rights-registry/${certificate.id}`} className="w-full">
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href={`/dashboard/rights-registry/${certificate.id}/certificate`} className="w-full">
                              View Certificate
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Download Certificate</DropdownMenuItem>
                        <DropdownMenuItem>Share Certificate</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
