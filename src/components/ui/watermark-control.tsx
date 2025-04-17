"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Check, Fingerprint, Eye, EyeOff, FileWarning, SlidersHorizontal, Info, Shield, FileCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface WatermarkControlProps {
  fileType: "image" | "video" | "audio" | "document" | string;
  onWatermarkChange: (settings: WatermarkSettings) => void;
  initialSettings?: Partial<WatermarkSettings>;
  previewUrl?: string;
  showPreview?: boolean;
  disabled?: boolean;
}

export interface WatermarkSettings {
  enabled: boolean;
  type: 'visible' | 'invisible' | 'both';
  strength: number;
  position: 'topLeft' | 'topRight' | 'center' | 'bottomLeft' | 'bottomRight' | 'custom';
  customText?: string;
  includeOwnerInfo: boolean;
  includeDatetime: boolean;
  includeId: boolean;
  fingerprinting: boolean;
  opacity: number;
  visibleType: 'text' | 'logo' | 'qrCode';
}

/**
 * Watermark Control Component for adding visible and invisible watermarks to content
 */
export function WatermarkControl({
  fileType,
  onWatermarkChange,
  initialSettings,
  previewUrl,
  showPreview = false,
  disabled = false
}: WatermarkControlProps) {
  // Default settings based on file type
  const getDefaultSettings = () => {
    const baseSettings: WatermarkSettings = {
      enabled: true,
      type: 'invisible',
      strength: 70,
      position: 'bottomRight',
      customText: '© Protected Content',
      includeOwnerInfo: true,
      includeDatetime: true,
      includeId: true,
      fingerprinting: true,
      opacity: 30,
      visibleType: 'text'
    };

    // Customize defaults based on file type
    switch (fileType) {
      case 'image':
        return { ...baseSettings, type: 'both', strength: 60 };
      case 'video':
        return { ...baseSettings, type: 'both', strength: 50 };
      case 'audio':
        return { ...baseSettings, type: 'invisible', strength: 80 };
      case 'document':
        return { ...baseSettings, type: 'invisible', includeOwnerInfo: true };
      default:
        return baseSettings;
    }
  };

  const defaultSettings = getDefaultSettings();
  const [settings, setSettings] = useState<WatermarkSettings>({
    ...defaultSettings,
    ...initialSettings
  });

  // Handle all setting changes
  const handleSettingChange = <K extends keyof WatermarkSettings>(key: K, value: WatermarkSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onWatermarkChange(newSettings);
  };

  const isVisibleWatermarkEnabled = settings.enabled && (settings.type === 'visible' || settings.type === 'both');
  const isInvisibleWatermarkEnabled = settings.enabled && (settings.type === 'invisible' || settings.type === 'both');

  // Get watermark description based on settings
  const getWatermarkDescription = () => {
    if (!settings.enabled) return "No watermark will be applied to your content.";

    let description = "";

    if (settings.type === 'both') {
      description = "Your content will be protected with both visible and invisible watermarks.";
    } else if (settings.type === 'visible') {
      description = "Your content will have a visible watermark that viewers can see.";
    } else {
      description = "Your content will be protected with an invisible watermark that can be detected if your content is misused.";
    }

    if (settings.fingerprinting) {
      description += " Digital fingerprinting is also enabled for enhanced tracking.";
    }

    return description;
  };

  return (
    <Card className={disabled ? "opacity-80" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-violet-600" />
          <span>Content Protection</span>
        </CardTitle>
        <CardDescription>
          Add watermarks and fingerprints to protect your content from unauthorized use
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="watermark-toggle" className="font-medium">
              Enable Watermarking
            </Label>
            <p className="text-xs text-muted-foreground">
              Add identifying information to your content to track unauthorized use
            </p>
          </div>
          <Switch
            id="watermark-toggle"
            checked={settings.enabled}
            onCheckedChange={(checked) => handleSettingChange('enabled', checked)}
            disabled={disabled}
          />
        </div>

        {settings.enabled && (
          <>
            <Alert variant={isInvisibleWatermarkEnabled ? "default" : "outline"} className={isInvisibleWatermarkEnabled ? "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/10 dark:border-blue-800/30 dark:text-blue-400" : ""}>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {getWatermarkDescription()}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Watermark Type</Label>
              <RadioGroup
                value={settings.type}
                onValueChange={(value) => handleSettingChange('type', value as WatermarkSettings['type'])}
                className="flex flex-col space-y-1"
                disabled={disabled}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="invisible" id="invisible" />
                  <Label htmlFor="invisible" className="cursor-pointer flex items-center gap-1.5">
                    <EyeOff className="h-3.5 w-3.5" /> Invisible
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="visible" id="visible" />
                  <Label htmlFor="visible" className="cursor-pointer flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" /> Visible
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both" className="cursor-pointer flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" /> Both (Recommended)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Tabs defaultValue="settings" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="settings" disabled={disabled}>Settings</TabsTrigger>
                {showPreview && <TabsTrigger value="preview" disabled={disabled || !previewUrl}>Preview</TabsTrigger>}
              </TabsList>
              <TabsContent value="settings" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="watermark-strength">Watermark Strength</Label>
                    <span className="text-sm text-muted-foreground">{settings.strength}%</span>
                  </div>
                  <Slider
                    id="watermark-strength"
                    min={10}
                    max={100}
                    step={5}
                    value={[settings.strength]}
                    onValueChange={(values) => handleSettingChange('strength', values[0])}
                    disabled={disabled}
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher strength improves survivability but may affect quality
                  </p>
                </div>

                {isVisibleWatermarkEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="visible-type">Visible Watermark Style</Label>
                      <Select
                        value={settings.visibleType}
                        onValueChange={(value) => handleSettingChange('visibleType', value as WatermarkSettings['visibleType'])}
                        disabled={disabled}
                      >
                        <SelectTrigger id="visible-type">
                          <SelectValue placeholder="Select watermark style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="logo">Logo</SelectItem>
                          <SelectItem value="qrCode">QR Code</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {settings.visibleType === 'text' && (
                      <div className="space-y-2">
                        <Label htmlFor="watermark-text">Watermark Text</Label>
                        <input
                          id="watermark-text"
                          className="w-full px-3 py-2 border rounded-md"
                          value={settings.customText}
                          onChange={(e) => handleSettingChange('customText', e.target.value)}
                          placeholder="© Your Copyright Text"
                          disabled={disabled}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="opacity">Opacity</Label>
                        <span className="text-sm text-muted-foreground">{settings.opacity}%</span>
                      </div>
                      <Slider
                        id="opacity"
                        min={10}
                        max={100}
                        step={5}
                        value={[settings.opacity]}
                        onValueChange={(values) => handleSettingChange('opacity', values[0])}
                        disabled={disabled}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Select
                        value={settings.position}
                        onValueChange={(value) => handleSettingChange('position', value as WatermarkSettings['position'])}
                        disabled={disabled}
                      >
                        <SelectTrigger id="position">
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="topLeft">Top Left</SelectItem>
                          <SelectItem value="topRight">Top Right</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="bottomLeft">Bottom Left</SelectItem>
                          <SelectItem value="bottomRight">Bottom Right</SelectItem>
                          <SelectItem value="custom">Custom (Tiled)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="pt-2 space-y-2">
                  <Label className="text-sm font-medium">Metadata Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="include-owner"
                        className="text-sm font-normal leading-none cursor-pointer"
                      >
                        Include ownership information
                      </Label>
                      <Switch
                        id="include-owner"
                        checked={settings.includeOwnerInfo}
                        onCheckedChange={(checked) => handleSettingChange('includeOwnerInfo', checked)}
                        disabled={disabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="include-datetime"
                        className="text-sm font-normal leading-none cursor-pointer"
                      >
                        Include date/time stamp
                      </Label>
                      <Switch
                        id="include-datetime"
                        checked={settings.includeDatetime}
                        onCheckedChange={(checked) => handleSettingChange('includeDatetime', checked)}
                        disabled={disabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="include-id"
                        className="text-sm font-normal leading-none cursor-pointer"
                      >
                        Include unique identifier
                      </Label>
                      <Switch
                        id="include-id"
                        checked={settings.includeId}
                        onCheckedChange={(checked) => handleSettingChange('includeId', checked)}
                        disabled={disabled}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="fingerprinting" className="font-medium flex items-center gap-1.5">
                        <Fingerprint className="h-4 w-4" />
                        Digital Fingerprinting
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Create a unique content fingerprint for enhanced detection
                      </p>
                    </div>
                    <Switch
                      id="fingerprinting"
                      checked={settings.fingerprinting}
                      onCheckedChange={(checked) => handleSettingChange('fingerprinting', checked)}
                      disabled={disabled}
                    />
                  </div>
                </div>
              </TabsContent>

              {showPreview && (
                <TabsContent value="preview">
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground mb-2">
                      This is how your content will appear with the selected watermark settings
                    </div>
                    {previewUrl ? (
                      <div className="relative border rounded-md overflow-hidden bg-muted/40 min-h-[200px] flex items-center justify-center">
                        {fileType === 'image' && (
                          <div className="relative w-full max-w-lg mx-auto">
                            <img
                              src={previewUrl}
                              alt="Preview with watermark"
                              className="w-full h-auto"
                            />
                            {isVisibleWatermarkEnabled && settings.visibleType === 'text' && (
                              <div
                                className="absolute text-sm font-semibold text-white bg-black/20 p-2 pointer-events-none select-none backdrop-blur-sm"
                                style={{
                                  opacity: settings.opacity / 100,
                                  top: settings.position.includes('top') ? '10px' : 'auto',
                                  bottom: settings.position.includes('bottom') ? '10px' : 'auto',
                                  left: settings.position.includes('Left') ? '10px' : 'auto',
                                  right: settings.position.includes('Right') ? '10px' : 'auto',
                                  transform: settings.position === 'center' ? 'translate(-50%, -50%)' : 'none',
                                  ...(settings.position === 'center' ? { top: '50%', left: '50%' } : {}),
                                  ...(settings.position === 'custom' ? { top: '10px', right: '10px' } : {}),
                                }}
                              >
                                {settings.customText || '© Protected Content'}
                              </div>
                            )}
                          </div>
                        )}
                        {fileType === 'video' && (
                          <div className="relative w-full max-w-lg mx-auto">
                            <video
                              src={previewUrl}
                              controls
                              className="w-full h-auto"
                            />
                            {isVisibleWatermarkEnabled && settings.visibleType === 'text' && (
                              <div
                                className="absolute text-sm font-semibold text-white bg-black/20 p-2 pointer-events-none select-none backdrop-blur-sm"
                                style={{
                                  opacity: settings.opacity / 100,
                                  top: settings.position.includes('top') ? '10px' : 'auto',
                                  bottom: settings.position.includes('bottom') ? '10px' : 'auto',
                                  left: settings.position.includes('Left') ? '10px' : 'auto',
                                  right: settings.position.includes('Right') ? '10px' : 'auto',
                                  transform: settings.position === 'center' ? 'translate(-50%, -50%)' : 'none',
                                  ...(settings.position === 'center' ? { top: '50%', left: '50%' } : {}),
                                  ...(settings.position === 'custom' ? { top: '10px', right: '10px' } : {}),
                                }}
                              >
                                {settings.customText || '© Protected Content'}
                              </div>
                            )}
                          </div>
                        )}
                        {fileType === 'audio' && (
                          <div className="w-full max-w-lg mx-auto">
                            <audio
                              src={previewUrl}
                              controls
                              className="w-full"
                            />
                            <p className="text-center text-sm text-muted-foreground mt-2">
                              {isInvisibleWatermarkEnabled ? 'This audio contains an invisible watermark' : 'No watermark applied to this audio'}
                            </p>
                          </div>
                        )}
                        {(fileType === 'document' || !['image', 'video', 'audio'].includes(fileType)) && (
                          <div className="text-center p-6">
                            <FileWarning className="h-16 w-16 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm">Preview not available for this file type</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {isInvisibleWatermarkEnabled ?
                                'Your document will contain an invisible watermark' :
                                'No watermark will be applied'}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="border rounded-md p-8 text-center bg-muted/40">
                        <FileWarning className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-70" />
                        <p className="text-muted-foreground">Preview not available</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </>
        )}

        {!settings.enabled && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 dark:bg-red-900/10 dark:border-red-800/30 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Warning: Your content will be uploaded without any watermark protection. This makes it easier for others to use your work without permission.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="border-t bg-muted/30 px-6 py-4">
        <div className="flex justify-between items-center w-full">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const defaultSettings = getDefaultSettings();
                    setSettings(defaultSettings);
                    onWatermarkChange(defaultSettings);
                  }}
                  disabled={disabled}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset to recommended settings for this file type</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            size="sm"
            onClick={() => {
              toast.success("Watermark settings saved");
            }}
            disabled={disabled}
          >
            <FileCheck className="h-4 w-4 mr-2" />
            Apply Settings
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
