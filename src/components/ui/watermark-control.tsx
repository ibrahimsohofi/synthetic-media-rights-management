"use client";

import { useState } from "react";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { Label } from "./label";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Checkbox } from "./checkbox";
import { Slider } from "./slider";
import type { WatermarkOptions } from "@/lib/watermarking-utils";
import type { WorkType } from "@prisma/client";
import { Loader2, Fingerprint, Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import { Badge } from "./badge";
import { Progress } from "./progress";

interface WatermarkControlProps {
  workId: string;
  workType: WorkType;
  workTitle?: string;
  ownerId: string;
  ownerName?: string;
  onWatermarkApplied?: (result: { success: boolean; message: string }) => void;
}

export function WatermarkControl({
  workId,
  workType,
  workTitle = "Untitled Work",
  ownerId,
  ownerName,
  onWatermarkApplied
}: WatermarkControlProps) {
  // Watermark configuration state
  const [watermarkType, setWatermarkType] = useState<'visible' | 'invisible' | 'dual'>('invisible');
  const [opacity, setOpacity] = useState(30); // 0-100 for slider
  const [position, setPosition] = useState<WatermarkOptions['position']>('bottom-right');
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  const [includeGps, setIncludeGps] = useState(false);
  const [robustness, setRobustness] = useState<WatermarkOptions['robustness']>('medium');

  // Processing state
  const [isApplying, setIsApplying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Helper for position selection
  const positionOptions: Array<{ value: WatermarkOptions['position']; label: string }> = [
    { value: 'center', label: 'Center' },
    { value: 'bottom-right', label: 'Bottom Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'top-left', label: 'Top Left' },
    { value: 'tiled', label: 'Tiled' },
  ];

  // Helper for robustness selection
  const robustnessOptions: Array<{ value: WatermarkOptions['robustness']; label: string; description: string }> = [
    {
      value: 'low',
      label: 'Low',
      description: 'Basic protection, less noticeable but easier to remove'
    },
    {
      value: 'medium',
      label: 'Medium',
      description: 'Balanced protection and visibility'
    },
    {
      value: 'high',
      label: 'High',
      description: 'Strong protection, may affect quality slightly'
    },
  ];

  // Generate watermark options based on form state
  const getWatermarkOptions = (): WatermarkOptions => {
    return {
      ownerId,
      ownerName,
      workId,
      workTitle,
      visibility: watermarkType,
      opacity: opacity / 100, // Convert to 0.0-1.0 range
      position,
      robustness,
      includeTimestamp,
      includeGps,
      creationDate: new Date(),
    };
  };

  // Simulate applying watermark
  const applyWatermark = async () => {
    // Reset any previous results
    setResult(null);
    setIsApplying(true);
    setProgress(0);

    // Get options
    const options = getWatermarkOptions();

    // Simulate a watermarking process with progress updates
    const totalSteps = 5;
    for (let step = 1; step <= totalSteps; step++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setProgress(Math.floor((step / totalSteps) * 100));
    }

    // Simulate success
    const success = Math.random() > 0.1; // 90% success rate for demo
    const result = {
      success,
      message: success
        ? `Successfully applied ${watermarkType} watermark to the ${workType.toLowerCase()}`
        : `Failed to apply watermark. Please try again.`
    };

    setResult(result);
    setIsApplying(false);

    // Notify parent component if callback is provided
    if (onWatermarkApplied) {
      onWatermarkApplied(result);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5 text-violet-600" />
          <span>Watermark Protection</span>
        </CardTitle>
        <CardDescription>
          Add invisible or visible watermarks to track your content across platforms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Watermark Type Selection */}
        <div className="space-y-3">
          <Label>Watermark Type</Label>
          <RadioGroup
            value={watermarkType}
            onValueChange={(value) => setWatermarkType(value as 'visible' | 'invisible' | 'dual')}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="invisible" id="invisible" />
              <Label htmlFor="invisible" className="flex items-center gap-1.5 cursor-pointer">
                <EyeOff className="h-4 w-4 text-muted-foreground" />
                <span>Invisible</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  Recommended
                </Badge>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="visible" id="visible" />
              <Label htmlFor="visible" className="flex items-center gap-1.5 cursor-pointer">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span>Visible</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dual" id="dual" />
              <Label htmlFor="dual" className="flex items-center gap-1.5 cursor-pointer">
                <Fingerprint className="h-4 w-4 text-muted-foreground" />
                <span>Both (Dual Protection)</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Visible Watermark Options */}
        {(watermarkType === 'visible' || watermarkType === 'dual') && (
          <div className="space-y-6 p-4 border rounded-md bg-muted/30">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label htmlFor="opacity">Opacity: {opacity}%</Label>
              </div>
              <Slider
                id="opacity"
                min={5}
                max={100}
                step={5}
                value={[opacity]}
                onValueChange={(values) => setOpacity(values[0])}
              />
            </div>

            <div className="space-y-3">
              <Label>Position</Label>
              <div className="grid grid-cols-3 gap-2">
                {positionOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={position === option.value ? "default" : "outline"}
                    className="h-auto py-1.5 text-xs"
                    onClick={() => setPosition(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Advanced Options */}
        <div className="space-y-3">
          <Label>Advanced Options</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="timestamp"
                checked={includeTimestamp}
                onCheckedChange={(checked) => setIncludeTimestamp(!!checked)}
              />
              <Label htmlFor="timestamp" className="cursor-pointer">Include timestamp</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="gps"
                checked={includeGps}
                onCheckedChange={(checked) => setIncludeGps(!!checked)}
              />
              <Label htmlFor="gps" className="cursor-pointer">Include GPS data (if available)</Label>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <Label>Protection Strength</Label>
            <RadioGroup
              value={robustness}
              onValueChange={(value) => setRobustness(value as WatermarkOptions['robustness'])}
              className="flex flex-col space-y-2"
            >
              {robustnessOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`robustness-${option.value}`} />
                  <Label
                    htmlFor={`robustness-${option.value}`}
                    className="flex flex-col cursor-pointer"
                  >
                    <span>{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        {/* Watermark Preview */}
        <div className="p-4 border rounded-md bg-muted/30">
          <Label className="mb-2 block">Watermark Preview</Label>
          <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-md flex items-center justify-center relative">
            <div className="text-sm text-muted-foreground">Preview not available</div>

            {/* Watermark Preview Overlay (only for visible watermarks) */}
            {(watermarkType === 'visible' || watermarkType === 'dual') && (
              <div
                className={`absolute rounded px-1.5 py-0.5 bg-background/80 text-foreground text-xs flex items-center gap-1 ${
                  position === 'center' ? 'inset-0 flex items-center justify-center' :
                  position === 'bottom-right' ? 'bottom-2 right-2' :
                  position === 'bottom-left' ? 'bottom-2 left-2' :
                  position === 'top-right' ? 'top-2 right-2' :
                  position === 'top-left' ? 'top-2 left-2' :
                  'inset-0 grid grid-cols-3 grid-rows-3 place-items-center opacity-70'
                }`}
                style={{ opacity: opacity / 100 }}
              >
                {position !== 'tiled' ? (
                  <>
                    <Fingerprint className="h-3 w-3" />
                    <span>{ownerName || 'Author'}</span>
                  </>
                ) : (
                  <div className="w-full h-full grid grid-cols-3 grid-rows-3 place-items-center">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <Fingerprint className="h-3 w-3" />
                        <span className="text-[10px]">{ownerName || 'Author'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {watermarkType === 'invisible'
              ? 'Invisible watermarks are not visually apparent but can be detected with special tools'
              : watermarkType === 'visible'
              ? 'Visible watermarks display your ownership information directly on the media'
              : 'Dual protection combines visible and invisible watermarks for maximum security'}
          </p>
        </div>

        {/* Watermark Status/Results */}
        {isApplying && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Applying watermark...</Label>
              <span className="text-sm">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {result && (
          <div className={`p-4 border rounded-md ${
            result.success
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/30'
              : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800/30'
          }`}>
            <div className="flex items-start gap-2">
              {result.success
                ? <Check className="h-5 w-5 text-green-600 shrink-0" />
                : <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
              }
              <div>
                <p className={`font-medium ${
                  result.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                }`}>
                  {result.success ? 'Watermark Applied' : 'Watermark Failed'}
                </p>
                <p className="text-sm mt-1">
                  {result.message}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={applyWatermark}
          disabled={isApplying}
          className="gap-2"
        >
          {isApplying
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Fingerprint className="h-4 w-4" />
          }
          {isApplying ? 'Applying...' : 'Apply Watermark'}
        </Button>
      </CardFooter>
    </Card>
  );
}
