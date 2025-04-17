"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Bell, Mail } from "lucide-react";
import { updateNotificationPreferences } from "@/lib/actions/user";
import { toast } from "sonner";

interface NotificationsFormProps {
  initialPreferences?: {
    emailNotifications?: {
      marketplaceActivity?: boolean;
      rightsViolations?: boolean;
      productUpdates?: boolean;
      marketing?: boolean;
    };
    appNotifications?: {
      marketplaceActivity?: boolean;
      rightsViolations?: boolean;
      productUpdates?: boolean;
      messages?: boolean;
    };
  };
}

export default function NotificationsForm({ initialPreferences }: NotificationsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Set default values from initial preferences or use defaults
  const emailMarketplace = initialPreferences?.emailNotifications?.marketplaceActivity ?? true;
  const emailViolations = initialPreferences?.emailNotifications?.rightsViolations ?? true;
  const emailUpdates = initialPreferences?.emailNotifications?.productUpdates ?? false;
  const emailMarketing = initialPreferences?.emailNotifications?.marketing ?? false;

  const appMarketplace = initialPreferences?.appNotifications?.marketplaceActivity ?? true;
  const appViolations = initialPreferences?.appNotifications?.rightsViolations ?? true;
  const appUpdates = initialPreferences?.appNotifications?.productUpdates ?? true;
  const appMessages = initialPreferences?.appNotifications?.messages ?? true;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await updateNotificationPreferences(formData);

      if (result.success) {
        setFormSuccess(result.message);
        toast.success(result.message); // Added toast notification for success
      } else {
        setFormError(result.message);
        toast.error(result.message); // Added toast notification for error
      }
    } catch (error) {
      setFormError("An unexpected error occurred. Please try again.");
      console.error(error);
      toast.error("An unexpected error occurred. Please try again."); // Added toast notification for unexpected error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form feedback */}
      {formError && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm dark:bg-red-900/20 dark:text-red-400">
          {formError}
        </div>
      )}

      {formSuccess && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm flex items-center gap-2 dark:bg-green-900/20 dark:text-green-400">
          <Check className="h-4 w-4" />
          {formSuccess}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-sm font-medium">Email Notifications</h3>
        </div>
        <div className="space-y-3 ml-7">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="emailMarketplace"
              name="emailMarketplace"
              value="true"
              defaultChecked={emailMarketplace}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="emailMarketplace" className="text-sm">
                Marketplace activity
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive updates about your listings, licensing inquiries, and sales.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox
              id="emailViolations"
              name="emailViolations"
              value="true"
              defaultChecked={emailViolations}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="emailViolations" className="text-sm">
                Rights violations
              </Label>
              <p className="text-xs text-muted-foreground">
                Get notified when potential unauthorized use of your work is detected.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox
              id="emailUpdates"
              name="emailUpdates"
              value="true"
              defaultChecked={emailUpdates}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="emailUpdates" className="text-sm">
                Product updates
              </Label>
              <p className="text-xs text-muted-foreground">
                Stay informed about new features and improvements to the platform.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox
              id="emailMarketing"
              name="emailMarketing"
              value="true"
              defaultChecked={emailMarketing}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="emailMarketing" className="text-sm">
                Marketing and promotions
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive offers, promotions, and special announcements.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-sm font-medium">In-App Notifications</h3>
        </div>
        <div className="space-y-3 ml-7">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="appMarketplace"
              name="appMarketplace"
              value="true"
              defaultChecked={appMarketplace}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="appMarketplace" className="text-sm">
                Marketplace activity
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive in-app notifications about your listings and inquiries.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox
              id="appViolations"
              name="appViolations"
              value="true"
              defaultChecked={appViolations}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="appViolations" className="text-sm">
                Rights violations
              </Label>
              <p className="text-xs text-muted-foreground">
                Get notified in-app when unauthorized use is detected.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox
              id="appUpdates"
              name="appUpdates"
              value="true"
              defaultChecked={appUpdates}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="appUpdates" className="text-sm">
                Product updates
              </Label>
              <p className="text-xs text-muted-foreground">
                Be notified of new features when they're released.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox
              id="appMessages"
              name="appMessages"
              value="true"
              defaultChecked={appMessages}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="appMessages" className="text-sm">
                Messages
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive notifications for new messages and mentions.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </form>
  );
}
