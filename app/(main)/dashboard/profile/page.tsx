import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/signin');

  return (
    <div className="container py-8 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Profile</h1>
      <p className="text-muted-foreground mb-8">
        Your profile information
      </p>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={session.user.image || undefined} />
              <AvatarFallback className="text-xl">
                {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{session.user.name || 'User'}</CardTitle>
              <CardDescription>{session.user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Manage your profile in Settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
