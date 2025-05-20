import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const scanFormSchema = z.object({
  targetUrl: z.string().url("Please enter a valid URL"),
  scanType: z.string(),
  matchThreshold: z.number().min(0).max(1),
  scanDepth: z.number().int().positive(),
});

type ScanFormData = z.infer<typeof scanFormSchema>;

interface ContentScannerProps {
  creativeWorkIds: string[];
  onScanComplete?: (scanId: string) => void;
}

export function ContentScanner({ creativeWorkIds, onScanComplete }: ContentScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const form = useForm<ScanFormData>({
    resolver: zodResolver(scanFormSchema),
    defaultValues: {
      scanType: "web",
      matchThreshold: 0.8,
      scanDepth: 1,
    },
  });

  const startScan = async (data: ScanFormData) => {
    try {
      setIsScanning(true);
      setProgress(0);

      const response = await fetch("/api/detection/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          creativeWorkIds,
          config: {
            fingerprintTypes: ["perceptual_hash", "deep_features"],
            matchThreshold: data.matchThreshold,
            scanDepth: data.scanDepth,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to initiate scan");
      }

      const result = await response.json();
      
      // Start polling for scan progress
      const pollInterval = setInterval(async () => {
        const statusResponse = await fetch(`/api/detection/scan/${result.scanId}`);
        const statusData = await statusResponse.json();

        setProgress(statusData.progress);

        if (["COMPLETED", "FAILED"].includes(statusData.status)) {
          clearInterval(pollInterval);
          setIsScanning(false);
          
          if (statusData.status === "COMPLETED") {
            toast.success("Scan completed successfully");
            onScanComplete?.(result.scanId);
          } else {
            toast.error("Scan failed");
          }
        }
      }, 2000);

    } catch (error) {
      console.error("Scan error:", error);
      toast.error("Failed to start scan");
      setIsScanning(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={form.handleSubmit(startScan)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="targetUrl">Target URL</Label>
          <Input
            id="targetUrl"
            type="url"
            placeholder="https://example.com"
            {...form.register("targetUrl")}
          />
          {form.formState.errors.targetUrl && (
            <p className="text-sm text-red-500">
              {form.formState.errors.targetUrl.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="scanType">Scan Type</Label>
          <select
            id="scanType"
            className="w-full p-2 border rounded"
            {...form.register("scanType")}
          >
            <option value="web">Web Page</option>
            <option value="social_media">Social Media</option>
            <option value="marketplace">Marketplace</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="matchThreshold">
            Match Threshold: {form.watch("matchThreshold")}
          </Label>
          <Slider
            id="matchThreshold"
            min={0}
            max={1}
            step={0.1}
            value={[form.watch("matchThreshold")]}
            onValueChange={([value]) => form.setValue("matchThreshold", value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="scanDepth">Scan Depth</Label>
          <Input
            id="scanDepth"
            type="number"
            min={1}
            max={10}
            {...form.register("scanDepth", { valueAsNumber: true })}
          />
        </div>

        {isScanning && (
          <div className="space-y-2">
            <Label>Scan Progress</Label>
            <Progress value={progress} />
          </div>
        )}

        <Button
          type="submit"
          disabled={isScanning}
          className="w-full"
        >
          {isScanning ? "Scanning..." : "Start Scan"}
        </Button>
      </form>
    </Card>
  );
} 