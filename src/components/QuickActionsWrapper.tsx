"use client";

import QuickActions from "./QuickActions";

type QuickActionsWrapperProps = {
  role?: "admin" | "teacher" | "student" | "parent";
  className?: string;
};

const QuickActionsWrapper = ({ role, className }: QuickActionsWrapperProps) => {
  return <QuickActions role={role} className={className} />;
};

export default QuickActionsWrapper; 