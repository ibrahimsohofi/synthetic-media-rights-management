"use client";

import { useState } from "react";
import { InfoIcon, Check, X, BadgeInfo } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";

interface AITrainingModel {
  id: string;
  name: string;
  company: string;
  type: string;
  selected: boolean;
}

interface AITrainingControlsProps {
  initialValue?: boolean;
  onValueChange?: (value: boolean) => void;
  onDetailedSettingsChange?: (settings: AITrainingSettings) => void;
  disabled?: boolean;
  simple?: boolean;
  workId?: string;
  workType?: string;
}

export interface AITrainingSettings {
  optOut: boolean;
  specificModels: AITrainingModel[];
  customTerms: string;
  remixAllowed: boolean;
  attributionRequired: boolean;
  commercialUseAllowed: boolean;
}

export function AITrainingControls({
  initialValue = true,
  onValueChange,
  onDetailedSettingsChange,
  disabled = false,
  simple = false,
  workId,
  workType
}: AITrainingControlsProps) {
  const [optOut, setOptOut] = useState<boolean>(initialValue);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [specificModels, setSpecificModels] = useState<AITrainingModel[]>([
    { id: "1", name: "DALL-E", company: "OpenAI", type: "Image", selected: true },
    { id: "2", name: "Midjourney", company: "Midjourney", type: "Image", selected: true },
    { id: "3", name: "Stable Diffusion", company: "Stability AI", type: "Image", selected: true },
    { id: "4", name: "Claude", company: "Anthropic", type: "Text", selected: true },
    { id: "5", name: "GPT-4", company: "OpenAI", type: "Text", selected: true },
    { id: "6", name: "Gemini", company: "Google", type: "Text", selected: true },
    { id: "7", name: "Sora", company: "OpenAI", type: "Video", selected: true },
    { id: "8", name: "Llama", company: "Meta", type: "Text", selected: true }
  ]);
  const [customTerms, setCustomTerms] = useState<string>("");
  const [remixAllowed, setRemixAllowed] = useState<boolean>(false);
  const [attributionRequired, setAttributionRequired] = useState<boolean>(true);
  const [commercialUseAllowed, setCommercialUseAllowed] = useState<boolean>(false);
  const [restrictionLevel, setRestrictionLevel] = useState<string>("full");

  const handleOptOutChange = (checked: boolean) => {
    setOptOut(checked);

    if (onValueChange) {
      onValueChange(checked);
    }

    if (onDetailedSettingsChange) {
      onDetailedSettingsChange({
        optOut: checked,
        specificModels,
        customTerms,
        remixAllowed,
        attributionRequired,
        commercialUseAllowed
      });
    }
  };

  const handleModelToggle = (modelId: string) => {
    const updatedModels = specificModels.map(model =>
      model.id === modelId ? { ...model, selected: !model.selected } : model
    );
    setSpecificModels(updatedModels);

    if (onDetailedSettingsChange) {
      onDetailedSettingsChange({
        optOut,
        specificModels: updatedModels,
        customTerms,
        remixAllowed,
        attributionRequired,
        commercialUseAllowed
      });
    }
  };

  const handleRestrictionLevelChange = (value: string) => {
    setRestrictionLevel(value);

    // Apply preset settings based on the selected restriction level
    if (value === "full") {
      setRemixAllowed(false);
      setAttributionRequired(true);
      setCommercialUseAllowed(false);
      // Select all models for opt-out
      const allSelected = specificModels.map(model => ({ ...model, selected: true }));
      setSpecificModels(allSelected);
    } else if (value === "balanced") {
      setRemixAllowed(true);
      setAttributionRequired(true);
      setCommercialUseAllowed(false);
      // Selective model opt-out based on content type
      const selectively = specificModels.map(model => ({
        ...model,
        selected: model.type.toLowerCase() === (workType || "").toLowerCase()
      }));
      setSpecificModels(selectively);
    } else if (value === "minimal") {
      setRemixAllowed(true);
      setAttributionRequired(false);
      setCommercialUseAllowed(true);
      // Minimal opt-out
      const minimal = specificModels.map(model => ({ ...model, selected: false }));
      setSpecificModels(minimal);
    }

    if (onDetailedSettingsChange) {
      onDetailedSettingsChange({
        optOut,
        specificModels,
        customTerms,
        remixAllowed: value === "full" ? false : value === "balanced" ? true : true,
        attributionRequired: value === "full" ? true : value === "balanced" ? true : false,
        commercialUseAllowed: value === "full" ? false : value === "balanced" ? false : true
      });
    }
  };

  // For simple mode, just show the basic toggle
  if (simple) {
    return (
      <div className="flex items-center justify-between space-x-2">
        <div className="flex-1 space-y-1">
          <div className="flex items-center">
            <Label htmlFor="ai-training-optout" className="font-medium">
              Opt-out of AI Training
            </Label>
            <InfoIcon
              className="ml-2 h-4 w-4 text-muted-foreground cursor-help"
              title="Prevents your content from being used to train AI models"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Prevents use of this work for training AI models
          </p>
        </div>
        <Switch
          id="ai-training-optout"
          checked={optOut}
          onCheckedChange={handleOptOutChange}
          disabled={disabled}
        />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          AI Training Controls
          <Badge
            variant="outline"
            className="ml-2 font-normal text-xs py-0"
          >
            Pro Feature
          </Badge>
        </CardTitle>
        <CardDescription>
          Control how your content can be used for AI model training
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between space-x-2">
          <div className="flex-1 space-y-1">
            <div className="flex items-center">
              <Label htmlFor="ai-training-optout" className="font-medium">
                Opt-out of AI Training
              </Label>
              <InfoIcon
                className="ml-2 h-4 w-4 text-muted-foreground cursor-help"
                title="Prevents your content from being used to train AI models"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Prevents use of this work for training AI models
            </p>
          </div>
          <Switch
            id="ai-training-optout"
            checked={optOut}
            onCheckedChange={handleOptOutChange}
            disabled={disabled}
          />
        </div>

        {optOut && (
          <>
            <div className="pt-4 pb-2">
              <Label className="text-sm font-medium">Restriction Level</Label>
              <RadioGroup
                value={restrictionLevel}
                onValueChange={handleRestrictionLevelChange}
                className="flex flex-col space-y-1 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="full" id="full" />
                  <Label htmlFor="full" className="font-normal">
                    Full Protection
                  </Label>
                  <Badge variant="outline" className="ml-auto text-xs">
                    Recommended
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="balanced" id="balanced" />
                  <Label htmlFor="balanced" className="font-normal">
                    Balanced
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="minimal" id="minimal" />
                  <Label htmlFor="minimal" className="font-normal">
                    Minimal
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="border-t pt-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    Advanced Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Advanced AI Training Controls</DialogTitle>
                    <DialogDescription>
                      Fine-tune how your work can be used in AI training
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Specific Models Opt-Out</Label>
                      <p className="text-xs text-muted-foreground">
                        Select specific AI models you want to exclude your work from
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        {specificModels.map(model => (
                          <div
                            key={model.id}
                            className={`flex items-center justify-between p-2 rounded-md border cursor-pointer ${
                              model.selected
                                ? "bg-primary/5 border-primary/30"
                                : "bg-background hover:bg-muted/50"
                            }`}
                            onClick={() => handleModelToggle(model.id)}
                          >
                            <div>
                              <p className="text-sm font-medium">{model.name}</p>
                              <p className="text-xs text-muted-foreground">{model.company}</p>
                            </div>
                            <Badge variant={model.selected ? "default" : "outline"} className="ml-2">
                              {model.selected ? (
                                <Check className="h-3 w-3 mr-1" />
                              ) : (
                                <X className="h-3 w-3 mr-1" />
                              )}
                              {model.selected ? "Blocked" : "Allowed"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="remix-allowed" className="text-sm font-medium">
                            Allow Derivative Works
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Permit AI to create derivatives of your work
                          </p>
                        </div>
                        <Switch
                          id="remix-allowed"
                          checked={remixAllowed}
                          onCheckedChange={setRemixAllowed}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="attribution-required" className="text-sm font-medium">
                            Require Attribution
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Require attribution when your work influences AI outputs
                          </p>
                        </div>
                        <Switch
                          id="attribution-required"
                          checked={attributionRequired}
                          onCheckedChange={setAttributionRequired}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="commercial-use" className="text-sm font-medium">
                            Allow Commercial Use
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Allow AI-generated derivatives to be used commercially
                          </p>
                        </div>
                        <Switch
                          id="commercial-use"
                          checked={commercialUseAllowed}
                          onCheckedChange={setCommercialUseAllowed}
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="submit" onClick={() => {
                      if (onDetailedSettingsChange) {
                        onDetailedSettingsChange({
                          optOut,
                          specificModels,
                          customTerms,
                          remixAllowed,
                          attributionRequired,
                          commercialUseAllowed
                        });
                      }
                    }}>
                      Save Settings
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="bg-muted/50 flex justify-between items-center py-2 px-6 text-xs text-muted-foreground">
        <div className="flex items-center">
          <BadgeInfo className="h-3 w-3 mr-1" />
          {optOut
            ? restrictionLevel === "full"
              ? "Full AI training protection enabled"
              : restrictionLevel === "balanced"
                ? "Balanced AI training protection"
                : "Basic AI training protection"
            : "AI training protection disabled"
          }
        </div>
        <Badge variant="outline" className="text-xs">
          {optOut ? (
            <span className="flex items-center">
              <Check className="h-3 w-3 mr-1 text-green-500" />
              Protected
            </span>
          ) : (
            <span className="flex items-center">
              <X className="h-3 w-3 mr-1 text-amber-500" />
              Not Protected
            </span>
          )}
        </Badge>
      </CardFooter>
    </Card>
  );
}
