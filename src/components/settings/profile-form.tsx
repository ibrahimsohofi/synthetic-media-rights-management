"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Check, Globe } from "lucide-react";
import { toast } from "sonner";
import { updateUserProfile } from "@/lib/actions/user";

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  username: string | null;
  bio: string | null;
  avatar: string | null;
  creatorType: string | null;
  portfolioUrl: string | null;
  isPublic: boolean;
}

interface ProfileFormProps {
  user: UserProfile;
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
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
      const result = await updateUserProfile(formData);

      if (result.success) {
        setFormSuccess(result.message);
        router.refresh(); // Refresh the page to show updated data
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
      {/* Avatar upload */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src={user.avatar || ""} alt={user.name || "User's avatar"} />
          <AvatarFallback className="text-lg">
            {user.name?.split(" ").map(n => n[0]).join("") || user.email?.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <h3 className="font-medium">Profile Photo</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1" type="button">
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1" type="button">
              Remove
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            JPG, GIF or PNG. Max size 2MB.
          </p>
        </div>
      </div>

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

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={user.name || ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            defaultValue={user.username || ""}
          />
          <p className="text-xs text-muted-foreground">
            This will be part of your profile URL. Only letters, numbers, underscores, and hyphens are allowed.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={user.email || ""}
          disabled
        />
        <p className="text-xs text-muted-foreground">
          Your email address is used for login and cannot be changed here.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          placeholder="Tell us about yourself and your creative work..."
          rows={4}
          defaultValue={user.bio || ""}
        />
        <p className="text-xs text-muted-foreground">
          Write a short bio about yourself that will appear on your public profile. Max 500 characters.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="creatorType">Creator Type</Label>
        <Select name="creatorType" defaultValue={user.creatorType || ""}>
          <SelectTrigger id="creatorType">
            <SelectValue placeholder="Select your creator type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="visual-artist">Visual Artist</SelectItem>
            <SelectItem value="musician">Musician</SelectItem>
            <SelectItem value="writer">Writer</SelectItem>
            <SelectItem value="filmmaker">Filmmaker</SelectItem>
            <SelectItem value="voice-actor">Voice Actor</SelectItem>
            <SelectItem value="game-dev">Game Developer</SelectItem>
            <SelectItem value="photographer">Photographer</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="portfolioUrl">Portfolio URL</Label>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <Input
            id="portfolioUrl"
            name="portfolioUrl"
            placeholder="https://yourportfolio.com"
            defaultValue={user.portfolioUrl || ""}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isPublic"
          name="isPublic"
          defaultChecked={user.isPublic}
        />
        <Label htmlFor="isPublic">Make my profile public</Label>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
