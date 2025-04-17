import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Lock } from "lucide-react";
import { updateUserPassword } from "@/lib/actions/user";

export default function SecurityForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await updateUserPassword(formData);

      if (result.success) {
        setFormSuccess(result.message);
        // Reset the form on successful submission
        (event.target as HTMLFormElement).reset();
      } else {
        setFormError(result.message);
      }
    } catch (error) {
      setFormError("An unexpected error occurred. Please try again.");
      console.error(error);
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

      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            placeholder="Enter your current password"
            className="pl-9"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            placeholder="Enter your new password"
            className="pl-9"
            required
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Password must be at least 8 characters long.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your new password"
            className="pl-9"
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Password Requirements</h3>
        <ul className="text-sm text-muted-foreground list-disc list-inside pl-2 space-y-1">
          <li>Minimum 8 characters long</li>
          <li>Include uppercase and lowercase letters</li>
          <li>Include at least one number</li>
          <li>Include at least one special character</li>
        </ul>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Password"}
        </Button>
      </div>
    </form>
  );
}
