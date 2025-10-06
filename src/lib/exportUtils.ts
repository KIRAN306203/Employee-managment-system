import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';

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
}

export const exportToCSV = (employees: Employee[], filename: string = 'employees') => {
  const csv = Papa.unparse(employees.map(emp => ({
    Name: emp.name,
    Email: emp.email,
    Position: emp.position,
    Department: emp.department || '',
    Phone: emp.phone || '',
    'Hire Date': emp.hire_date || '',
    Salary: emp.salary || '',
    Status: emp.status,
  })));

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (employees: Employee[], filename: string = 'employees') => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(20);
  doc.text('Employee Report', 14, 22);

  // Add date
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);

  // Prepare table data
  const tableData = employees.map(emp => [
    emp.name,
    emp.email,
    emp.position,
    emp.department || '',
    emp.phone || '',
    emp.hire_date || '',
    emp.salary ? `$${emp.salary.toLocaleString()}` : '',
    emp.status,
  ]);

  // Add table
  (doc as jsPDF & { autoTable: Function }).autoTable({
    head: [['Name', 'Email', 'Position', 'Department', 'Phone', 'Hire Date', 'Salary', 'Status']],
    body: tableData,
    startY: 40,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [59, 130, 246], // blue-500
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // gray-50
    },
  });

  doc.save(`${filename}.pdf`);
};
