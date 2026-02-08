"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import {
  Users,
  Shield,
  Database,
  Activity,
  Settings,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  FileText,
  Component,
  Globe,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Trash2,
  Edit,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: Date;
  _count?: {
    projects: number;
    components: number;
  };
}

interface Project {
  id: string;
  name: string;
  userId: string;
  isPublished: boolean;
  createdAt: Date;
  user: {
    name: string | null;
    email: string | null;
  };
}

interface Stats {
  totalUsers: number;
  totalProjects: number;
  totalPages: number;
  totalComponents: number;
  activeUsers: number;
  publishedProjects: number;
}

export function ComprehensiveAdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [userToBan, setUserToBan] = useState<User | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, projectsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/projects'),
      ]);

      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
      if (usersRes.ok) {
        setUsers(await usersRes.json());
      }
      if (projectsRes.ok) {
        setProjects(await projectsRes.json());
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error('Failed to update role');
      
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success('User role updated');
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const handleBanUser = async (userId: string, reason: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('Failed to ban user');
      
      setUsers(users.map(u => u.id === userId ? { ...u, role: 'banned' } : u));
      setBanDialogOpen(false);
      setUserToBan(null);
      toast.success('User banned');
    } catch (error) {
      toast.error('Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/unban`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to unban user');
      
      setUsers(users.map(u => u.id === userId ? { ...u, role: 'hobby' } : u));
      toast.success('User unbanned');
    } catch (error) {
      toast.error('Failed to unban user');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete project');
      
      setProjects(projects.filter(p => p.id !== projectId));
      toast.success('Project deleted');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[#737373]">Loading admin dashboard...</div>;
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#fafafa]">Admin Dashboard</h1>
        <p className="text-[#737373] mt-2">Manage users, projects, and system settings</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#171717] border-[#262626]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#a3a3a3]">Total Users</CardTitle>
              <Users className="h-4 w-4 text-[#737373]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#fafafa]">{stats.totalUsers}</div>
              <p className="text-xs text-[#737373] mt-1">{stats.activeUsers} active</p>
            </CardContent>
          </Card>

          <Card className="bg-[#171717] border-[#262626]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#a3a3a3]">Total Projects</CardTitle>
              <Globe className="h-4 w-4 text-[#737373]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#fafafa]">{stats.totalProjects}</div>
              <p className="text-xs text-[#737373] mt-1">{stats.publishedProjects} published</p>
            </CardContent>
          </Card>

          <Card className="bg-[#171717] border-[#262626]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#a3a3a3]">Total Pages</CardTitle>
              <FileText className="h-4 w-4 text-[#737373]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#fafafa]">{stats.totalPages}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#171717] border-[#262626]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#a3a3a3]">Components</CardTitle>
              <Component className="h-4 w-4 text-[#737373]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#fafafa]">{stats.totalComponents}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[#0f0f0f] border-[#262626]">
          <TabsTrigger value="users" className="data-[state=active]:bg-[#171717]">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="projects" className="data-[state=active]:bg-[#171717]">
            <Globe className="h-4 w-4 mr-2" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="permissions" className="data-[state=active]:bg-[#171717]">
            <Shield className="h-4 w-4 mr-2" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-[#171717]">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Card className="bg-[#171717] border-[#262626]">
            <CardHeader>
              <CardTitle className="text-[#fafafa]">User Management</CardTitle>
              <CardDescription className="text-[#737373]">
                Manage user accounts, roles, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 rounded-lg border border-[#262626] bg-[#0f0f0f] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-[#fafafa]">
                            {user.name || 'Unnamed User'}
                          </div>
                          <div className="text-xs text-[#737373] truncate">{user.email}</div>
                          <div className="text-xs text-[#525252] mt-1">
                            {user._count?.projects || 0} projects • {user._count?.components || 0} components
                          </div>
                        </div>
                        <Select
                          value={user.role}
                          onValueChange={(v) => handleRoleChange(user.id, v)}
                        >
                          <SelectTrigger className="w-32 bg-[#171717] border-[#262626]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hobby">Hobby</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="elite">Elite</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="banned">Banned</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                          {user.role === 'banned' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnbanUser(user.id)}
                              className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                            >
                              <Unlock className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setUserToBan(user);
                                setBanDialogOpen(true);
                              }}
                              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-4">
          <Card className="bg-[#171717] border-[#262626]">
            <CardHeader>
              <CardTitle className="text-[#fafafa]">Project Management</CardTitle>
              <CardDescription className="text-[#737373]">
                View and manage all projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="p-4 rounded-lg border border-[#262626] bg-[#0f0f0f] flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-[#fafafa]">{project.name}</span>
                          {project.isPublished ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                              Published
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50">
                              Draft
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-[#737373]">
                          Owner: {project.user.name || project.user.email}
                        </div>
                        <div className="text-xs text-[#525252] mt-1">
                          Created: {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/dashboard/projects/${project.id}`, '_blank')}
                          className="border-[#262626]"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProject(project.id)}
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="mt-4">
          <Card className="bg-[#171717] border-[#262626]">
            <CardHeader>
              <CardTitle className="text-[#fafafa]">Permission Management</CardTitle>
              <CardDescription className="text-[#737373]">
                Configure role-based permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['hobby', 'pro', 'elite', 'admin'].map((role) => (
                  <div key={role} className="p-4 rounded-lg border border-[#262626] bg-[#0f0f0f]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-[#fafafa] capitalize">{role}</h3>
                      <Badge>{users.filter(u => u.role === role).length} users</Badge>
                    </div>
                    <div className="space-y-2 text-sm text-[#a3a3a3]">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span>Create projects</span>
                      </div>
                      {role !== 'hobby' && (
                        <>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span>Custom domains</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span>Advanced components</span>
                          </div>
                        </>
                      )}
                      {role === 'admin' && (
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-purple-400" />
                          <span>Admin access</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card className="bg-[#171717] border-[#262626]">
            <CardHeader>
              <CardTitle className="text-[#fafafa]">System Settings</CardTitle>
              <CardDescription className="text-[#737373]">
                Configure system-wide settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[#e5e5e5]">Maintenance Mode</Label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="border-[#262626]">
                    Enable
                  </Button>
                  <span className="text-sm text-[#737373]">Disable site access for non-admins</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[#e5e5e5]">Registration</Label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="border-[#262626]">
                    Enable
                  </Button>
                  <span className="text-sm text-[#737373]">Allow new user registrations</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent className="bg-[#171717] border-[#262626]">
          <DialogHeader>
            <DialogTitle className="text-[#fafafa]">Ban User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-[#e5e5e5]">User</Label>
              <div className="text-sm text-[#a3a3a3] mt-1">
                {userToBan?.name || userToBan?.email}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[#e5e5e5]">Reason</Label>
              <Textarea
                placeholder="Enter reason for banning..."
                className="bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => userToBan && handleBanUser(userToBan.id, 'Violation of terms')}
              className="bg-red-600 hover:bg-red-700"
            >
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
