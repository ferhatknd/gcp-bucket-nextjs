"use client";
import React from "react";
import { DirectoryBrowser } from "@/components/file/DirectoryBrowser";

export function FileManager() {
  return (
    <DirectoryBrowser
      onCopyAction={(filename: string) => {
        // Copy URL functionality is now handled inside DirectoryBrowser
        console.log('Copy action for:', filename);
      }}
      onDownloadAction={(filename: string) => {
        // Download functionality is now handled inside DirectoryBrowser
        console.log('Download action for:', filename);
      }}
    />
  );
}

export function FileContent() {
  return <FileManager />;
}