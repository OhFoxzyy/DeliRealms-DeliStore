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
  BarChart3,
  Flag,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  isBanned: boolean;
  lastLoginAt: Date | null;
  lastLoginIp: string | null;
  createdAt: Date;
  _count?: {
    projects: number;
    components: number;
    loginHistory: number;
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
  bannedUsers: number;
  flaggedContent: number;
}

interface AuditLog {
  id: string;
  action: string;
  userId: string | null;
  details: any;
  ipAddress: string | null;
  createdAt: Date;
  user?: {
    email: string | null;
    name: string | null;
  };
}

interface FlaggedContent {
  id: string;
  contentType: string;
  contentId: string;
  reason: string;
  status: string;
  reportedBy: string;
  createdAt: Date;
  reporter: {
    email: string | null;
    name: string | null;
  };
}

export function ComprehensiveManagementDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [userToBan, setUserToBan] = useState<User | null>(null);
  const [banReason, setBanReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, projectsRes, auditRes, flaggedRes] = await Promise.all([
        fetch('/api/management/stats'),
        fetch('/api/management/users'),
        fetch('/api/management/projects'),
        fetch('/api/management/audit-logs'),
        fetch('/api/management/flagged-content'),
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
      if (auditRes.ok) {
        setAuditLogs(await auditRes.json());
      }
      if (flaggedRes.ok) {
        setFlaggedContent(await flaggedRes.json());
      }
    } catch (error) {
      console.error('[v0] Error fetching management data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/management/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error('Failed to update role');
      
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success('User role updated successfully');
      await fetchData();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const handleBanUser = async () => {
    if (!userToBan) return;
    
    try {
      const response = await fetch(`/api/management/users/${userToBan.id}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: banReason }),
      });

      if (!response.ok) throw new Error('Failed to ban user');
      
      setUsers(users.map(u => u.id === userToBan.id ? { ...u, isBanned: true } : u));
      setBanDialogOpen(false);
      setUserToBan(null);
      setBanReason('');
      toast.success('User banned successfully');
      await fetchData();
    } catch (error) {
      toast.error('Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/management/users/${userId}/unban`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to unban user');
      
      setUsers(users.map(u => u.id === userId ? { ...u, isBanned: false } : u));
      toast.success('User unbanned successfully');
      await fetchData();
    } catch (error) {
      toast.error('Failed to unban user');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/management/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete project');
      
      setProjects(projects.filter(p => p.id !== projectId));
      toast.success('Project deleted successfully');
      await fetchData();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleModerateContent = async (contentId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/management/flagged-content/${contentId}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) throw new Error('Failed to moderate content');
      
      setFlaggedContent(flaggedContent.map(c => 
        c.id === contentId ? { ...c, status: action === 'approve' ? 'approved' : 'rejected' } : c
      ));
      toast.success(`Content ${action}d successfully`);
      await fetchData();
    } catch (error) {
      toast.error('Failed to moderate content');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Analytics data
  const userGrowthData = [
    { month: 'Jan', users: 45 },
    { month: 'Feb', users: 52 },
    { month: 'Mar', users: 68 },
    { month: 'Apr', users: 81 },
    { month: 'May', users: 95 },
    { month: 'Jun', users: stats?.totalUsers || 100 },
  ];

  const roleDistribution = [
    { name: 'Hobby', value: users.filter(u => u.role === 'hobby').length, color: '#3b82f6' },
    { name: 'Pro', value: users.filter(u => u.role === 'pro').length, color: '#8b5cf6' },
    { name: 'Elite', value: users.filter(u => u.role === 'elite').length, color: '#ec4899' },
    { name: 'Admin', value: users.filter(u => u.role === 'admin').length, color: '#f59e0b' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Activity className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading management dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Management Dashboard</h1>
          <p className="text-muted-foreground mt-2">Monitor and manage your platform</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {stats.activeUsers} active
                </Badge>
                <Badge variant="destructive" className="gap-1">
                  {stats.bannedUsers} banned
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.publishedProjects} published
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Content</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPages}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalComponents} components
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border border-amber-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
              <Flag className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{stats.flaggedContent}</div>
              <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="projects" className="gap-2">
            <Globe className="h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="moderation" className="gap-2">
            <Flag className="h-4 w-4" />
            Moderation
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <Shield className="h-4 w-4" />
            Audit Logs
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Total registered users over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={userGrowthData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis dataKey="month" stroke="#737373" />
                    <YAxis stroke="#737373" />
                    <Tooltip
                      contentStyle={{ background: '#0a0a0a', border: '1px solid #262626' }}
                      labelStyle={{ color: '#fafafa' }}
                    />
                    <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Role Distribution</CardTitle>
                <CardDescription>User distribution by subscription tier</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={roleDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {roleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#0a0a0a', border: '1px solid #262626' }}
                      labelStyle={{ color: '#fafafa' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system events and user actions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {auditLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card/50">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{log.action.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.user?.email || 'System'} • {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {log.ipAddress && (
                        <Badge variant="outline" className="gap-1">
                          <MapPin className="h-3 w-3" />
                          {log.ipAddress}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All roles</SelectItem>
                      <SelectItem value="hobby">Hobby</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="elite">Elite</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{user.name || 'Unnamed User'}</span>
                            {user.isBanned && (
                              <Badge variant="destructive" className="gap-1">
                                <Ban className="h-3 w-3" />
                                Banned
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {user._count?.projects || 0} projects
                            </span>
                            <span className="flex items-center gap-1">
                              <Component className="h-3 w-3" />
                              {user._count?.components || 0} components
                            </span>
                            {user.lastLoginIp && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {user.lastLoginIp}
                              </span>
                            )}
                            {user.lastLoginAt && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Last login {new Date(user.lastLoginAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <Select
                          value={user.role}
                          onValueChange={(v) => handleRoleChange(user.id, v)}
                          disabled={user.isBanned}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hobby">Hobby</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="elite">Elite</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                          {user.isBanned ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnbanUser(user.id)}
                              className="gap-2 border-green-500/50 text-green-500 hover:bg-green-500/10"
                            >
                              <Unlock className="h-4 w-4" />
                              Unban
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setUserToBan(user);
                                setBanDialogOpen(true);
                              }}
                              className="gap-2 border-red-500/50 text-red-500 hover:bg-red-500/10"
                            >
                              <Ban className="h-4 w-4" />
                              Ban
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

        <TabsContent value="projects" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Management</CardTitle>
              <CardDescription>View and manage all projects</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{project.name}</span>
                            {project.isPublished ? (
                              <Badge variant="secondary" className="gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Published
                              </Badge>
                            ) : (
                              <Badge variant="outline">Draft</Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Owner: {project.user.name || project.user.email}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Created: {new Date(project.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/dashboard/projects/${project.id}`, '_blank')}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteProject(project.id)}
                            className="gap-2 border-red-500/50 text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation</CardTitle>
              <CardDescription>Review and moderate flagged content</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {flaggedContent.filter(c => c.status === 'pending').map((content) => (
                    <div
                      key={content.id}
                      className="p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-start gap-4">
                        <Flag className="h-5 w-5 text-amber-500 mt-1" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{content.contentType}</Badge>
                            <Badge variant="secondary">{content.status}</Badge>
                          </div>
                          <p className="text-sm mb-2">{content.reason}</p>
                          <div className="text-xs text-muted-foreground">
                            Reported by {content.reporter.name || content.reporter.email} • {new Date(content.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleModerateContent(content.id, 'approve')}
                            className="gap-2 border-green-500/50 text-green-500 hover:bg-green-500/10"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleModerateContent(content.id, 'reject')}
                            className="gap-2 border-red-500/50 text-red-500 hover:bg-red-500/10"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {flaggedContent.filter(c => c.status === 'pending').length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Flag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No pending content to moderate</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>Complete history of system events and admin actions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-start gap-4">
                        <Shield className="h-5 w-5 text-blue-500 mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium mb-1">{log.action.replace(/_/g, ' ')}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{log.user?.email || 'System'}</span>
                            <span>•</span>
                            <span>{new Date(log.createdAt).toLocaleString()}</span>
                            {log.ipAddress && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {log.ipAddress}
                                </span>
                              </>
                            )}
                          </div>
                          {log.details && (
                            <div className="mt-2 p-2 rounded bg-muted/50 text-xs font-mono">
                              {JSON.stringify(log.details, null, 2)}
                            </div>
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

        <TabsContent value="settings" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure platform-wide settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <Label className="text-base">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Disable site access for non-admin users
                    </p>
                  </div>
                  <Button variant="outline">Disabled</Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <Label className="text-base">New Registrations</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Allow new user account creation
                    </p>
                  </div>
                  <Button variant="outline">Enabled</Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <Label className="text-base">IP Tracking</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Track user IP addresses for abuse detection
                    </p>
                  </div>
                  <Button variant="outline">Enabled</Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <Label className="text-base">Auto-Moderation</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Automatically flag suspicious content
                    </p>
                  </div>
                  <Button variant="outline">Enabled</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              This will prevent the user from accessing their account. You can unban them later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>User</Label>
              <div className="text-sm text-muted-foreground mt-1">
                {userToBan?.name || userToBan?.email}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason for ban</Label>
              <Textarea
                placeholder="Enter the reason for banning this user..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBanUser}
              variant="destructive"
              disabled={!banReason.trim()}
            >
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Missing import
import { Download } from 'lucide-react';
