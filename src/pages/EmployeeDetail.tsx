import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  DollarSign,
  Briefcase,
  Building2,
  User,
} from "lucide-react";

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
  bio?: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

interface Department {
  id: string;
  name: string;
}

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchEmployeeDetails();
    }
  }, [id]);

  const fetchEmployeeDetails = async () => {
    try {
      const { data: empData, error: empError } = await supabase
        .from("employees")
        .select("*")
        .eq("id", id)
        .single();

      if (empError) throw empError;
      setEmployee(empData);

      // Fetch departments for this employee
      const { data: deptData } = await supabase
        .from("employee_departments")
        .select("department_id, departments(name)")
        .eq("employee_id", id);

      if (deptData) {
        setDepartments(
          deptData.map((d: any) => ({
            id: d.department_id,
            name: d.departments?.name || "Unknown",
          }))
        );
      }
    } catch (error: any) {
      toast.error("Failed to fetch employee details", {
        description: error.message,
      });
      navigate("/employees");
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

  if (!employee) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Employee not found</p>
      </div>
    );
  }

  const statusColors = {
    active: "bg-green-100 text-green-800",
    on_leave: "bg-orange-100 text-orange-800",
    terminated: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/employees")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{employee.name}</h1>
          <p className="text-muted-foreground">{employee.position}</p>
        </div>
        <Badge className={statusColors[employee.status as keyof typeof statusColors]}>
          {employee.status.replace("_", " ")}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{employee.email}</p>
              </div>
            </div>

            {employee.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{employee.phone}</p>
                </div>
              </div>
            )}

            {employee.date_of_birth && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">
                    {new Date(employee.date_of_birth).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {employee.address && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{employee.address}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Employment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Position</p>
                <p className="font-medium">{employee.position}</p>
              </div>
            </div>

            {departments.length > 0 && (
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Departments</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {departments.map((dept) => (
                      <Badge key={dept.id} variant="secondary">
                        {dept.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {employee.hire_date && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Hire Date</p>
                  <p className="font-medium">
                    {new Date(employee.hire_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {employee.salary && (
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Salary</p>
                  <p className="font-medium">
                    ${employee.salary.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {(employee.emergency_contact || employee.emergency_phone) && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {employee.emergency_contact && (
                <div>
                  <p className="text-sm text-muted-foreground">Contact Name</p>
                  <p className="font-medium">{employee.emergency_contact}</p>
                </div>
              )}
              {employee.emergency_phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Contact Phone</p>
                  <p className="font-medium">{employee.emergency_phone}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {employee.bio && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Bio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{employee.bio}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
