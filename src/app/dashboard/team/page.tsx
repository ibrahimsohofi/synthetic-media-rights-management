"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Users,
  UserPlus,
  Plus,
  PlusCircle,
  Search,
  Globe,
  Lock,
  ArrowRight,
  UserCircle,
  Shield,
  AlertCircle,
  Check
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getUserTeams, joinTeamWithCode } from "@/lib/actions/team";

export default function TeamsDashboardPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Join team with code
  const [inviteCode, setInviteCode] = useState('');
  const [joiningTeam, setJoiningTeam] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState(false);

  // Fetch user's teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const result = await getUserTeams();

        if (result.success) {
          setTeams(result.teams);
        } else {
          setError(result.message || "Failed to load teams");
        }
      } catch (err) {
        console.error("Error fetching teams:", err);
        setError("An error occurred while loading your teams");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteCode.trim()) {
      setJoinError("Please enter an invite code");
      return;
    }

    setJoiningTeam(true);
    setJoinError(null);
    setJoinSuccess(false);

    try {
      const result = await joinTeamWithCode(inviteCode);

      if (result.success) {
        setJoinSuccess(true);
        toast.success("Successfully joined the team");

        // Refresh teams after joining
        const teamsResult = await getUserTeams();
        if (teamsResult.success) {
          setTeams(teamsResult.teams);
        }

        // Close dialog after a delay
        setTimeout(() => {
          setJoinDialogOpen(false);
          setInviteCode('');
        }, 2000);
      } else {
        setJoinError(result.message || "Failed to join team");
        toast.error(result.message || "Failed to join team");
      }
    } catch (err) {
      console.error("Error joining team:", err);
      setJoinError("An error occurred while joining the team");
      toast.error("Failed to join team");
    } finally {
      setJoiningTeam(false);
    }
  };

  // Get teams count by role
  const ownedTeamsCount = teams.filter(team => team.role === "OWNER").length;
  const otherTeamsCount = teams.length - ownedTeamsCount;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
            <p className="text-muted-foreground">
              Collaborate with others on rights management
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <UserPlus className="h-4 w-4" /> Join Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join a Team</DialogTitle>
                  <DialogDescription>
                    Enter the invite code provided by the team owner
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleJoinTeam} className="space-y-4 py-4">
                  {joinError && (
                    <div className="flex items-start space-x-3 p-3 border border-red-200 rounded-md bg-red-50 dark:border-red-900/30 dark:bg-red-900/10">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center mt-0.5">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="text-sm text-red-600 dark:text-red-400">
                        {joinError}
                      </div>
                    </div>
                  )}

                  {joinSuccess && (
                    <div className="flex items-start space-x-3 p-3 border border-green-200 rounded-md bg-green-50 dark:border-green-900/30 dark:bg-green-900/10">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center mt-0.5">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">
                        <p className="font-medium">Team joined successfully!</p>
                        <p>You now have access to the team's resources.</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="invite-code" className="text-sm font-medium">
                      Invite Code
                    </label>
                    <Input
                      id="invite-code"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="Enter team invite code"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      The invite code is case-sensitive
                    </p>
                  </div>

                  <DialogFooter className="pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setJoinDialogOpen(false)}
                      disabled={joiningTeam}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={joiningTeam}>
                      {joiningTeam ? "Joining..." : "Join Team"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Button asChild>
              <Link href="/dashboard/team/create">
                <PlusCircle className="h-4 w-4 mr-2" /> Create Team
              </Link>
            </Button>
          </div>
        </div>

        {/* Teams Tabs */}
        <Tabs defaultValue="my-teams" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="my-teams">
              My Teams ({teams.length})
            </TabsTrigger>
            <TabsTrigger value="invitations">
              Invitations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-teams">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded-md w-48 mb-2"></div>
                      <div className="h-4 bg-muted rounded-md w-64"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-muted rounded-md w-24 mb-3"></div>
                      <div className="h-10 bg-muted rounded-md"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card>
                <CardHeader>
                  <CardTitle>Error</CardTitle>
                  <CardDescription>
                    There was an error loading your teams
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </CardFooter>
              </Card>
            ) : teams.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Teams Found</CardTitle>
                  <CardDescription>
                    You haven't created or joined any teams yet
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Teams allow you to collaborate with others on managing synthetic media rights.
                    You can create a new team or join an existing one with an invite code.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button asChild>
                      <Link href="/dashboard/team/create">
                        <PlusCircle className="h-4 w-4 mr-2" /> Create Team
                      </Link>
                    </Button>
                    <Button variant="outline" onClick={() => setJoinDialogOpen(true)}>
                      <UserPlus className="h-4 w-4 mr-2" /> Join Team
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {ownedTeamsCount > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Teams You Own</h2>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {teams
                        .filter(team => team.role === "OWNER")
                        .map(team => (
                          <TeamCard key={team.id} team={team} />
                        ))
                      }
                    </div>
                  </div>
                )}

                {otherTeamsCount > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Teams You're In</h2>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {teams
                        .filter(team => team.role !== "OWNER")
                        .map(team => (
                          <TeamCard key={team.id} team={team} />
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="invitations">
            <Card>
              <CardHeader>
                <CardTitle>Team Invitations</CardTitle>
                <CardDescription>
                  Invitations from other teams to collaborate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Pending Invitations</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    You don't have any pending team invitations at the moment.
                    When someone invites you to join their team, you'll see it here.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="justify-center">
                <Button variant="outline" onClick={() => setJoinDialogOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" /> Join With Invite Code
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function TeamCard({ team }: { team: any }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="flex items-center">
            {team.name}
            {team.isPublic ? (
              <Globe className="h-4 w-4 ml-2 text-muted-foreground" />
            ) : (
              <Lock className="h-4 w-4 ml-2 text-muted-foreground" />
            )}
          </CardTitle>
          <CardDescription className="mt-1 line-clamp-1">
            {team.description || "No description provided"}
          </CardDescription>
        </div>
        <Badge
          variant={team.role === "OWNER" ? "default" : "outline"}
          className={team.role === "OWNER" ? "bg-violet-600" : ""}
        >
          {team.role}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-2" />
          <span>{team.memberCount} {team.memberCount === 1 ? "member" : "members"}</span>
        </div>

        {team.role === "OWNER" && team.inviteCode && (
          <div className="text-xs bg-muted px-2 py-1.5 rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <span className="font-mono">Invite: {team.inviteCode}</span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/dashboard/team/${team.id}`}>
            <span>Manage Team</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
