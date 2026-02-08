"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#fafafa]">System Settings</h1>
        <p className="text-[#737373] mt-2">Configure system-wide settings and preferences</p>
      </div>

      <div className="grid gap-6">
        <Card className="bg-[#171717] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-[#fafafa]">Site Configuration</CardTitle>
            <CardDescription className="text-[#737373]">
              Manage basic site settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#e5e5e5]">Site Name</Label>
              <Input 
                placeholder="Vixle" 
                className="bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#e5e5e5]">Site Description</Label>
              <Textarea
                placeholder="Build and deploy beautiful websites..."
                className="bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#171717] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-[#fafafa]">Access Control</CardTitle>
            <CardDescription className="text-[#737373]">
              Control user registration and access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-[#e5e5e5]">Allow Registration</Label>
                <p className="text-sm text-[#737373]">Enable new user sign-ups</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-[#e5e5e5]">Maintenance Mode</Label>
                <p className="text-sm text-[#737373]">Restrict access to admins only</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-[#e5e5e5]">Email Verification</Label>
                <p className="text-sm text-[#737373]">Require email verification</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#171717] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-[#fafafa]">Email Configuration</CardTitle>
            <CardDescription className="text-[#737373]">
              Configure email service settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#e5e5e5]">From Email</Label>
              <Input 
                type="email"
                placeholder="noreply@vixle.app" 
                className="bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#e5e5e5]">From Name</Label>
              <Input 
                placeholder="Vixle" 
                className="bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
              />
            </div>
          </CardContent>
        </Card>

        <Button className="bg-blue-600 hover:bg-blue-700 w-fit">
          Save Settings
        </Button>
      </div>
    </div>
  );
}
