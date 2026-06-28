"use client";

import React, { useState, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDropzone } from "react-dropzone";
import ReactCrop, { Crop as CropType, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { getCroppedImg } from "@/lib/cropImage";
import { GripVertical, Trash2, Upload, Crop as CropIcon, X, Check, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

export interface MediaItemData {
  id: string;
  url: string;
  blob?: Blob;
  caption?: string;
  aspect: "4:3" | "16:9";
}

export interface MediaRepeaterProps {
  items: MediaItemData[];
  onChange: (items: MediaItemData[]) => void;
}

function SortableMediaItem({
  item,
  onRemove,
  onUpdateCaption,
}: {
  item: MediaItemData;
  onRemove: (id: string) => void;
  onUpdateCaption: (id: string, caption: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-xl shadow-md group"
    >
      {/* Drag Handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-white/40 hover:text-white cursor-grab active:cursor-grabbing p-1 rounded transition-colors"
      >
        <GripVertical size={20} />
      </button>

      {/* Image Preview Thumbnail */}
      <div className="w-20 h-16 rounded-lg overflow-hidden bg-black/40 border border-white/10 shrink-0 relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.url} alt="Media preview" className="w-full h-full object-cover" />
        <span className="absolute bottom-1 right-1 bg-black/70 text-[9px] text-emerald-400 font-mono px-1 py-0.5 rounded">
          {item.aspect}
        </span>
      </div>

      {/* Caption Input */}
      <div className="flex-1 min-w-0">
        <Input
          value={item.caption || ""}
          onChange={(e) => onUpdateCaption(item.id, e.target.value)}
          placeholder="Add caption (optional)..."
          className="bg-black/20 border-white/10 text-xs text-white placeholder:text-white/30 h-9 px-3 rounded-lg focus:border-emerald-400"
        />
      </div>

      {/* Remove Button */}
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="text-white/40 hover:text-rose-400 p-2 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export function MediaRepeater({ items, onChange }: MediaRepeaterProps) {
  const [selectedAspect, setSelectedAspect] = useState<"4:3" | "16:9">("16:9");
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      onChange(arrayMove(items, oldIndex, newIndex));
    }
  };

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

  const aspectNumeric = selectedAspect === "16:9" ? 16 / 9 : 4 / 3;

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(
      centerCrop(
        makeAspectCrop({ unit: "%", width: 90 }, aspectNumeric, width, height),
        width,
        height
      )
    );
  };

  const handleApplyCrop = async () => {
    if (!imgRef.current || !completedCrop || completedCrop.width === 0 || completedCrop.height === 0) {
      toast.error("Silakan pilih area potong gambar terlebih dahulu.");
      return;
    }

    try {
      // 1. Try maximum resolution (1920px width)
      let targetW = 1920;
      let targetH = selectedAspect === "16:9" ? 1080 : 1440;
      
      let blob = await getCroppedImg(imgRef.current, completedCrop, targetW, targetH, 0.85);

      // 2. Progressive fallback: if size > 300 KB, reduce to 1280px width
      if (blob.size > 300 * 1024) {
        targetW = 1280;
        targetH = selectedAspect === "16:9" ? 720 : 960;
        blob = await getCroppedImg(imgRef.current, completedCrop, targetW, targetH, 0.80);
      }

      // 3. Secondary quality check if still > 300 KB
      if (blob.size > 300 * 1024) {
        blob = await getCroppedImg(imgRef.current, completedCrop, targetW, targetH, 0.70);
      }

      const objectUrl = URL.createObjectURL(blob);

      const newItem: MediaItemData = {
        id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        url: objectUrl,
        blob,
        aspect: selectedAspect,
      };

      onChange([...items, newItem]);
      setIsCropModalOpen(false);
      setImgSrc(null);
      toast.success("Media berhasil ditambahkan!");
    } catch (e) {
      console.error("Progressive crop error:", e);
      toast.error("Gagal memproses gambar.");
    }
  };

  const handleRemove = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  const handleUpdateCaption = (id: string, caption: string) => {
    onChange(items.map((i) => (i.id === id ? { ...i, caption } : i)));
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Aspect Ratio Selector Controls */}
      <div className="flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <ImageIcon size={16} className="text-emerald-400" />
          <span className="text-xs font-semibold text-white/90">Aspect Ratio Crop Option:</span>
        </div>

        <div className="flex items-center gap-2">
          {(["16:9", "4:3"] as const).map((ratio) => {
            const isSelected = selectedAspect === ratio;
            return (
              <button
                type="button"
                key={ratio}
                onClick={() => setSelectedAspect(ratio)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-sm"
                    : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                }`}
              >
                {isSelected && <Check size={12} />}
                <span>{ratio}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dropzone Upload Area */}
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
          {isDragActive ? "Drop media here..." : `Add media (${selectedAspect} aspect ratio)`}
        </p>
        <span className="text-[10px] text-white/40">
          Drag & drop or click to browse image (PNG, JPG, WEBP)
        </span>
      </div>

      {/* DndKit Repeater List */}
      {items.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2.5 mt-2">
              {items.map((item) => (
                <SortableMediaItem
                  key={item.id}
                  item={item}
                  onRemove={handleRemove}
                  onUpdateCaption={handleUpdateCaption}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Crop Modal Dialog */}
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
              className="bg-[#181818] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl my-auto"
            >
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <CropIcon size={18} className="text-emerald-400" />
                  Crop Media ({selectedAspect} Ratio)
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCropModalOpen(false)}
                  className="text-white/60 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 flex items-center justify-center bg-black/50 max-h-[60vh] overflow-auto">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspectNumeric}
                  keepSelection
                  className="max-h-[55vh]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imgRef}
                    alt="Crop upload"
                    src={imgSrc}
                    onLoad={onImageLoad}
                    className="max-h-[55vh] object-contain"
                  />
                </ReactCrop>
              </div>

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
                  Apply & Add Media
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
