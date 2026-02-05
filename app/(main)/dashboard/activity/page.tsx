"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Activity, Rocket, FileEdit, Search, Download, Filter, Calendar, FolderOpen } from 'lucide-react';
import { useActivityData } from '@/hooks/use-activity-data';

type ActivityType = 'all' | 'deployment' | 'page' | 'project';
type GroupBy = 'none' | 'project' | 'date' | 'type';

export default function ActivityPage() {
  const { activities, loading } = useActivityData();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ActivityType>('all');
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  const projects = useMemo(() => {
    const projectSet = new Set(activities.map(a => a.project));
    return Array.from(projectSet).sort();
  }, [activities]);

  const filteredActivities = useMemo(() => {
    let filtered = activities;

    if (searchQuery) {
      filtered = filtered.filter(a => 
        a.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(a => a.type === typeFilter);
    }

    if (projectFilter !== 'all') {
      filtered = filtered.filter(a => a.project === projectFilter);
    }

    return filtered;
  }, [activities, searchQuery, typeFilter, projectFilter]);

  const groupedActivities = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All': filteredActivities };
    }

    const grouped: Record<string, typeof filteredActivities> = {};
    
    filteredActivities.forEach(activity => {
      let key: string;
      if (groupBy === 'project') {
        key = activity.project;
      } else if (groupBy === 'date') {
        const date = new Date(activity.time);
        key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      } else if (groupBy === 'type') {
        key = activity.type.charAt(0).toUpperCase() + activity.type.slice(1);
      } else {
        key = 'All';
      }
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(activity);
    });

    return grouped;
  }, [filteredActivities, groupBy]);

  const handleExport = () => {
    const csv = [
      ['Type', 'Project', 'Time', 'Date'].join(','),
      ...filteredActivities.map(a => [
        a.type,
        a.project,
        formatTime(a.time),
        new Date(a.time).toISOString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container py-8 px-4">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-96 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Activity</h1>
          <p className="text-muted-foreground">
            Track and manage activity across your projects
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ActivityType)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deployment">Deployments</SelectItem>
                <SelectItem value="page">Pages</SelectItem>
                <SelectItem value="project">Projects</SelectItem>
              </SelectContent>
            </Select>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
              <SelectTrigger>
                <SelectValue placeholder="Group by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Grouping</SelectItem>
                <SelectItem value="project">By Project</SelectItem>
                <SelectItem value="date">By Date</SelectItem>
                <SelectItem value="type">By Type</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Feed
              </CardTitle>
              <CardDescription>
                {filteredActivities.length} activity{filteredActivities.length !== 1 ? 'ies' : ''} found
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No activities found</p>
              {searchQuery || typeFilter !== 'all' || projectFilter !== 'all' ? (
                <Button variant="outline" className="mt-4" onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('all');
                  setProjectFilter('all');
                }}>
                  Clear Filters
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedActivities).map(([groupKey, groupActivities]) => (
                <div key={groupKey}>
                  {groupBy !== 'none' && (
                    <div className="flex items-center gap-2 mb-4">
                      {groupBy === 'date' && <Calendar className="h-4 w-4 text-muted-foreground" />}
                      {groupBy === 'project' && <FolderOpen className="h-4 w-4 text-muted-foreground" />}
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        {groupKey}
                      </h3>
                      <Badge variant="secondary" className="ml-2">
                        {groupActivities.length}
                      </Badge>
                    </div>
                  )}
                  <div className="space-y-2">
                    {groupActivities.map((activity, i) => (
                      <Link
                        key={`${activity.projectId}-${activity.type}-${i}`}
                        href={`/dashboard/projects/${activity.projectId}`}
                        className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                      >
                        <div className="flex-shrink-0">
                          {activity.type === 'deployment' ? (
                            <Rocket className="h-4 w-4 text-blue-500" />
                          ) : activity.type === 'page' ? (
                            <FileEdit className="h-4 w-4 text-green-500" />
                          ) : (
                            <Activity className="h-4 w-4 text-purple-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">
                              {activity.type === 'deployment' ? 'Deployment' : 
                               activity.type === 'page' ? 'Page updated' : 
                               'Project updated'} in {activity.project}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {activity.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTime(activity.time)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return d.toLocaleDateString();
}
