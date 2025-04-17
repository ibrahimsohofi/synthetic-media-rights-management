"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, AlertCircle, Info, Check, Users, UserPlus, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createTeam } from "@/lib/actions/team";

export default function CreateTeamPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [generateInviteCode, setGenerateInviteCode] = useState(true);
  const [memberPermissions, setMemberPermissions] = useState({
    canView: true,
    canEdit: false,
    canAdd: false,
    canDelete: false,
    canInvite: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!name) {
      setError("Please enter a team name");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description || "");
      formData.append("isPublic", isPublic.toString());
      formData.append("generateInviteCode", generateInviteCode.toString());

      // Convert permissions to a comma-separated string
      const permissionsString = Object.entries(memberPermissions)
        .filter(([_, enabled]) => enabled)
        .map(([name]) => name)
        .join(",");

      formData.append("defaultPermissions", permissionsString);

      // Call the server action to create the team
      const result = await createTeam(formData);

      if (result.success) {
        setSuccess(true);
        toast.success("Team created successfully");

        // Redirect after success message
        setTimeout(() => {
          router.push(`/dashboard/team/${result.teamId}`);
        }, 2000);
      } else {
        setError(result.message || "Failed to create team");
        toast.error(result.message || "Failed to create team");
      }
    } catch (error) {
      console.error("Error creating team:", error);
      setError("An error occurred while creating your team");
      toast.error("Failed to create team due to a system error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start">
          <div>
            <Link
              href="/dashboard/team"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-1"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Teams
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Create Team</h1>
            <p className="text-muted-foreground">
              Create a team to collaborate on rights management with others
            </p>
          </div>
        </div>

        <Card className="border-border/50">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Team Details</CardTitle>
              <CardDescription>
                Provide information about your new team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="flex items-start space-x-3 p-3 border border-red-200 rounded-md bg-red-50 dark:border-red-900/30 dark:bg-red-900/10">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center mt-0.5">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </div>
                </div>
              )}

              {success && (
                <div className="flex items-start space-x-3 p-3 border border-green-200 rounded-md bg-green-50 dark:border-green-900/30 dark:bg-green-900/10">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center mt-0.5">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    <p className="font-medium">Team created successfully!</p>
                    <p>Your team is now ready for collaboration.</p>
                  </div>
                </div>
              )}

              {/* Team Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Team Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter a name for your team"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the purpose of this team"
                    rows={3}
                  />
                </div>
              </div>

              {/* Team Settings */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Team Settings</Label>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="public-team"
                    checked={isPublic}
                    onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="public-team" className="font-medium cursor-pointer">Public Team</Label>
                    <p className="text-xs text-muted-foreground">
                      Allow your team to be discoverable by other users
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="invite-code"
                    checked={generateInviteCode}
                    onCheckedChange={(checked) => setGenerateInviteCode(checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="invite-code" className="font-medium cursor-pointer">Generate Invite Code</Label>
                    <p className="text-xs text-muted-foreground">
                      Create a shareable code that allows others to join your team
                    </p>
                  </div>
                </div>
              </div>

              {/* Default Member Permissions */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Default Member Permissions</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Set the default permissions for new team members. You can change individual permissions later.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="perm-view"
                      checked={memberPermissions.canView}
                      onCheckedChange={(checked) =>
                        setMemberPermissions({...memberPermissions, canView: checked as boolean})
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="perm-view" className="font-medium cursor-pointer">View Works & Licenses</Label>
                      <p className="text-xs text-muted-foreground">
                        Can view the team's creative works and licenses
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="perm-edit"
                      checked={memberPermissions.canEdit}
                      onCheckedChange={(checked) =>
                        setMemberPermissions({...memberPermissions, canEdit: checked as boolean})
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="perm-edit" className="font-medium cursor-pointer">Edit Works & Licenses</Label>
                      <p className="text-xs text-muted-foreground">
                        Can edit details of existing works and licenses
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="perm-add"
                      checked={memberPermissions.canAdd}
                      onCheckedChange={(checked) =>
                        setMemberPermissions({...memberPermissions, canAdd: checked as boolean})
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="perm-add" className="font-medium cursor-pointer">Add New Works</Label>
                      <p className="text-xs text-muted-foreground">
                        Can register new works on behalf of the team
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="perm-delete"
                      checked={memberPermissions.canDelete}
                      onCheckedChange={(checked) =>
                        setMemberPermissions({...memberPermissions, canDelete: checked as boolean})
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="perm-delete" className="font-medium cursor-pointer">Remove Works & Licenses</Label>
                      <p className="text-xs text-muted-foreground">
                        Can remove works and cancel licenses
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="perm-invite"
                      checked={memberPermissions.canInvite}
                      onCheckedChange={(checked) =>
                        setMemberPermissions({...memberPermissions, canInvite: checked as boolean})
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="perm-invite" className="font-medium cursor-pointer">Invite Members</Label>
                      <p className="text-xs text-muted-foreground">
                        Can invite new members to join the team
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 border border-blue-200 rounded-md bg-blue-50 dark:border-blue-900/30 dark:bg-blue-900/10">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center mt-0.5">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  <p>Teams allow you to collaborate with others on rights management. As the team owner, you'll have full control over team settings and member permissions.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-muted/50 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Team..." : (
                  <>
                    <Users className="mr-2 h-4 w-4" /> Create Team
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
