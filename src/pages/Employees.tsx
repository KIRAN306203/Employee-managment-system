import { useState, useEffect, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { EmployeeTable } from "@/components/EmployeeTable";
import { EmployeeDialog } from "@/components/EmployeeDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  department?: string;
  phone?: string;
  hire_date?: string;
  salary?: number;
  status: string;
  avatar_url?: string;
}

interface EmployeeFormData {
  name: string;
  email: string;
  position: string;
  department?: string;
  phone?: string;
  hire_date?: Date;
  salary?: string;
  status: "active" | "on_leave" | "terminated";
  avatar_url?: string;
}

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortColumn, setSortColumn] = useState<keyof Employee>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, [page, sortColumn, sortDirection, searchQuery]);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("employees")
        .select("*", { count: "exact" })
        .order(sortColumn, { ascending: sortDirection === "asc" })
        .range(from, to);

      if (searchQuery.trim()) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      setEmployees(data || []);
      setTotalCount(count || 0);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("Failed to fetch employees", {
          description: error.message,
        });
      } else {
        toast.error("Failed to fetch employees");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleAddEmployee = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    try {
      const employeeData = {
        name: data.name,
        email: data.email,
        position: data.position,
        department: data.department || null,
        phone: data.phone || null,
        hire_date: data.hire_date ? data.hire_date.toISOString().split("T")[0] : null,
        salary: data.salary ? parseFloat(data.salary) : null,
        status: data.status || "active",
      };

      if (selectedEmployee) {
        const { error } = await supabase
          .from("employees")
          .update(employeeData)
          .eq("id", selectedEmployee.id);

        if (error) throw error;
        toast.success("Employee updated successfully");
      } else {
        const { error } = await supabase.from("employees").insert([employeeData]);

        if (error) throw error;
        toast.success("Employee added successfully");
      }

      setIsDialogOpen(false);
      setSelectedEmployee(null);
      fetchEmployees();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("Operation failed", {
          description: error.message,
        });
      } else {
        toast.error("Operation failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase.from("employees").delete().eq("id", id);

      if (error) throw error;
      toast.success("Employee deleted successfully");
      fetchEmployees();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("Failed to delete employee", {
          description: error.message,
        });
      } else {
        toast.error("Failed to delete employee");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEmployees.length === 0) return;

    setIsBulkDeleting(true);
    try {
      const { error } = await supabase
        .from("employees")
        .delete()
        .in("id", selectedEmployees);

      if (error) throw error;

      toast.success(`${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''} deleted successfully`);
      setSelectedEmployees([]);
      fetchEmployees();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("Failed to delete employees", {
          description: error.message,
        });
      } else {
        toast.error("Failed to delete employees");
      }
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleBulkStatusUpdate = async (status: "active" | "on_leave" | "terminated") => {
    if (selectedEmployees.length === 0) return;

    setIsBulkUpdating(true);
    try {
      const { error } = await supabase
        .from("employees")
        .update({ status })
        .in("id", selectedEmployees);

      if (error) throw error;

      toast.success(`${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''} status updated to ${status}`);
      setSelectedEmployees([]);
      fetchEmployees();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("Failed to update employee status", {
          description: error.message,
        });
      } else {
        toast.error("Failed to update employee status");
      }
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDialogOpen(true);
  };

  const handleViewEmployee = (id: string) => {
    navigate(`/employees/${id}`);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedEmployee(null);
    }
  };

  const handleSort = (column: keyof Employee) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedEmployees(selectedIds);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground">Manage your team members</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, position, or department..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {employees.length} {employees.length === 1 ? "employee" : "employees"}
        </div>
      </div>

      <EmployeeTable
        employees={employees}
        onEdit={handleEditEmployee}
        onDelete={handleDeleteEmployee}
        onView={handleViewEmployee}
        isLoading={isLoading}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        selectedEmployees={selectedEmployees}
        onSelectionChange={handleSelectionChange}
        onBulkDelete={handleBulkDelete}
        onBulkStatusUpdate={handleBulkStatusUpdate}
      />

      <EmployeeDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        employee={selectedEmployee}
        onSubmit={handleAddEmployee}
        isLoading={isSubmitting}
      />
    </div>
  );
}
