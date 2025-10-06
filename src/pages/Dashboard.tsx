import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, UserCheck, UserX } from "lucide-react";
import { EmployeeCharts } from "@/components/ui/EmployeeCharts";
import { RecentActivity } from "@/components/RecentActivity";

interface Stats {
  totalEmployees: number;
  activeEmployees: number;
  totalDepartments: number;
  onLeave: number;
}

interface DepartmentData {
  name: string;
  count: number;
}

interface StatusData {
  name: string;
  value: number;
}

export default function Dashboard() {
  const { role, user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalEmployees: 0,
    activeEmployees: 0,
    totalDepartments: 0,
    onLeave: 0,
  });
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [employeesRes, departmentsRes] = await Promise.all([
        supabase.from("employees").select("status, department", { count: "exact" }),
        supabase.from("departments").select("*", { count: "exact" }),
      ]);

      const employees = employeesRes.data || [];
      const activeCount = employees.filter((e) => e.status === "active").length;
      const onLeaveCount = employees.filter((e) => e.status === "on_leave").length;

      setStats({
        totalEmployees: employeesRes.count || 0,
        activeEmployees: activeCount,
        totalDepartments: departmentsRes.count || 0,
        onLeave: onLeaveCount,
      });

      // Calculate department counts
      const deptCounts: { [key: string]: number } = {};
      employees.forEach((e) => {
        const dept = e.department || "Unknown";
        deptCounts[dept] = (deptCounts[dept] || 0) + 1;
      });
      const deptDataArray = Object.entries(deptCounts).map(([name, count]) => ({ name, count }));
      setDepartmentData(deptDataArray);

      // Calculate status counts
      const statusCounts: { [key: string]: number } = {};
      employees.forEach((e) => {
        const status = e.status || "Unknown";
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      const statusDataArray = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
      setStatusData(statusDataArray);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your organization.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Employees",
            value: stats.totalEmployees,
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
          },
          {
            title: "Active Employees",
            value: stats.activeEmployees,
            icon: UserCheck,
            color: "text-green-600",
            bgColor: "bg-green-100",
          },
          {
            title: "Departments",
            value: stats.totalDepartments,
            icon: Building2,
            color: "text-purple-600",
            bgColor: "bg-purple-100",
          },
          {
            title: "On Leave",
            value: stats.onLeave,
            icon: UserX,
            color: "text-orange-600",
            bgColor: "bg-orange-100",
          },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <EmployeeCharts departmentData={departmentData} statusData={statusData} />

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {role === "admin" || role === "manager" ? (
              <p>
                Navigate to Employees or Departments to manage your organization's
                data.
              </p>
            ) : (
              <p>View your profile to see your details and department information.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
