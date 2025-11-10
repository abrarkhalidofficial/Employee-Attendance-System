"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { TaskCard } from "@/components/common/task-card";
import { TaskFormDialog } from "@/components/common/task-form-dialog";
import { TaskDetailsDialog } from "@/components/common/task-details-dialog";
import { useSession } from "@/components/providers/session-provider";
import {
  Plus,
  Search,
  ListTodo,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export default function AdminTasksPage() {
  const router = useRouter();
  const { user, hydrated } = useSession();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!hydrated) return;
    if (!user || user.role !== "admin") {
      router.replace("/");
    }
  }, [hydrated, router, user]);

  const tasks = useQuery(
    api.tasks.getAll,
    user ? { userId: user._id as Id<"users"> } : "skip"
  );

  const stats = useQuery(
    api.tasks.getTaskStats,
    user ? { userId: user._id as Id<"users"> } : "skip"
  );

  if (!hydrated || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const handleEdit = (task: any) => {
    setSelectedTask(task);
    setShowEditDialog(true);
  };

  const handleViewDetails = (task: any) => {
    setSelectedTask(task);
    setShowDetailsDialog(true);
  };

  const filteredTasks = tasks?.filter((task) => {
    // Filter by tab
    if (activeTab !== "all" && task.status !== activeTab) {
      return false;
    }

    // Filter by priority
    if (priorityFilter !== "all" && task.priority !== priorityFilter) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.assignedToName.toLowerCase().includes(query) ||
        task.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b shadow-sm sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                📋 Task Management
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage and track all tasks across the organization
              </p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-blue-500" />
                Total Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.total || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.pending || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.completed || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Overdue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.overdue || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">🔴 Urgent</SelectItem>
              <SelectItem value="high">🟠 High</SelectItem>
              <SelectItem value="medium">🟡 Medium</SelectItem>
              <SelectItem value="low">🟢 Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {!filteredTasks || filteredTasks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ListTodo className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">
                    No tasks found
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activeTab === "all"
                      ? "Create your first task to get started"
                      : `No ${activeTab} tasks at the moment`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    userId={user._id as Id<"users">}
                    userRole="admin"
                    onEdit={handleEdit}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <TaskFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        assignedBy={user._id as Id<"users">}
        mode="create"
      />

      <TaskFormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        assignedBy={user._id as Id<"users">}
        taskToEdit={selectedTask}
        mode="edit"
      />

      <TaskDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        task={selectedTask}
        userId={user._id as Id<"users">}
        userName={user.name}
        userRole="admin"
      />
    </div>
  );
}
