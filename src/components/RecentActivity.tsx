import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, UserCheck, UserX, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Activity {
  id: string;
  type: 'hire' | 'status_change' | 'update';
  employee_name: string;
  details: string;
  created_at: string;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    try {
      // For demo purposes, we'll create mock activities based on recent employees
      // In a real app, you'd have an activities table
      const { data: employees, error } = await supabase
        .from("employees")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      // Create mock activities from recent employees
      const mockActivities: Activity[] = employees?.map((emp, index) => ({
        id: `activity-${emp.id}`,
        type: index === 0 ? 'hire' : index === 1 ? 'status_change' : 'update',
        employee_name: emp.name,
        details: index === 0
          ? `New employee hired as ${emp.position}`
          : index === 1
          ? `Status changed to ${emp.status}`
          : `Profile updated`,
        created_at: emp.created_at,
      })) || [];

      setActivities(mockActivities);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'hire':
        return <UserPlus className="h-4 w-4 text-green-600" />;
      case 'status_change':
        return <UserCheck className="h-4 w-4 text-blue-600" />;
      case 'update':
        return <UserX className="h-4 w-4 text-orange-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'hire':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">New Hire</Badge>;
      case 'status_change':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Status Change</Badge>;
      case 'update':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Updated</Badge>;
      default:
        return <Badge variant="secondary">Activity</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent activity to display
            </p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {activity.employee_name}
                    </p>
                    {getActivityBadge(activity.type)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.details}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {format(new Date(activity.created_at), "MMM dd, yyyy 'at' HH:mm")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
