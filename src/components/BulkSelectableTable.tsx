"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import BulkActionBar from "./BulkActionBar";

interface BulkSelectableTableProps {
  children: (props: {
    selectedIds: (string | number)[];
    toggleSelection: (id: string | number) => void;
    isSelected: (id: string | number) => boolean;
    selectAll: (ids: (string | number)[]) => void;
    clearSelection: () => void;
    allSelected: boolean;
    isDeleting: boolean;
  }) => React.ReactNode;
  allIds: (string | number)[];
  tableName: string;
  deleteAction: (ids: (string | number)[]) => Promise<{ success: boolean; error: boolean; message?: string }>;
}

const BulkSelectableTable = ({
  children,
  allIds,
  tableName,
  deleteAction,
}: BulkSelectableTableProps) => {
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const toggleSelection = useCallback((id: string | number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const isSelected = useCallback(
    (id: string | number) => selectedIds.includes(id),
    [selectedIds]
  );

  const selectAll = useCallback((ids: (string | number)[]) => {
    setSelectedIds((prev) =>
      prev.length === ids.length ? [] : [...ids]
    );
  }, []);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const allSelected = selectedIds.length === allIds.length && allIds.length > 0;

  const handleSuccess = () => {
    setIsDeleting(false);
    clearSelection();
    router.refresh();
  };

  return (
    <>
      {children({
        selectedIds,
        toggleSelection,
        isSelected,
        selectAll,
        clearSelection,
        allSelected,
        isDeleting,
      })}
      <BulkActionBar
        selectedIds={selectedIds}
        onClearSelection={clearSelection}
        tableName={tableName}
        deleteAction={async (ids) => {
          setIsDeleting(true);
          const result = await deleteAction(ids);
          if (!result.success) setIsDeleting(false);
          return result;
        }}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default BulkSelectableTable;
