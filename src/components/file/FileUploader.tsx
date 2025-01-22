"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DirectLinkUploader } from "./DirectLinkUploader";
import { useState } from "react";

export function FileUploader({
  onUploadCompleteAction,
}: {
  onUploadCompleteAction: () => void;
}) {
  const [directLinkError, setDirectLinkError] = useState<string | null>(null);

  const handleDirectLinkError = (error: string) => {
    setDirectLinkError(error);
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-8 lg:mb-12 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-primary items-center justify-center">
        Upload Files
      </h2>

      <DirectLinkUploader
        onUploadSuccessAction={onUploadCompleteAction}
        onUploadErrorAction={handleDirectLinkError}
      />

      <AnimatePresence>
        {directLinkError && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-500 text-sm sm:text-base mt-2 sm:mt-3"
          >
            {directLinkError}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
