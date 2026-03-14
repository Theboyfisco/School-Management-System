"use client";

import BulkSelectableTable from "@/components/BulkSelectableTable";
import { exportToCSV } from "@/utils/csvExport";
import { bulkDeleteTeachers } from "@/lib/actions";
import { toast } from "react-toastify";

interface TeacherListContainerProps {
  data: any[];
  allIds: (string | number)[];
  children: React.ReactNode;
}

/**
 * Client-side container for the Teacher List that manages bulk actions.
 * Provides specialized logic for exporting data to CSV.
 */
export default function TeacherListContainer({ 
  data, 
  allIds, 
  children 
}: TeacherListContainerProps) {
  const handleExport = (ids: (string | number)[]) => {
    const selectedData = data.filter(item => ids.includes(item.id));
    // Flatten data for cleaner CSV
    const flattenedData = selectedData.map(teacher => ({
      ID: teacher.id,
      Username: teacher.username,
      Name: `${teacher.name} ${teacher.surname}`,
      Email: teacher.email || "N/A",
      Phone: teacher.phone || "N/A",
      Address: teacher.address,
      Subjects: teacher.subjects.map((s: any) => s.name).join("; "),
      Classes: teacher.classes.map((c: any) => c.name).join("; ")
    }));
    
    exportToCSV(flattenedData, "teachers_export");
    toast.success(`Successfully exported ${ids.length} records`);
  };

  return (
    <BulkSelectableTable
      allIds={allIds}
      tableName="teacher"
      deleteAction={bulkDeleteTeachers}
      onExport={handleExport}
    >
      {children}
    </BulkSelectableTable>
  );
}
