import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bell, Lock, Share2, Shield } from "lucide-react";
import ProfileForm from "@/components/settings/profile-form";
import SecurityForm from "@/components/settings/security-form";
import NotificationsForm from "@/components/settings/notifications-form";
import { getUserProfile } from "@/lib/actions/user";
import { getCurrentUser } from "@/lib/auth-utils";

export default async function SettingsPage() {
  // Get user profile information
  const user = await getCurrentUser();
  const userProfileResult = await getUserProfile();
  const userProfile = userProfileResult.success ? userProfileResult.user : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" /> Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="connections" className="gap-2">
              <Share2 className="h-4 w-4" /> Connections
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and how it appears on your profile.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userProfile ? (
                  <ProfileForm user={userProfile} />
                ) : (
                  <div className="text-muted-foreground">
                    Loading user profile...
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Update your password and manage security settings for your account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SecurityForm />
              </CardContent>
            </Card>

            <Card className="border-border/50 mt-6">
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account by enabling two-factor authentication.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-6 border-2 border-dashed rounded-lg">
                  <div className="text-center">
                    <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Two-Factor Authentication</h3>
                    <p className="text-muted-foreground max-w-md">
                      Two-factor authentication is coming soon. This feature will provide additional security
                      by requiring a second verification step when you sign in.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Control which notifications you receive and how they are delivered.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NotificationsForm
                  initialPreferences={userProfile?.notificationPreferences ?? undefined}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value="connections">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
                <CardDescription>
                  Connect your account with third-party services for enhanced functionality.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-6 border-2 border-dashed rounded-lg">
                  <div className="text-center">
                    <Share2 className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Connect External Services</h3>
                    <p className="text-muted-foreground max-w-md">
                      Coming soon: Connect with social media platforms, cloud storage, and other services
                      to streamline your rights management workflow.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
