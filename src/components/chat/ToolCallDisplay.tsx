"use client";

import { Loader2 } from "lucide-react";

interface ToolInvocation {
  toolCallId: string;
  args: Record<string, any>;
  toolName: string;
  state: string;
  result?: any;
}

interface ToolCallDisplayProps {
  toolInvocation: ToolInvocation;
}

function getFilename(path: string): string {
  if (!path) return "file";

  // Extract filename from path (handle both Unix and Windows paths)
  const parts = path.split(/[/\\]/);
  return parts[parts.length - 1] || "file";
}

function generateUserFriendlyMessage(toolName: string, args: Record<string, any>): string {
  const { command, path, new_path } = args;

  switch (toolName) {
    case "str_replace_editor":
      const filename = getFilename(path);
      switch (command) {
        case "create":
          return `Creating ${filename}`;
        case "str_replace":
          return `Editing ${filename}`;
        case "view":
          return `Reading ${filename}`;
        case "insert":
          return `Updating ${filename}`;
        case "undo_edit":
          return `Reverting ${filename}`;
        default:
          return `Modifying ${filename}`;
      }

    case "file_manager":
      const oldFilename = getFilename(path);
      switch (command) {
        case "rename":
          const newFilename = getFilename(new_path);
          return `Renaming ${oldFilename} to ${newFilename}`;
        case "delete":
          return `Deleting ${oldFilename}`;
        default:
          return `Managing ${oldFilename}`;
      }

    default:
      // Fallback for unknown tools
      if (!path) {
        return toolName;
      }
      const fallbackFilename = getFilename(path);
      return `Processing ${fallbackFilename}`;
  }
}

export function ToolCallDisplay({ toolInvocation }: ToolCallDisplayProps) {
  const isCompleted = toolInvocation.state === "result" && toolInvocation.result;
  const message = generateUserFriendlyMessage(toolInvocation.toolName, toolInvocation.args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isCompleted ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-neutral-700">{message}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{message}</span>
        </>
      )}
    </div>
  );
}