"use client";

import { useState } from "react";
import { User, Mail, Phone, Bell, Lock, Eye, EyeOff, Camera, Save, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john@university.edu",
    phone: "+1 (555) 123-4567",
    bio: "Computer Science student passionate about tech events and networking.",
    university: "State University",
    graduationYear: "2027",
  });

  const [notifications, setNotifications] = useState({
    emailReminders: true,
    pushNotifications: true,
    eventUpdates: true,
    newEvents: false,
    marketing: false,
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="profile" className="data-[state=active]:bg-background">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-background">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-background">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Avatar */}
          <GlassmorphicCard className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <Button
                  size="icon"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary hover:bg-primary/90"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Profile Photo</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload a photo to personalize your profile
                </p>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm">Upload</Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </GlassmorphicCard>

          {/* Personal Info */}
          <GlassmorphicCard className="p-6">
            <h3 className="font-semibold text-foreground mb-6">Personal Information</h3>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="pl-10 bg-background/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="pl-10 bg-background/50"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="university">University</Label>
                  <Input
                    id="university"
                    value={profile.university}
                    onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="graduationYear">Graduation Year</Label>
                  <Input
                    id="graduationYear"
                    value={profile.graduationYear}
                    onChange={(e) => setProfile({ ...profile, graduationYear: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
              </div>
            </div>
          </GlassmorphicCard>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <GlassmorphicCard className="p-6">
            <h3 className="font-semibold text-foreground mb-6">Email Notifications</h3>
            <div className="space-y-4">
              <NotificationToggle
                title="Event Reminders"
                description="Receive reminders before events you're registered for"
                checked={notifications.emailReminders}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, emailReminders: checked })
                }
              />
              <NotificationToggle
                title="Event Updates"
                description="Get notified when events you're registered for are updated"
                checked={notifications.eventUpdates}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, eventUpdates: checked })
                }
              />
              <NotificationToggle
                title="New Events"
                description="Receive notifications about new events in your interests"
                checked={notifications.newEvents}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, newEvents: checked })
                }
              />
              <NotificationToggle
                title="Marketing Emails"
                description="Receive promotional emails and newsletters"
                checked={notifications.marketing}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, marketing: checked })
                }
              />
            </div>
          </GlassmorphicCard>

          <GlassmorphicCard className="p-6">
            <h3 className="font-semibold text-foreground mb-6">Push Notifications</h3>
            <NotificationToggle
              title="Enable Push Notifications"
              description="Receive real-time notifications on your device"
              checked={notifications.pushNotifications}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, pushNotifications: checked })
              }
            />
          </GlassmorphicCard>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <GlassmorphicCard className="p-6">
            <h3 className="font-semibold text-foreground mb-6">Change Password</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    className="pl-10 pr-10 bg-background/50"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="pl-10 bg-background/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    className="pl-10 bg-background/50"
                  />
                </div>
              </div>

              <Button className="bg-primary hover:bg-primary/90">
                Update Password
              </Button>
            </div>
          </GlassmorphicCard>

          <GlassmorphicCard className="p-6">
            <h3 className="font-semibold text-foreground mb-2">Delete Account</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
              Delete Account
            </Button>
          </GlassmorphicCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationToggle({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
