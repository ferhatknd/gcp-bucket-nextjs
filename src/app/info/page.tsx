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
  KernelIcon,
  CopyIcon,
} from "@/components/ui/Icons";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Separator } from "@/components/ui/seperator";

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
          subtitle: "Upload Methods",
          description: "Multiple ways to upload files to our platform",
          content: (
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Web Interface</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="bg-primary/5 p-4">
                    <h5 className="font-medium mb-2">Direct Upload</h5>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Visit the home page</li>
                      <li>Click &quot;Choose Files&quot; or drag & drop</li>
                      <li>Select your files</li>
                      <li>Wait for upload completion</li>
                    </ol>
                  </Card>
                  <Card className="bg-primary/5 p-4">
                    <h5 className="font-medium mb-2">Link Upload</h5>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Navigate to the upload section</li>
                      <li>Paste your direct download link</li>
                      <li>Click &quot;Upload from Link&quot;</li>
                      <li>Wait for the download and upload</li>
                    </ol>
                  </Card>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-lg">Command Line Upload</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="bg-primary/5 p-4">
                    <div className="space-y-3">
                      <h5 className="font-medium">Upload Script</h5>
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <div className="flex-grow">
                            <p className="text-sm font-medium">
                              Download Script
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Get our command-line upload tool
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="group transition-all duration-300 hover:border-primary/50"
                              onClick={() =>
                                (window.location.href = "/api/download-script")
                              }
                            >
                              <DownloadIcon className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                              Download
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="group transition-all duration-300 hover:border-primary/50"
                              onClick={() =>
                                navigator.clipboard.writeText(
                                  `wget -O upload.sh ${window.location.origin}/api/download-script && chmod +x upload.sh`,
                                )
                              }
                            >
                              <CopyIcon className="w-4 h-4 mr-2" />
                              Copy
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                  <Card className="bg-primary/5 p-4">
                    <div className="space-y-3">
                      <h5 className="font-medium">Usage Examples</h5>
                      <div className="space-y-2 font-mono text-xs">
                        <div className="bg-card/50 p-2 rounded-lg">
                          # Upload single file
                          <br />
                          ./upload.sh file.zip
                        </div>
                        <div className="bg-card/50 p-2 rounded-lg">
                          # Upload multiple files
                          <br />
                          ./upload.sh file1.zip file2.zip
                        </div>
                        <div className="bg-card/50 p-2 rounded-lg">
                          # Upload from URL
                          <br />
                          ./upload.sh -l https://example.com/file.zip
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          ),
        },
        {
          subtitle: "File Requirements",
          description: "Requirements and limitations for file uploads",
          content: (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-primary/5 p-4">
                <h5 className="font-medium mb-2">Size Limits</h5>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Minimum size: 500MB</li>
                  <li>• Maximum size: 3GB</li>
                  <li>• Recommended: 1-2GB</li>
                </ul>
              </Card>
              <Card className="bg-primary/5 p-4">
                <h5 className="font-medium mb-2">Supported Types</h5>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Archive files (.zip, .rar, etc.)</li>
                  <li>• Binary files</li>
                  <li>• System images</li>
                </ul>
              </Card>
              <Card className="bg-primary/5 p-4">
                <h5 className="font-medium mb-2">Restrictions</h5>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• No audio files</li>
                  <li>• No video files</li>
                  <li>• No text files</li>
                </ul>
              </Card>
            </div>
          ),
        },
      ],
    },
    {
      title: "Kernel Upload",
      icon: KernelIcon,
      content: [
        {
          subtitle: "Upload Methods",
          description: "Ways to upload kernel files",
          content: (
            <div className="space-y-6">
              {/* Web Upload Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Web Interface</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="bg-primary/5 p-4">
                    <h5 className="font-medium mb-2">Upload Steps</h5>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Go to Kernel Upload section</li>
                      <li>Select or drag your kernel ZIP file</li>
                      <li>Wait for validation</li>
                      <li>Get download URL and checksum</li>
                    </ol>
                  </Card>
                  <Card className="bg-primary/5 p-4">
                    <h5 className="font-medium mb-2">Validation</h5>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• ZIP format verification</li>
                      <li>• Size validation</li>
                      <li>• Checksum generation</li>
                      <li>• Integrity check</li>
                    </ul>
                  </Card>
                </div>
              </div>

              {/* Command Line Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Command Line Upload</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="bg-primary/5 p-4">
                    <div className="space-y-3">
                      <h5 className="font-medium">Script Download</h5>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex-grow">
                          <p className="text-sm font-medium">
                            Get Upload Script
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Download our kernel upload script
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="group transition-all duration-300 hover:border-primary/50"
                            onClick={() =>
                              (window.location.href = "/api/download-script")
                            }
                          >
                            <DownloadIcon className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="group transition-all duration-300 hover:border-primary/50"
                            onClick={() =>
                              navigator.clipboard.writeText(
                                `wget -O upload.sh ${window.location.origin}/api/download-script && chmod +x upload.sh`,
                              )
                            }
                          >
                            <CopyIcon className="w-4 h-4 mr-2" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                  <Card className="bg-primary/5 p-4">
                    <div className="space-y-3">
                      <h5 className="font-medium">Usage Example</h5>
                      <div className="space-y-2 font-mono text-xs">
                        <div className="bg-card/50 p-2 rounded-lg">
                          # Upload kernel file
                          <br />
                          ./upload.sh -k kernel.zip
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          The script will validate, upload, and return the
                          download URL and checksum
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          ),
        },
        {
          subtitle: "Requirements",
          description: "Specific requirements for kernel files",
          content: (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-primary/5 p-4">
                <h5 className="font-medium mb-2">File Specifications</h5>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Format: ZIP only</li>
                  <li>• Size: 10MB - 50MB</li>
                  <li>• Valid ZIP structure</li>
                </ul>
              </Card>
              <Card className="bg-primary/5 p-4">
                <h5 className="font-medium mb-2">Security</h5>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• SHA-256 checksum</li>
                  <li>• Format validation</li>
                  <li>• Integrity checks</li>
                </ul>
              </Card>
              <Card className="bg-primary/5 p-4">
                <h5 className="font-medium mb-2">Features</h5>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Automatic validation</li>
                  <li>• Instant checksums</li>
                  <li>• Direct download URLs</li>
                </ul>
              </Card>
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
      <div className="sticky top-0 z-50 bg-gradient-to-b from-background to-background/80 backdrop-blur-sm shadow-sm pb-4">
        <Header />
      </div>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="mx-auto p-4 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl w-fit"
            >
              <InfoIcon className="w-10 h-10 text-primary" />
            </motion.div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[hsl(var(--gradient-1))] via-[hsl(var(--gradient-2))] to-[hsl(var(--gradient-3))] bg-clip-text text-transparent">
                Documentation & Usage Guide
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Learn how to use our file hosting service effectively. This
                comprehensive guide covers all features and requirements.
              </p>
            </div>
            <Separator className="max-w-md mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 gap-8">
            {sections.map((section, index) => (
              <motion.section
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="relative overflow-hidden bg-card/50 backdrop-blur-sm border border-primary/10 transition-all duration-300 hover:shadow-lg hover:border-primary/20">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full -z-10" />
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
                                  {item.features.map(
                                    (feature, featureIndex) => (
                                      <li key={featureIndex}>{feature}</li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            )}
                          </>
                        )}

                        {item.notes && (
                          <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                            <h4 className="font-medium mb-2">
                              Important Notes:
                            </h4>
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
          </div>
        </motion.div>
      </main>
    </div>
  );
}
