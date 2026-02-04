import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/signin');

  return (
    <div className="container py-8 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
      <p className="text-muted-foreground mb-8">
        Manage your account settings
      </p>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue={session.user.name || ''} placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue={session.user.email || ''} type="email" disabled className="opacity-70" />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <Button>Save changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Account and security options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline">Change password</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
