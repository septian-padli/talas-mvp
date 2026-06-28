"use client";

import React from "react";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  UndoRedo,
  ListsToggle,
  BlockTypeSelect,
  CodeToggle,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

export interface MDXEditorWrapperProps {
  markdown: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
}

export default function MDXEditorWrapper({
  markdown,
  onChange,
  placeholder = "Write your content in markdown...",
}: MDXEditorWrapperProps) {
  return (
    <div className="w-full border border-white/10 rounded-xl bg-white/5 overflow-hidden text-white mdx-editor-dark">
      <MDXEditor
        className="dark-theme dark-editor-custom"
        markdown={markdown}
        onChange={onChange}
        placeholder={placeholder}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          markdownShortcutPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <div className="flex items-center gap-1.5 flex-wrap p-1 text-white">
                <UndoRedo />
                <BlockTypeSelect />
                <BoldItalicUnderlineToggles />
                <ListsToggle />
                <CodeToggle />
              </div>
            ),
          }),
        ]}
        contentEditableClassName="prose prose-invert max-w-none p-4 min-h-[250px] focus:outline-none text-white leading-relaxed"
      />
      <style jsx global>{`
        /* Master Container & Content Editable Area */
        .mdx-editor-dark .mdxeditor,
        .mdx-editor-dark .mdxeditor-root-contenteditable,
        .mdx-editor-dark [contenteditable="true"] {
          color: #f3f4f6 !important;
          background-color: transparent !important;
        }

        /* Distinct Heading & Paragraph Sizes */
        .mdx-editor-dark [contenteditable="true"] h1 {
          font-size: 2rem !important;
          font-weight: 700 !important;
          line-height: 2.25rem !important;
          margin-top: 1.25rem !important;
          margin-bottom: 0.75rem !important;
          color: #ffffff !important;
        }
        .mdx-editor-dark [contenteditable="true"] h2 {
          font-size: 1.5rem !important;
          font-weight: 700 !important;
          line-height: 1.75rem !important;
          margin-top: 1rem !important;
          margin-bottom: 0.5rem !important;
          color: #ffffff !important;
        }
        .mdx-editor-dark [contenteditable="true"] h3 {
          font-size: 1.25rem !important;
          font-weight: 600 !important;
          line-height: 1.5rem !important;
          margin-top: 0.875rem !important;
          margin-bottom: 0.5rem !important;
          color: #ffffff !important;
        }
        .mdx-editor-dark [contenteditable="true"] h4 {
          font-size: 1.125rem !important;
          font-weight: 600 !important;
          color: #ffffff !important;
        }
        .mdx-editor-dark [contenteditable="true"] p,
        .mdx-editor-dark [contenteditable="true"] li {
          font-size: 0.95rem !important;
          font-weight: 400 !important;
          line-height: 1.6 !important;
          color: #f3f4f6 !important;
        }

        .mdx-editor-dark [contenteditable="true"] span,
        .mdx-editor-dark [contenteditable="true"] strong,
        .mdx-editor-dark [contenteditable="true"] em {
          color: inherit !important;
        }

        /* Placeholder styling */
        .mdx-editor-dark [data-placeholder],
        .mdx-editor-dark .mdxeditor-placeholder {
          color: rgba(255, 255, 255, 0.3) !important;
        }

        /* Inline Code & Blockquote */
        .mdx-editor-dark [contenteditable="true"] code {
          background-color: rgba(255, 255, 255, 0.1) !important;
          border-radius: 4px;
          padding: 2px 6px;
          color: #emerald-400 !important;
        }
        .mdx-editor-dark [contenteditable="true"] blockquote {
          border-left: 3px solid #48c75e !important;
          padding-left: 1rem;
          color: rgba(255, 255, 255, 0.8) !important;
        }

        /* Toolbar Base & Elements Styling */
        .mdx-editor-dark .mdxeditor-toolbar {
          background-color: rgba(255, 255, 255, 0.05) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: #ffffff !important;
        }
        .mdx-editor-dark .mdxeditor-toolbar button,
        .mdx-editor-dark .mdxeditor-toolbar select,
        .mdx-editor-dark .mdxeditor-toolbar [role="button"],
        .mdx-editor-dark .mdxeditor-toolbar [role="combobox"],
        .mdx-editor-dark .mdxeditor-toolbar span {
          color: rgba(255, 255, 255, 0.9) !important;
        }
        .mdx-editor-dark .mdxeditor-toolbar svg {
          color: rgba(255, 255, 255, 0.9) !important;
          fill: currentColor !important;
        }
        .mdx-editor-dark .mdxeditor-toolbar button:hover,
        .mdx-editor-dark .mdxeditor-toolbar select:hover,
        .mdx-editor-dark .mdxeditor-toolbar [role="button"]:hover,
        .mdx-editor-dark .mdxeditor-toolbar [role="combobox"]:hover {
          background-color: rgba(255, 255, 255, 0.15) !important;
          color: #ffffff !important;
        }
        .mdx-editor-dark .mdxeditor-toolbar button[data-state="on"],
        .mdx-editor-dark .mdxeditor-toolbar button[aria-pressed="true"],
        .mdx-editor-dark .mdxeditor-toolbar button.active {
          background-color: rgba(72, 199, 94, 0.2) !important;
          color: #48c75e !important;
        }
        .mdx-editor-dark .mdxeditor-toolbar button[data-state="on"] svg,
        .mdx-editor-dark .mdxeditor-toolbar button[aria-pressed="true"] svg {
          color: #48c75e !important;
        }

        /* Dropdown Combobox / Select Specific Styling */
        .mdx-editor-dark .mdxeditor-toolbar select,
        .mdx-editor-dark .mdxeditor-toolbar [role="combobox"],
        .mdx-editor-dark .mdxeditor-toolbar button[data-state="open"] {
          background-color: rgba(255, 255, 255, 0.1) !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          border-radius: 8px !important;
          padding: 4px 8px !important;
        }

        /* Global Radix Popover / Listbox Containers (BlockTypeSelect Menu) */
        body [data-radix-popper-content-wrapper],
        body [role="listbox"],
        body [role="dialog"],
        .mdx-editor-dark .mdxeditor-popup-container {
          background-color: #181818 !important;
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8) !important;
          z-index: 99999 !important;
        }
        body [role="option"],
        body [data-radix-collection-item],
        body [role="listbox"] * {
          color: #ffffff !important;
          background-color: #181818 !important;
        }
        body [role="option"]:hover,
        body [role="option"][data-highlighted],
        body [data-radix-collection-item]:hover {
          background-color: rgba(255, 255, 255, 0.12) !important;
          color: #48c75e !important;
        }
      `}</style>
    </div>
  );
}
