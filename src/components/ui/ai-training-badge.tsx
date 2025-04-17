import { Badge } from "./badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { Brain } from "lucide-react";

interface AITrainingBadgeProps {
  optedOut: boolean;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  tooltipPosition?: "top" | "bottom" | "left" | "right";
}

/**
 * Badge component that displays whether content is opted out of AI training
 */
export function AITrainingBadge({
  optedOut,
  size = "md",
  showIcon = true,
  tooltipPosition = "top"
}: AITrainingBadgeProps) {
  // Determine classes based on size
  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0 h-5",
    md: "text-xs px-2 py-0.5",
    lg: "text-sm px-2.5 py-1"
  };

  // Determine badge variants and text
  const variant = optedOut ? "destructive" : "outline";
  const text = optedOut ? "AI Training Prohibited" : "AI Training Allowed";

  const tooltipText = optedOut
    ? "This content is opted out of AI training. Using it to train AI models is prohibited."
    : "This content allows AI training under specified conditions.";

  const badge = (
    <Badge variant={variant} className={`${sizeClasses[size]} gap-1 font-medium`}>
      {showIcon && <Brain className={`${size === "sm" ? "h-3 w-3" : size === "md" ? "h-3.5 w-3.5" : "h-4 w-4"}`} />}
      {text}
    </Badge>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent side={tooltipPosition}>
          <p className="max-w-xs text-xs">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
