'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileSettingsProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    username: string | null;
    bio: string | null;
    avatar: string | null;
    creatorType: string | null;
    portfolioUrl: string | null;
    isPublic: boolean;
  };
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    username: user.username || '',
    bio: user.bio || '',
    creatorType: user.creatorType || '',
    portfolioUrl: user.portfolioUrl || '',
    isPublic: user.isPublic,
  });

  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Upload avatar if changed
      let avatarUrl = user.avatar;
      if (avatar) {
        const formData = new FormData();
        formData.append('file', avatar);
        const uploadResponse = await fetch('/api/upload/avatar', {
          method: 'POST',
          body: formData,
        });
        if (!uploadResponse.ok) throw new Error('Failed to upload avatar');
        const { url } = await uploadResponse.json();
        avatarUrl = url;
      }

      // Update profile
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          avatar: avatarUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarPreview || '/default-avatar.png'} />
              <AvatarFallback>{user.name?.[0] || user.email[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Recommended: Square image, at least 200x200px
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <Input
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Choose a username"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Creator Type</label>
            <Input
              value={formData.creatorType}
              onChange={(e) => setFormData({ ...formData, creatorType: e.target.value })}
              placeholder="e.g., Photographer, Artist, Musician"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Portfolio URL</label>
            <Input
              type="url"
              value={formData.portfolioUrl}
              onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
              placeholder="https://your-portfolio.com"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Public Profile</label>
              <p className="text-sm text-muted-foreground">
                Make your profile visible to other users
              </p>
            </div>
            <Switch
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </form>
  );
} 