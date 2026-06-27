"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "@tanstack/react-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import AvatarUser from "@/components/ui/avataruser";
import { motion, AnimatePresence } from "framer-motion";
import { User, Check, ArrowLeft, Loader2, Pencil, Trash2, Upload, Crop, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { useDropzone } from "react-dropzone";
import ReactCrop, { Crop as CropType, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { getCroppedImg } from "@/lib/cropImage";

export enum JobStatusEnum {
  NONE = "NONE",
  EMPLOYED = "EMPLOYED",
  FREELANCE = "FREELANCE",
  OPEN_TO_WORK = "OPEN_TO_WORK",
}

const urlSchema = z
  .string()
  .url("Must be a valid full URL (e.g. https://...)")
  .or(z.literal(""));

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function EditProfileClient() {
  const router = useRouter();
  const { user, refetch } = useCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Crop & Dropzone States
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Dropzone Setup
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
      "image/gif": [],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = () => {
          setImgSrc(reader.result as string);
          setIsCropModalOpen(true);
        };
        reader.readAsDataURL(file);
      }
    },
  });

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  };

  const handleApplyCrop = async () => {
    if (!imgRef.current || !completedCrop || completedCrop.width === 0 || completedCrop.height === 0) {
      toast.error("Please select a crop area.");
      return;
    }

    try {
      const blob = await getCroppedImg(imgRef.current, completedCrop, 512, 512, 0.85);
      setCroppedBlob(blob);
      if (croppedPreviewUrl) {
        URL.revokeObjectURL(croppedPreviewUrl);
      }
      const newUrl = URL.createObjectURL(blob);
      setCroppedPreviewUrl(newUrl);
      setIsCropModalOpen(false);
      toast.success("Photo cropped! Click Save Changes to update.");
    } catch (e) {
      console.error("Error cropping image:", e);
      toast.error("Failed to crop image.");
    }
  };

  const handleDeletePhoto = () => {
    if (croppedPreviewUrl) {
      URL.revokeObjectURL(croppedPreviewUrl);
    }
    setImgSrc(null);
    setCroppedBlob(null);
    setCroppedPreviewUrl(null);
    toast.info("New avatar removed.");
  };

  const form = useForm({
    defaultValues: {
      name: user?.name || "",
      job_title: user?.job_title || "",
      job_status: (user?.job_status as JobStatusEnum) || JobStatusEnum.NONE,
      bio: user?.bio || "",
      github: user?.github || "",
      linkedin: user?.linkedin || "",
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        let uploadedPhotoUrl: string | undefined = undefined;

        // Step 1: Upload Avatar via Presigned URL if new croppedBlob exists
        if (croppedBlob) {
          const presignedRes = await fetch("/api/media/presigned-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: "avatar.webp",
              fileType: "image/webp",
              fileSize: croppedBlob.size,
            }),
          });

          const presignedJson = await presignedRes.json();
          if (!presignedRes.ok || !presignedJson.success) {
            throw new Error(presignedJson.message || "Failed to get upload URL");
          }

          const { uploadUrl, fileKey } = presignedJson.data;

          const uploadRes = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
              "Content-Type": "image/webp",
            },
            body: croppedBlob,
          });

          if (!uploadRes.ok) {
            const errBody = await uploadRes.text().catch(() => "");
            console.error("Direct S3 upload failed:", uploadRes.status, uploadRes.statusText, errBody);
            throw new Error(`Direct image upload to storage failed (${uploadRes.status})`);
          }

          uploadedPhotoUrl = fileKey;
        }

        // Step 2: Update Profile via API
        const profileRes = await fetch("/api/user/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: value.name,
            job_title: value.job_title || null,
            job_status: value.job_status || null,
            bio: value.bio || null,
            github: value.github || null,
            linkedin: value.linkedin || null,
            ...(uploadedPhotoUrl ? { photo_profile: uploadedPhotoUrl } : {}),
          }),
        });

        const profileJson = await profileRes.json();
        if (!profileRes.ok || !profileJson.success) {
          throw new Error(profileJson.message || "Failed to update profile");
        }

        toast.success("Profile updated successfully!");
        await refetch();
        router.push(user?.username ? `/profile/${user.username}` : "/profile");
      } catch (error: any) {
        console.error("Error updating profile:", error);
        toast.error(error.message || "An error occurred while saving profile.");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (user) {
      form.setFieldValue("name", user.name || "");
      form.setFieldValue("job_title", user.job_title || "");
      form.setFieldValue("job_status", (user.job_status as JobStatusEnum) || JobStatusEnum.NONE);
      form.setFieldValue("bio", user.bio || "");
      form.setFieldValue("github", user.github || "");
      form.setFieldValue("linkedin", user.linkedin || "");
    }
  }, [user]);

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4 flex flex-col gap-6">
      {/* Top Navigation Back Header */}
      <div className="flex items-center justify-between w-full pb-2">
        <Link
          href={user?.username ? `/profile/${user.username}` : "/profile"}
          className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Profile</span>
        </Link>
        <h1 className="text-xl font-bold text-white tracking-wide">Edit Profile</h1>
      </div>

      {/* Main Container Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md flex flex-col gap-8"
      >
        {/* Section 1: Profile Avatar Upload via react-dropzone */}
        <div className="flex flex-col gap-4">
          <Label className="text-sm font-semibold text-white/90 flex items-center gap-2">
            <User size={16} className="text-emerald-400" />
            Profile Picture
          </Label>

          <div className="flex flex-col sm:flex-row items-center gap-6 bg-white/5 border border-white/5 p-4 rounded-xl">
            {/* Current / Cropped Avatar Preview */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <AvatarUser
                src={croppedPreviewUrl || user?.photo_profile}
                name={user?.name || "User"}
                className="w-24 h-24 text-2xl border-2 border-white/10 shadow-lg"
              />
              <span className="text-[11px] text-white/40">
                {croppedPreviewUrl ? "New Cropped Preview" : "Current Avatar"}
              </span>
            </div>

            {/* Uploader Container: Show Dropzone or Action Buttons */}
            <div className="flex-1 w-full flex flex-col items-center justify-center">
              {croppedPreviewUrl ? (
                /* When Image is cropped, show ONLY image action buttons */
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10 w-full justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => setIsCropModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Pencil size={14} />
                    <span>Edit Crop</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDeletePhoto}
                    className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              ) : (
                /* React Dropzone Input Area */
                <div
                  {...getRootProps()}
                  className={`w-full p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-emerald-400 bg-emerald-500/10 text-emerald-400"
                      : "border-white/15 bg-white/[0.02] text-white/60 hover:border-emerald-400/50 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload size={24} className="text-emerald-400/80 mb-1" />
                  <p className="text-xs sm:text-sm font-medium">
                    {isDragActive
                      ? "Drop picture here..."
                      : "Drag & Drop your picture or Click to Browse"}
                  </p>
                  <span className="text-[10px] text-white/40">
                    Supports PNG, JPG, WEBP, GIF (Will crop to 1:1 square)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Form Fields powered by TanStack Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col gap-6"
        >
          {/* Field: Full Name */}
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) =>
                !value || !value.trim() ? "Full name is required" : undefined,
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-2">
                <Label htmlFor={field.name} className="text-sm font-medium text-white/90">
                  Full Name <span className="text-rose-400">*</span>
                </Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. Hanna Montana"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-400 h-11 px-4 rounded-xl"
                />
                {field.state.meta.errors ? (
                  <span className="text-xs text-rose-400 mt-1">
                    {field.state.meta.errors.join(", ")}
                  </span>
                ) : null}
              </div>
            )}
          </form.Field>

          {/* Field: Job Title */}
          <form.Field name="job_title">
            {(field) => (
              <div className="flex flex-col gap-2">
                <Label htmlFor={field.name} className="text-sm font-medium text-white/90">
                  Job Title / Headline
                </Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. Frontend Developer | React Enthusiast"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-400 h-11 px-4 rounded-xl"
                />
              </div>
            )}
          </form.Field>

          {/* Field: Job Status */}
          <form.Field name="job_status">
            {(field) => (
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-white/90">Work Status</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-1">
                  {[
                    { label: "None", value: JobStatusEnum.NONE },
                    { label: "Employed", value: JobStatusEnum.EMPLOYED },
                    { label: "Freelance", value: JobStatusEnum.FREELANCE },
                    { label: "Open to Work", value: JobStatusEnum.OPEN_TO_WORK },
                  ].map((status) => {
                    const isSelected = field.state.value === status.value;
                    return (
                      <button
                        type="button"
                        key={status.value}
                        onClick={() => field.handleChange(status.value)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none ${
                          isSelected
                            ? "bg-emerald-500/15 border-emerald-400 text-emerald-400 shadow-sm"
                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {isSelected && <Check size={14} />}
                        <span>{status.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </form.Field>

          {/* Field: Bio */}
          <form.Field
            name="bio"
            validators={{
              onChange: ({ value }) =>
                value && value.length > 250
                  ? "Bio cannot exceed 250 characters"
                  : undefined,
            }}
          >
            {(field) => {
              const charCount = field.state.value ? field.state.value.length : 0;
              const isOverLimit = charCount > 250;
              return (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={field.name} className="text-sm font-medium text-white/90">
                      Bio
                    </Label>
                    <span
                      className={`text-xs font-mono ${
                        isOverLimit ? "text-rose-400 font-semibold" : "text-white/40"
                      }`}
                    >
                      {charCount}/250
                    </span>
                  </div>
                  <Textarea
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      if (e.target.value.length <= 250) {
                        field.handleChange(e.target.value);
                      }
                    }}
                    rows={4}
                    maxLength={250}
                    placeholder="Write a short bio about yourself (max 250 characters)..."
                    className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-400 p-4 rounded-xl leading-relaxed ${
                      isOverLimit ? "border-rose-400 focus:border-rose-400" : ""
                    }`}
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

          {/* Section 3: Social Links */}
          <div className="border-t border-white/10 pt-6 mt-2 flex flex-col gap-4">
            <h3 className="text-base font-semibold text-white tracking-wide">Social Networks</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* GitHub */}
              <form.Field
                name="github"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return undefined;
                    const res = urlSchema.safeParse(value);
                    return res.success ? undefined : "Must be a valid full URL (e.g. https://github.com/username)";
                  },
                }}
              >
                {(field) => (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={field.name} className="text-xs font-medium text-white/80 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 fill-current text-white/70" viewBox="0 0 24 24">
                        <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                      </svg>
                      GitHub Profile URL
                    </Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="https://github.com/yourusername"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-400 h-11 px-4 rounded-xl text-xs sm:text-sm"
                    />
                    {field.state.meta.errors ? (
                      <span className="text-xs text-rose-400 mt-1">
                        {field.state.meta.errors.join(", ")}
                      </span>
                    ) : null}
                  </div>
                )}
              </form.Field>

              {/* LinkedIn */}
              <form.Field
                name="linkedin"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return undefined;
                    const res = urlSchema.safeParse(value);
                    return res.success ? undefined : "Must be a valid full URL (e.g. https://linkedin.com/in/username)";
                  },
                }}
              >
                {(field) => (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={field.name} className="text-xs font-medium text-white/80 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 fill-current text-white/70" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
                      </svg>
                      LinkedIn Profile URL
                    </Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="https://linkedin.com/in/yourusername"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-400 h-11 px-4 rounded-xl text-xs sm:text-sm"
                    />
                    {field.state.meta.errors ? (
                      <span className="text-xs text-rose-400 mt-1">
                        {field.state.meta.errors.join(", ")}
                      </span>
                    ) : null}
                  </div>
                )}
              </form.Field>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/10 mt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#48c75e] hover:bg-[#3db250] text-black font-semibold text-sm px-6 py-2.5 rounded-xl transition-all duration-200 cursor-pointer h-auto shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin text-black" />}
              <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
            </Button>
          </div>
        </form>
      </motion.div>

      {/* React Image Crop Modal Popup */}
      <AnimatePresence>
        {isCropModalOpen && imgSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#181818] border border-white/10 rounded-2xl w-full max-w-xl overflow-hidden flex flex-col shadow-2xl my-auto"
            >
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Crop size={18} className="text-emerald-400" />
                  Crop Profile Photo (1:1 Aspect Ratio)
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCropModalOpen(false)}
                  className="text-white/60 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* ReactCrop Container */}
              <div className="p-4 flex items-center justify-center bg-black/50 max-h-[60vh] overflow-auto">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  keepSelection
                  className="max-h-[55vh]"
                >
                  <img
                    ref={imgRef}
                    alt="Crop upload"
                    src={imgSrc}
                    onLoad={onImageLoad}
                    className="max-h-[55vh] object-contain"
                  />
                </ReactCrop>
              </div>

              {/* Modal Footer Actions */}
              <div className="px-6 py-4 bg-[#181818] flex items-center justify-end gap-3 border-t border-white/10">
                <Button
                  type="button"
                  onClick={() => setIsCropModalOpen(false)}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs px-4 py-2 rounded-xl cursor-pointer h-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleApplyCrop}
                  className="bg-[#48c75e] hover:bg-[#3db250] text-black font-semibold text-xs px-5 py-2 rounded-xl cursor-pointer h-auto shadow-md"
                >
                  Apply Crop
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
