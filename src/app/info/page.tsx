"use client";
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InfoIcon,
  FileManagerIcon,
  UploadIcon,
  AdminIcon,
  AlertIcon,
  DownloadIcon,
} from "@/components/ui/Icons";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";

interface ContentItem {
  subtitle: string;
  description: string;
  steps?: string[];
  details?: string[];
  features?: string[];
  notes?: string[];
  content?: React.ReactNode;
}

interface Section {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  content: ContentItem[];
}

export default function InfoPage() {
  const sections: Section[] = [
    {
      title: "File Upload Methods",
      icon: UploadIcon,
      content: [
        {
          subtitle: "Direct Link Upload",
          description: "Upload files using direct download links",
          steps: [
            "Navigate to the home page",
            "Locate the 'Upload Files' section",
            "Paste a direct download link into the input field",
            "Click 'Upload from Link' to start the upload process",
          ],
          notes: [
            "Minimum file size: 500MB",
            "Maximum file size: 3GB",
            "Links must be direct download URLs",
            "Ensure the file is publicly accessible",
          ],
        },
        {
          subtitle: "Command Line Upload",
          description: "Upload files using our command-line script",
          notes: [
            "Script automatically handles file uploads",
            "Supports the same size limitations as web upload",
            "Requires bash shell environment",
          ],
          content: (
            <div className="space-y-4">
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex-grow">
                    <h4 className="font-medium text-primary">
                      Download Upload Script
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Get our command-line upload tool to easily upload files
                      from your terminal
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="group transition-all duration-300 hover:border-primary/50"
                      onClick={() =>
                        (window.location.href = "/download-script")
                      }
                    >
                      <DownloadIcon className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                      Download Script
                    </Button>
                    <Button
                      variant="outline"
                      className="group transition-all duration-300 hover:border-primary/50"
                      onClick={() =>
                        navigator.clipboard.writeText(
                          window.location.origin + "/download-script",
                        )
                      }
                    >
                      Copy URL
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Usage Instructions:</h4>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li className="pl-2">Make the script executable:</li>
                  <code className="block bg-primary/5 p-2 rounded-md mt-1 font-mono text-sm">
                    chmod +x upload.sh
                  </code>
                  <li className="pl-2">Run the script with your file:</li>
                  <code className="block bg-primary/5 p-2 rounded-md mt-1 font-mono text-sm">
                    ./upload.sh &lt;file-path&gt;
                  </code>
                </ol>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      title: "File Restrictions",
      icon: AlertIcon,
      content: [
        {
          subtitle: "Size Limitations",
          description: "File size requirements and limits",
          details: [
            "Minimum size: 500MB",
            "Maximum size: 3GB",
            "Files outside these limits will be rejected",
          ],
        },
        {
          subtitle: "Forbidden File Types",
          description: "Types of files that cannot be uploaded",
          details: [
            "Audio files (all audio formats)",
            "Video files (all video formats)",
            "Text files (including documents)",
          ],
          notes: [
            "These restrictions are strictly enforced",
            "Attempts to upload forbidden file types will be rejected",
          ],
        },
      ],
    },
    {
      title: "File Management",
      icon: FileManagerIcon,
      content: [
        {
          subtitle: "Browsing Files",
          description: "Navigate and manage uploaded files",
          steps: [
            "Access the file list from the home page or navigation menu",
            "Use the search bar to find specific files",
            "Sort files by name, date, or size",
            "Click on file names to view detailed information",
          ],
        },
        {
          subtitle: "File Operations",
          description: "Common file management tasks",
          features: [
            "Generate download links",
            "Copy direct download URLs",
            "View file metadata and details",
            "Track file sizes and upload dates",
          ],
        },
      ],
    },
    {
      title: "Admin Features",
      icon: AdminIcon,
      content: [
        {
          subtitle: "Admin Panel Access",
          description: "Manage files with administrative privileges",
          steps: [
            "Navigate to the Admin Panel from the navigation menu",
            "Enter your admin API key to authenticate",
            "Access additional file management features",
          ],
        },
        {
          subtitle: "Admin Operations",
          description: "Administrative file management tasks",
          features: [
            "Delete files from storage",
            "Rename existing files",
            "View detailed file statistics",
            "Monitor storage usage",
          ],
          notes: [
            "Admin API key required for all administrative operations",
            "Changes are permanent and cannot be undone",
          ],
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="sticky top-0 z-50 bg-gradient-to-b from-background to-background/80 shadow-sm pb-4">
        <Header />
      </div>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="mx-auto p-3 bg-primary/10 rounded-xl w-fit"
            >
              <InfoIcon className="w-8 h-8 text-primary" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[hsl(var(--gradient-1))] via-[hsl(var(--gradient-2))] to-[hsl(var(--gradient-3))] bg-clip-text text-transparent">
              Documentation & Usage Guide
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Learn how to use our file hosting service effectively. This guide
              covers upload methods, file restrictions, management features, and
              administrative capabilities.
            </p>
          </div>

          {/* Content Sections */}
          {sections.map((section, index) => (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-6"
            >
              <Card className="relative bg-card/50 backdrop-blur-sm border border-primary/10">
                <CardHeader className="space-y-4 border-b border-primary/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <section.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent pt-4">
                      {section.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex} className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-primary">
                          {item.subtitle}
                        </h3>
                        <p className="text-muted-foreground">
                          {item.description}
                        </p>
                      </div>

                      {item.content && (
                        <div className="mt-4">{item.content}</div>
                      )}

                      {!item.content && (
                        <>
                          {item.steps && (
                            <div className="space-y-2">
                              <h4 className="font-medium">Steps:</h4>
                              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                {item.steps.map((step, stepIndex) => (
                                  <li key={stepIndex}>{step}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {item.details && (
                            <div className="space-y-2">
                              <h4 className="font-medium">Details:</h4>
                              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                {item.details.map((detail, detailIndex) => (
                                  <li key={detailIndex}>{detail}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {item.features && (
                            <div className="space-y-2">
                              <h4 className="font-medium">Features:</h4>
                              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                {item.features.map((feature, featureIndex) => (
                                  <li key={featureIndex}>{feature}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      )}

                      {item.notes && (
                        <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                          <h4 className="font-medium mb-2">Important Notes:</h4>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            {item.notes.map((note, noteIndex) => (
                              <li key={noteIndex}>{note}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.section>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
