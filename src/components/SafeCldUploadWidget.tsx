"use client";

import { CldUploadWidget, CldUploadWidgetProps } from "next-cloudinary";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export default function SafeCldUploadWidget(props: CldUploadWidgetProps) {
  if (!CLOUD_NAME) {
    return (
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl">
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Cloudinary Cloud Name is not configured. Image upload is disabled.
        </p>
      </div>
    );
  }

  return <CldUploadWidget {...props} />;
}
