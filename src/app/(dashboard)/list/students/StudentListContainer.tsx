"use client";

import BulkSelectableTable from "@/components/BulkSelectableTable";
import { exportToCSV } from "@/utils/csvExport";
import { bulkAssignStudentsToClass, bulkDeleteStudents } from "@/lib/actions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface StudentListContainerProps {
  data: any[];
  allIds: (string | number)[];
  children: React.ReactNode;
}

/**
 * Client-side container for the Student List that manages bulk actions.
 * Provides specialized logic for exporting data to CSV and bulk class assignment.
 */
export default function StudentListContainer({ 
  data, 
  allIds, 
  children 
}: StudentListContainerProps) {
  const router = useRouter();

  const handleExport = (ids: (string | number)[]) => {
    const selectedData = data.filter(item => ids.includes(item.id));
    // Flatten data for cleaner CSV (e.g., extract class name)
    const flattenedData = selectedData.map(student => ({
      ID: student.id,
      Username: student.username,
      Name: `${student.name} ${student.surname}`,
      Email: student.email || "N/A",
      Phone: student.phone || "N/A",
      Address: student.address,
      Class: student.class?.name || "N/A"
    }));
    
    exportToCSV(flattenedData, "students_export");
    toast.success(`Successfully exported ${ids.length} records`);
  };

  const handleAssignClass = async (ids: (string | number)[]) => {
    const classIdStr = prompt(`Assign ${ids.length} students to Class ID (number):`);
    if (!classIdStr) return;
    
    const classId = parseInt(classIdStr);
    if (isNaN(classId)) {
      toast.error("Invalid Class ID. Please provide a numeric value.");
      return;
    }

    const loadingToast = toast.loading("Updating records...");
    try {
      const res = await bulkAssignStudentsToClass(ids, classId);
      if (res.success) {
        toast.update(loadingToast, {
          render: res.message,
          type: "success",
          isLoading: false,
          autoClose: 3000
        });
        router.refresh();
      } else {
        toast.update(loadingToast, {
          render: res.message,
          type: "error",
          isLoading: false,
          autoClose: 5000
        });
      }
    } catch (error) {
       toast.update(loadingToast, {
          render: "System error occurred during batch update",
          type: "error",
          isLoading: false,
          autoClose: 5000
        });
    }
  };

  return (
    <BulkSelectableTable
      allIds={allIds}
      tableName="student"
      deleteAction={bulkDeleteStudents}
      onExport={handleExport}
      onAssignClass={handleAssignClass}
    >
      {children}
    </BulkSelectableTable>
  );
}
