import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DepartmentDialog } from "@/components/DepartmentDialog";

interface Department {
  id: string;
  name: string;
  description?: string;
  manager_id?: string;
  created_at: string;
}

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [employeeCounts, setEmployeeCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("name");

      if (error) throw error;

      setDepartments(data || []);

      // Fetch employee counts for each department
      const counts: Record<string, number> = {};
      for (const dept of data || []) {
        const { count } = await supabase
          .from("employee_departments")
          .select("*", { count: "exact", head: true })
          .eq("department_id", dept.id);
        counts[dept.id] = count || 0;
      }
      setEmployeeCounts(counts);
    } catch (error: any) {
      toast.error("Failed to fetch departments", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDepartment = async (data: any) => {
    try {
      if (selectedDepartment) {
        const { error } = await supabase
          .from("departments")
          .update({
            name: data.name,
            description: data.description,
          })
          .eq("id", selectedDepartment.id);

        if (error) throw error;
        toast.success("Department updated successfully");
      } else {
        const { error } = await supabase.from("departments").insert([
          {
            name: data.name,
            description: data.description,
          },
        ]);

        if (error) throw error;
        toast.success("Department created successfully");
      }

      setIsDialogOpen(false);
      setSelectedDepartment(null);
      fetchDepartments();
    } catch (error: any) {
      toast.error("Operation failed", {
        description: error.message,
      });
    }
  };

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return;

    try {
      const { error } = await supabase.from("departments").delete().eq("id", id);

      if (error) throw error;
      toast.success("Department deleted successfully");
      fetchDepartments();
    } catch (error: any) {
      toast.error("Failed to delete department", {
        description: error.message,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Departments</h1>
          <p className="text-muted-foreground">Manage organizational departments</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Department
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((department) => (
          <Card key={department.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle>{department.name}</CardTitle>
                  <CardDescription>{department.description}</CardDescription>
                </div>
                <Badge variant="secondary">{employeeCounts[department.id] || 0} members</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(department)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(department.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DepartmentDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedDepartment(null);
        }}
        department={selectedDepartment}
        onSubmit={handleAddDepartment}
      />
    </div>
  );
}
