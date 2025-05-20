'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { DetectionScan } from '@prisma/client';

const FINGERPRINT_TYPES = [
  { value: 'perceptual_hash', label: 'Perceptual Hash' },
  { value: 'wavelet_transform', label: 'Wavelet Transform' },
  { value: 'deep_features', label: 'Deep Features' },
];

const SCAN_TYPES = [
  { value: 'web', label: 'Web Search' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'marketplace', label: 'Marketplace' },
];

export function ContentScanner() {
  const [targetUrl, setTargetUrl] = useState('');
  const [scanType, setScanType] = useState('');
  const [selectedFingerprints, setSelectedFingerprints] = useState<string[]>([]);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scan, setScan] = useState<DetectionScan | null>(null);

  const handleScan = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/scanning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUrl,
          scanType,
          fingerprintTypes: selectedFingerprints,
          similarityThreshold,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to initiate scan');
      }

      const result = await response.json();
      setScan(result);

      // Start polling for scan status
      if (result.id) {
        pollScanStatus(result.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const pollScanStatus = async (scanId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/scanning/${scanId}`);
        const result = await response.json();

        setScan(result);

        if (result.status === 'COMPLETED' || result.status === 'FAILED') {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error polling scan status:', error);
      }
    }, 5000); // Poll every 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Content Scanner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Target URL</label>
            <Input
              placeholder="Enter URL to scan"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Scan Type</label>
            <Select value={scanType} onValueChange={setScanType}>
              <SelectTrigger>
                <SelectValue placeholder="Select scan type" />
              </SelectTrigger>
              <SelectContent>
                {SCAN_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Fingerprint Types</label>
            <div className="flex flex-wrap gap-2">
              {FINGERPRINT_TYPES.map((type) => (
                <Button
                  key={type.value}
                  variant={selectedFingerprints.includes(type.value) ? "default" : "outline"}
                  onClick={() => {
                    setSelectedFingerprints((prev) =>
                      prev.includes(type.value)
                        ? prev.filter((t) => t !== type.value)
                        : [...prev, type.value]
                    );
                  }}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Similarity Threshold: {(similarityThreshold * 100).toFixed(0)}%
            </label>
            <Slider
              value={[similarityThreshold]}
              onValueChange={(values) => setSimilarityThreshold(values[0])}
              min={0}
              max={1}
              step={0.05}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full"
            onClick={handleScan}
            disabled={loading || !targetUrl || !scanType || selectedFingerprints.length === 0}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Scanning...' : 'Start Scan'}
          </Button>
        </CardContent>
      </Card>

      {scan && (
        <Card>
          <CardHeader>
            <CardTitle>Scan Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Status: </span>
                {scan.status}
              </div>
              {scan.status === 'COMPLETED' && (
                <div>
                  <span className="font-medium">Results: </span>
                  {scan.resultsCount} matches found
                </div>
              )}
              {scan.status === 'IN_PROGRESS' && (
                <div>
                  <span className="font-medium">Progress: </span>
                  {Math.round(scan.progress * 100)}%
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 