"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  Clock,
  Info,
  Download,
  ExternalLink
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default function BatchVerificationPage() {
  const searchParams = useSearchParams();
  const [hashes, setHashes] = useState<string[]>([]);
  const [verificationResults, setVerificationResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    total: 0,
    verified: 0,
    notVerified: 0,
    pending: 0
  });

  useEffect(() => {
    const hashesParam = searchParams.get('hashes');
    if (!hashesParam) {
      setError("No certificate hashes provided");
      setIsLoading(false);
      return;
    }

    try {
      const parsedHashes = JSON.parse(decodeURIComponent(hashesParam)) as string[];
      setHashes(parsedHashes);

      // Initialize verification results
      setVerificationResults(
        parsedHashes.map(hash => ({
          hash,
          status: 'pending',
          message: 'Verification in progress...'
        }))
      );

      setSummary({
        total: parsedHashes.length,
        verified: 0,
        notVerified: 0,
        pending: parsedHashes.length
      });

      verifyBatchHashes(parsedHashes);
    } catch (err) {
      console.error("Error parsing hashes:", err);
      setError("Invalid hash format. Please try again.");
      setIsLoading(false);
    }
  }, [searchParams]);

  const verifyBatchHashes = async (hashesToVerify: string[]) => {
    setIsLoading(true);

    // Create a copy of the verification results to update
    const updatedResults = [...verificationResults];
    let verifiedCount = 0;
    let notVerifiedCount = 0;

    // Process each hash
    for (let i = 0; i < hashesToVerify.length; i++) {
      const hash = hashesToVerify[i];

      try {
        // In a real implementation, this would be an API call
        // For demo purposes, we'll simulate API responses
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

        // Simulate API response (randomize some failures)
        const isVerified = Math.random() > 0.3; // 70% chance of success

        if (isVerified) {
          updatedResults[i] = {
            hash,
            status: 'verified',
            message: 'Certificate verified successfully',
            certificate: {
              id: `cert-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
              certificateType: Math.random() > 0.5 ? "premium" : "standard",
              createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date in last 90 days
              work: {
                title: `Creative Work ${i + 1}`,
                type: ["IMAGE", "VIDEO", "AUDIO", "TEXT"][Math.floor(Math.random() * 4)],
                ownerName: "Digital Creator"
              },
              blockchain: {
                transactionId: `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
                networkName: "Polygon"
              }
            }
          };
          verifiedCount++;
        } else {
          updatedResults[i] = {
            hash,
            status: 'not-verified',
            message: 'Certificate could not be verified',
            error: 'Certificate not found in registry'
          };
          notVerifiedCount++;
        }

        // Update the results as we go for a better UX
        setVerificationResults([...updatedResults]);
        setSummary({
          total: hashesToVerify.length,
          verified: verifiedCount,
          notVerified: notVerifiedCount,
          pending: hashesToVerify.length - (verifiedCount + notVerifiedCount)
        });
      } catch (err) {
        console.error(`Error verifying hash ${hash}:`, err);
        updatedResults[i] = {
          hash,
          status: 'error',
          message: 'Error during verification',
          error: err instanceof Error ? err.message : 'Unknown error'
        };
        notVerifiedCount++;

        setVerificationResults([...updatedResults]);
        setSummary({
          total: hashesToVerify.length,
          verified: verifiedCount,
          notVerified: notVerifiedCount,
          pending: hashesToVerify.length - (verifiedCount + notVerifiedCount)
        });
      }
    }

    setIsLoading(false);
  };

  // Helper functions
  const truncateHash = (hash: string) => {
    if (!hash) return "";
    return hash.length > 16 ? `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}` : hash;
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "N/A";
    return format(new Date(date), "PPP");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Verified</span>
          </Badge>
        );
      case 'not-verified':
      case 'error':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3.5 w-3.5" />
            <span>Not Verified</span>
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <span className="animate-spin h-3.5 w-3.5">⟳</span>
            <span>Pending</span>
          </Badge>
        );
    }
  };

  // Generate a report for download
  const generateReport = () => {
    const reportData = verificationResults.map(result => ({
      Hash: result.hash,
      Status: result.status,
      Message: result.message,
      Title: result.certificate?.work?.title || 'N/A',
      Type: result.certificate?.work?.type || 'N/A',
      Owner: result.certificate?.work?.ownerName || 'N/A',
      CertificateType: result.certificate?.certificateType || 'N/A',
      CreatedAt: result.certificate?.createdAt ? formatDate(result.certificate.createdAt) : 'N/A',
      BlockchainNetwork: result.certificate?.blockchain?.networkName || 'N/A'
    }));

    const headers = Object.keys(reportData[0] || {}).join(',');
    const rows = reportData.map(row =>
      Object.values(row).map(value =>
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-verification-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="container max-w-screen-lg mx-auto py-12 px-4">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" asChild className="mr-4">
            <Link href="/verify">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Verification
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Batch Certificate Verification</h1>
        </div>

        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>

        <Button asChild>
          <Link href="/verify">Try Again</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-screen-lg mx-auto py-12 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center">
          <Button variant="outline" size="sm" asChild className="mr-4">
            <Link href="/verify">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Verification
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Batch Certificate Verification</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generateReport}
            disabled={isLoading || summary.pending > 0}
            className="gap-1"
          >
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Verification Summary</CardTitle>
          <CardDescription>
            Verifying {summary.total} certificates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-3 bg-muted/30 rounded-md">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-bold">{summary.total}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md">
              <span className="text-sm">Verified</span>
              <span className="text-2xl font-bold">{summary.verified}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md">
              <span className="text-sm">Not Verified</span>
              <span className="text-2xl font-bold">{summary.notVerified}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-md">
              <span className="text-sm">Pending</span>
              <span className="text-2xl font-bold">{summary.pending}</span>
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center mt-6 gap-2 text-muted-foreground">
              <span className="animate-spin">⟳</span>
              <span>Verification in progress...</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verification Results</CardTitle>
          <CardDescription>
            Results for all certificates in the batch
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Status</TableHead>
                <TableHead>Certificate Hash/ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Creation Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {verificationResults.map((result, index) => (
                <TableRow key={index}>
                  <TableCell>{getStatusBadge(result.status)}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {truncateHash(result.hash)}
                  </TableCell>
                  <TableCell>
                    {result.certificate?.certificateType ? (
                      <Badge variant="outline" className="capitalize">
                        {result.certificate.certificateType}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {result.certificate?.createdAt ? (
                      formatDate(result.certificate.createdAt)
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {result.status === 'verified' ? (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/verify/${result.hash}`}>
                          <Info className="h-4 w-4 mr-2" />
                          Details
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={result.status === 'pending'}
                      >
                        <Info className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="border-t p-6 bg-muted/30 flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/verify">
              Verify Another Batch
            </Link>
          </Button>
          <Button
            onClick={generateReport}
            disabled={isLoading || summary.pending > 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
