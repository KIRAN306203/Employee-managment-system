import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Trash2, Mail, Phone, Calendar, ChevronUp, ChevronDown, User } from "lucide-react";
import { format } from "date-fns";

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

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  onView?: (id: string) => void;
  isLoading: boolean;
  sortColumn: keyof Employee;
  sortDirection: "asc" | "desc";
  onSort: (column: keyof Employee) => void;
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  selectedEmployees: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onBulkDelete?: () => void;
  onBulkStatusUpdate?: (status: "active" | "on_leave" | "terminated") => void;
}

export function EmployeeTable({
  employees,
  onEdit,
  onDelete,
  onView,
  isLoading,
  sortColumn,
  sortDirection,
  onSort,
  page,
  pageSize,
  totalCount,
  onPageChange,
  selectedEmployees,
  onSelectionChange,
  onBulkDelete,
  onBulkStatusUpdate,
}: EmployeeTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium">No employees found</p>
          <p className="text-sm">Add your first employee to get started</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  const renderSortIcon = (column: keyof Employee) => {
    if (sortColumn !== column) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="inline-block ml-1 h-3 w-3" />
    ) : (
      <ChevronDown className="inline-block ml-1 h-3 w-3" />
    );
  };

  const handlePrevPage = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) onPageChange(page + 1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(employees.map(emp => emp.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedEmployees, employeeId]);
    } else {
      onSelectionChange(selectedEmployees.filter(id => id !== employeeId));
    }
  };

  const isAllSelected = employees.length > 0 && selectedEmployees.length === employees.length;
  const isIndeterminate = selectedEmployees.length > 0 && selectedEmployees.length < employees.length;

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      {selectedEmployees.length > 0 && (
        <div className="p-4 bg-muted/50 border-b flex items-center justify-between">
          <span className="text-sm font-medium">
            {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            {onBulkStatusUpdate && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkStatusUpdate("active")}
              >
                Set Active
              </Button>
            )}
            {onBulkStatusUpdate && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkStatusUpdate("on_leave")}
              >
                Set On Leave
              </Button>
            )}
            {onBulkDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            )}
          </div>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all employees"
              />
            </TableHead>
            <TableHead
              className="cursor-pointer font-semibold"
              onClick={() => onSort("name")}
            >
              Employee {renderSortIcon("name")}
            </TableHead>
            <TableHead
              className="cursor-pointer font-semibold"
              onClick={() => onSort("position")}
            >
              Position {renderSortIcon("position")}
            </TableHead>
            <TableHead
              className="cursor-pointer font-semibold"
              onClick={() => onSort("department")}
            >
              Department {renderSortIcon("department")}
            </TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Contact</TableHead>
            <TableHead
              className="cursor-pointer font-semibold"
              onClick={() => onSort("hire_date")}
            >
              Hire Date {renderSortIcon("hire_date")}
            </TableHead>
            <TableHead
              className="cursor-pointer font-semibold"
              onClick={() => onSort("salary")}
            >
              Salary {renderSortIcon("salary")}
            </TableHead>
            <TableHead className="text-right font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id} className="hover:bg-muted/30">
              <TableCell>
                <Checkbox
                  checked={selectedEmployees.includes(employee.id)}
                  onCheckedChange={(checked) => handleSelectEmployee(employee.id, checked as boolean)}
                  aria-label={`Select ${employee.name}`}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={employee.avatar_url} alt={employee.name} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-sm text-muted-foreground">{employee.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{employee.position}</Badge>
              </TableCell>
              <TableCell>{employee.department || "-"}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    employee.status === "active" ? "default" :
                    employee.status === "inactive" ? "secondary" :
                    employee.status === "probation" ? "outline" :
                    "destructive"
                  }
                >
                  {employee.status?.charAt(0).toUpperCase() + employee.status?.slice(1) || "Active"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1 text-sm">
                  {employee.phone && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{employee.phone}</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {employee.hire_date && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(employee.hire_date), "MMM dd, yyyy")}</span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                {employee.salary && (
                  <span className="font-medium">
                    ${employee.salary.toLocaleString()}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {onView && (
                    <Button variant="ghost" size="sm" onClick={() => onView(employee.id)} className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => onEdit(employee)} className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(employee.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between p-4">
        <Button onClick={handlePrevPage} disabled={page === 1}>
          Previous
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button onClick={handleNextPage} disabled={page === totalPages}>
          Next
        </Button>
      </div>
    </div>
  );
}
