"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DirectLinkUploader } from "./DirectLinkUploader";
import { useState } from "react";

export function FileUploader({
  onUploadCompleteAction,
}: {
  onUploadCompleteAction: (file: { name: string; url: string }) => void;
}) {
  const [directLinkError, setDirectLinkError] = useState<string | null>(null);

  const handleDirectLinkSuccess = (file: { name: string; url: string }) => {
    onUploadCompleteAction(file);
    setDirectLinkError(null);
  };

  const handleDirectLinkError = (error: string) => {
    setDirectLinkError(error);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      </div>

      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-[8px]" />
      </div>

      <div className="relative rounded-2xl border border-primary/10 overflow-hidden">
        <div className="bg-card/30 px-6 py-8 sm:px-8 sm:py-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 mb-8"
          >
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Upload Files
            </h2>
          </motion.div>

          <DirectLinkUploader
            onUploadSuccessAction={handleDirectLinkSuccess}
            onUploadErrorAction={handleDirectLinkError}
          />

          <AnimatePresence>
            {directLinkError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="mt-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-destructive/5 rounded-2xl blur-lg" />
                  <div className="relative p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm font-medium text-center text-destructive">
                      {directLinkError}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="absolute inset-0 rounded-2xl -z-10">
        <div className="absolute inset-0 bg-primary/5 blur-2xl transform translate-y-1" />
      </div>
    </motion.div>
  );
}
