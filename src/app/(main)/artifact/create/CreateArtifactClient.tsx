"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchableselect";
import { MediaRepeater, MediaItemData } from "@/components/artifact/MediaRepeater";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Send, Users, FileText, Image as ImageIcon, Trash2, X, Tag as TagIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  saveDraftText,
  loadDraftText,
  saveDraftMedia,
  loadDraftMedia,
  clearArtifactDraft,
} from "@/lib/artifactDraftStorage";
import { apiClient } from "@/lib/apiClient";

// Dynamic import for MDXEditor to disable SSR
const MDXEditorWrapper = dynamic(() => import("@/components/editor/MDXEditorWrapper"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 border border-white/10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 text-xs animate-pulse">
      Loading Markdown Editor...
    </div>
  ),
});

const mockUserOptions: SearchableSelectOption[] = [
  { label: "Hanna Montana", value: "usr_hanna", description: "@hannamontana" },
  { label: "Septian Padli", value: "usr_septian", description: "@septianpadli" },
  { label: "Alex Rivera", value: "usr_alex", description: "@alexrivera" },
  { label: "Sarah Chen", value: "usr_sarah", description: "@sarahchen" },
  { label: "David Kim", value: "usr_david", description: "@davidkim" },
  { label: "Elena Rostova", value: "usr_elena", description: "@elena_dev" },
];

export default function CreateArtifactClient() {
  const router = useRouter();
  const [mediaItems, setMediaItems] = useState<MediaItemData[]>([]);
  const [contentMarkdown, setContentMarkdown] = useState<string>("");
  const [tagInput, setTagInput] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      title: "",
      tags: [] as string[],
      collaborators: [] as string[],
    },
    onSubmit: async ({ value }) => {
      const cleanTitle = value.title.trim();
      if (!cleanTitle) {
        toast.error("Judul karya wajib diisi.");
        return;
      }

      if (cleanTitle.length > 150) {
        toast.error("Judul karya maksimal 150 karakter.");
        return;
      }

      if (!contentMarkdown || !contentMarkdown.trim()) {
        toast.error("Konten karya tidak boleh kosong.");
        return;
      }

      setIsSubmitting(true);
      const toastId = toast.loading("Menerbitkan karya baru...");

      try {
        // 1. Direct S3 Upload for Media Assets under artifacts/ folder
        const uploadedMediaPayloads: Array<{ url: string; caption?: string | null; order: number; size?: number }> = [];

        for (let i = 0; i < mediaItems.length; i++) {
          const item = mediaItems[i];
          let fileKey = item.url;

          // If item has a Blob, upload via Presigned PUT URL directly to S3/R2 storage
          if (item.blob || item.url.startsWith("blob:")) {
            let blobToUpload = item.blob;
            if (!blobToUpload) {
              const fetchBlobRes = await fetch(item.url);
              blobToUpload = await fetchBlobRes.blob();
            }

            const presignedReq = await apiClient("/api/media/presigned-url", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                filename: "artifact_media.webp",
                fileType: "image/webp",
                fileSize: blobToUpload.size,
                folder: "artifacts",
              }),
            });

            if (!presignedReq.ok) {
              const errText = await presignedReq.text();
              console.error("[Developer Log] Presigned URL Request Failed:", presignedReq.status, errText);
              throw new Error("Gagal menyiapkan ruang penyimpanan gambar.");
            }

            const presignedData = await presignedReq.json();
            const { uploadUrl, fileKey: generatedKey } = presignedData.data || presignedData;

            // Direct PUT upload to Object Storage
            const uploadRes = await fetch(uploadUrl, {
              method: "PUT",
              headers: { "Content-Type": "image/webp" },
              body: blobToUpload,
            });

            if (!uploadRes.ok) {
              const uploadErrText = await uploadRes.text().catch(() => "");
              console.error("[Developer Log] Direct S3 PUT Upload Failed:", uploadRes.status, uploadErrText);
              throw new Error("Gagal mengunggah gambar karya ke penyimpanan.");
            }

            fileKey = generatedKey;
          }

          uploadedMediaPayloads.push({
            url: fileKey,
            caption: item.caption || null,
            order: i,
            size: item.blob?.size || 0,
          });
        }

        // 2. Submit Artifact Payload to API Layer
        const apiRes = await apiClient("/api/artifact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: cleanTitle,
            content: contentMarkdown,
            media: uploadedMediaPayloads,
            tags: value.tags,
          }),
        });

        const apiData = await apiRes.json();

        if (!apiRes.ok || !apiData.success) {
          console.error("[Developer Log] API Create Artifact Rejection:", apiRes.status, apiData);
          throw new Error(apiData.message || "Gagal menyimpan karya.");
        }

        // 3. Clear draft and redirect to newly created artifact detail page
        await clearArtifactDraft();
        toast.success("Karya berhasil diterbitkan!", { id: toastId });
        router.push(`/${apiData.data.username}/af/${apiData.data.slug}`);
      } catch (err: any) {
        console.error("[Developer Log] Create Artifact Process Exception:", err);
        toast.error(err.message || "Terjadi kesalahan saat menerbitkan karya.", { id: toastId });
        setIsSubmitting(false);
      }
    },
  });

  // Load draft data on mount
  useEffect(() => {
    async function initDraft() {
      const savedText = loadDraftText();
      if (savedText) {
        if (savedText.title) form.setFieldValue("title", savedText.title);
        if (savedText.tags) form.setFieldValue("tags", savedText.tags);
        if (savedText.collaborators) form.setFieldValue("collaborators", savedText.collaborators);
        if (savedText.content) setContentMarkdown(savedText.content);
      }

      const savedMedia = await loadDraftMedia();
      if (savedMedia && savedMedia.length > 0) {
        setMediaItems(savedMedia);
      }
      setIsLoaded(true);
    }
    initDraft();
  }, []);

  // Auto-save text draft to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    saveDraftText({
      title: form.state.values.title,
      content: contentMarkdown,
      collaborators: form.state.values.collaborators,
      tags: form.state.values.tags,
    });
  }, [form.state.values.title, form.state.values.collaborators, form.state.values.tags, contentMarkdown, isLoaded]);

  // Auto-save media draft to IndexedDB
  useEffect(() => {
    if (!isLoaded) return;
    saveDraftMedia(mediaItems);
  }, [mediaItems, isLoaded]);

  // Handle manual Clear Form action
  const handleClearForm = async () => {
    await clearArtifactDraft();
    form.reset();
    setContentMarkdown("");
    setMediaItems([]);
    setTagInput("");
    toast.success("Formulir karya berhasil dibersihkan!");
  };

  const handleAddTag = (tagToAdd: string, currentTags: string[], setTags: (tags: string[]) => void) => {
    const clean = tagToAdd.trim().replace(/^#/, "");
    if (!clean) return;
    if (currentTags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      toast.error("Tag ini sudah ditambahkan.");
      setTagInput("");
      return;
    }
    setTags([...currentTags, clean]);
    setTagInput("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full pb-2">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Feed</span>
        </Link>
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-emerald-400" />
          <h1 className="text-xl font-bold text-white tracking-wide">New Artifact</h1>
        </div>
      </div>

      {/* Main Form Container Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md flex flex-col gap-8"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col gap-7"
        >
          {/* Field: Title */}
          <form.Field
            name="title"
            validators={{
              onChange: ({ value }) => {
                if (!value || !value.trim()) return "Judul karya wajib diisi.";
                if (value.length > 150) {
                  toast.error("Judul karya maksimal 150 karakter.");
                  return "Maksimal 150 karakter.";
                }
                return undefined;
              },
            }}
          >
            {(field) => {
              return (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={field.name} className="text-sm font-semibold text-white/90">
                      Artifact Title <span className="text-rose-400">*</span>
                    </Label>
                    <span className="text-xs text-white/40 font-mono truncate max-w-xs">
                      {field.state.value.length}/150 chars
                    </span>
                  </div>
                  <Input
                    id={field.name}
                    maxLength={150}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.length > 150) {
                        toast.error("Judul karya maksimal 150 karakter.");
                      }
                      field.handleChange(val);
                    }}
                    placeholder="e.g. Building a Scalable Modular Monolith in Next.js 15"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-400 h-12 px-4 rounded-xl text-base font-medium"
                  />
                  {field.state.meta.errors ? (
                    <span className="text-xs text-rose-400 mt-1">
                      {field.state.meta.errors.join(", ")}
                    </span>
                  ) : null}
                </div>
              );
            }}
          </form.Field>

          {/* Field: Content (MDXEditor WYSIWYG) */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold text-white/90 flex items-center gap-2">
              Content
            </Label>
            <MDXEditorWrapper
              markdown={contentMarkdown}
              onChange={setContentMarkdown}
              placeholder="Write your detailed artifact breakdown, code explanations, or documentation..."
            />
          </div>

          {/* Field: Media Repeater (dnd-kit + 4:3 / 16:9 crop) */}
          <div className="flex flex-col gap-2 border-t border-white/10 pt-6">
            <Label className="text-sm font-semibold text-white/90 flex items-center gap-2 mb-1">
              Artifact Media Attachments
            </Label>
            <MediaRepeater items={mediaItems} onChange={setMediaItems} />
          </div>

          {/* Field: Tags Input */}
          <form.Field name="tags">
            {(field) => (
              <div className="flex flex-col gap-2.5 border-t border-white/10 pt-6">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-white/90 flex items-center gap-2">
                    Artifact Tags
                  </Label>
                  <span className="text-xs text-white/40 font-mono">
                    {field.state.value.length} tags added
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  <Input
                    value={tagInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.includes(",")) {
                        const parts = val.split(",");
                        let updated = [...field.state.value];
                        for (const p of parts) {
                          const clean = p.trim().replace(/^#/, "");
                          if (clean && !updated.some((t) => t.toLowerCase() === clean.toLowerCase())) {
                            updated.push(clean);
                          }
                        }
                        field.handleChange(updated);
                        setTagInput("");
                      } else {
                        setTagInput(val);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag(tagInput, field.state.value, field.handleChange);
                      }
                    }}
                    placeholder="Type a tag and press Enter or comma (e.g. Nextjs, React, Tailwind)..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-400 h-11 px-4 rounded-xl text-sm"
                  />

                  {/* Render Tag Badges */}
                  {field.state.value.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {field.state.value.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium select-none"
                        >
                          <span>#{tag}</span>
                          <button
                            type="button"
                            onClick={() => {
                              field.handleChange(field.state.value.filter((_, i) => i !== idx));
                            }}
                            className="hover:bg-emerald-500/20 p-0.5 rounded-md text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                          >
                            <X size={13} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </form.Field>

          {/* Field: Co-Author Collaborations (Disabled per user request) */}
          <form.Field name="collaborators">
            {(field) => (
              <div className="flex flex-col gap-2 border-t border-white/10 pt-6 opacity-60">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-white/90 flex items-center gap-2">
                    Co-Authors / Collaborators (Disabled)
                  </Label>
                  <span className="text-xs text-white/40 font-mono">
                    {field.state.value.length}/5 co-authors
                  </span>
                </div>
                <SearchableSelect
                  disabled={true}
                  options={mockUserOptions}
                  value={field.state.value}
                  onChange={(val) => field.handleChange(val)}
                  isMultiple={true}
                  maxItems={5}
                  placeholder="Collaborator invitations are currently disabled..."
                  searchPlaceholder="Search collaborators by name or handle..."
                />
                <span className="text-[11px] text-white/40">
                  Fitur kolaborator belum diaktifkan untuk saat ini.
                </span>
              </div>
            )}
          </form.Field>

          {/* Action Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10 mt-2">
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleClearForm}
              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-medium text-sm px-5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer h-auto flex items-center gap-2 disabled:opacity-50"
            >
              <Trash2 size={16} />
              <span>Clear Form</span>
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#48c75e] hover:bg-[#3db250] text-black font-semibold text-sm px-7 py-2.5 rounded-xl transition-all duration-200 cursor-pointer h-auto shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={16} />
              <span>{isSubmitting ? "Menerbitkan..." : "Publish Artifact"}</span>
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
