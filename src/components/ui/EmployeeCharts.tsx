import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface DepartmentData {
  name: string;
  count: number;
}

interface StatusData {
  name: string;
  value: number;
}

interface EmployeeChartsProps {
  departmentData: DepartmentData[];
  statusData: StatusData[];
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#a4de6c"];

export const EmployeeCharts: React.FC<EmployeeChartsProps> = ({ departmentData, statusData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Employees by Department</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={departmentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Employees by Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#82ca9d"
              label
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
