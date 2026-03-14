"use client";

import { useState, useCallback, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import BulkActionBar from "./BulkActionBar";

interface BulkSelectionContextType {
  selectedIds: (string | number)[];
  toggleSelection: (id: string | number) => void;
  isSelected: (id: string | number) => boolean;
  selectAll: (ids: (string | number)[]) => void;
  clearSelection: () => void;
  allSelected: boolean;
  isDeleting: boolean;
}

const BulkSelectionContext = createContext<BulkSelectionContextType | undefined>(undefined);

export const useBulkSelection = () => {
  const context = useContext(BulkSelectionContext);
  if (!context) {
    throw new Error("useBulkSelection must be used within a BulkSelectableTable");
  }
  return context;
};

interface BulkSelectableTableProps {
  children: React.ReactNode;
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
    <BulkSelectionContext.Provider
      value={{
        selectedIds,
        toggleSelection,
        isSelected,
        selectAll,
        clearSelection,
        allSelected,
        isDeleting,
      }}
    >
      {children}
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
    </BulkSelectionContext.Provider>
  );
};

export const BulkSelectionCheckbox = ({ id }: { id: string | number }) => {
  const { isSelected, toggleSelection } = useBulkSelection();
  return (
    <label className="relative flex items-center justify-center cursor-pointer">
      <input
        type="checkbox"
        checked={isSelected(id)}
        onChange={() => toggleSelection(id)}
        className="peer sr-only"
      />
      <div className="w-5 h-5 rounded-md border-2 border-surface-300 dark:border-surface-600 peer-checked:border-primary-500 peer-checked:bg-primary-500 transition-all duration-200 flex items-center justify-center">
        {isSelected(id) && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        )}
      </div>
    </label>
  );
};

export const BulkSelectionAll = ({ allIds }: { allIds: (string | number)[] }) => {
  const { allSelected, selectAll } = useBulkSelection();
  return (
    <label className="relative flex items-center justify-center cursor-pointer">
      <input
        type="checkbox"
        checked={allSelected}
        onChange={() => selectAll(allIds)}
        className="peer sr-only"
      />
      <div className="w-5 h-5 rounded-md border-2 border-surface-300 dark:border-surface-600 peer-checked:border-primary-500 peer-checked:bg-primary-500 transition-all duration-200 flex items-center justify-center">
        {allSelected && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        )}
      </div>
    </label>
  );
};

export default BulkSelectableTable;
