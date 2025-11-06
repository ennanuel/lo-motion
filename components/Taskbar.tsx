import { Palette } from "lucide-react";
import React, { useRef, useState } from "react";

export default function Taskbar({
  title,
  width,
  height,
  onTitleChange,
  playAnimations,
}: {
  title: string;
  width: number;
  height: number;
  onTitleChange: React.ChangeEventHandler<HTMLInputElement>;
  playAnimations: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const startEditing = () => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };
  const stopEditing = () => {
    setIsEditing(false);
  };
  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
    event
  ) => {
    if (event.key === "Enter") stopEditing();
  };

  return (
    <div className="w-full grid grid-cols-[64px_1fr] gap-4 h-16 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 pr-6">
      <div className="flex items-center justify-center">
        <div className="w-10 aspect-square bg-purple-200 dark:bg-zinc-700 rounded-full flex items-center justify-center">
          <Palette className="w-5 h-5 text-purple-800 dark:text-zinc-200" />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="max-w-80">
            {!isEditing ? (
              <h1
                onClick={startEditing}
                className="px-2 truncate w-full text-[1.24rem] leading-[1.4rem] font-semibold text-slate-800 dark:text-zinc-100 cursor-pointer"
              >
                {title || "Untitled Design"}
              </h1>
            ) : (
              <input
                className="w-full min-w-auto h-[1.4rem] text-[1.24rem] font-semibold text-slate-800 dark:text-zinc-100 px-2"
                ref={inputRef}
                onKeyDown={handleKeyDown}
                onBlur={stopEditing}
                onChange={onTitleChange}
                value={title}
              />
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-zinc-400">
            <span>
              {Math.floor(width)} × {Math.floor(height)}
            </span>
            <span>•</span>
            <span>100%</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <button
            onClick={playAnimations}
            className="px-4 h-9 flex items-center justify-center bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors font-semibold cursor-pointer"
          >
            Preview
          </button>
          <button className="px-4 h-9 flex items-center justify-center bg-zinc-600 text-white rounded-full hover:bg-zinc-700 transition-colors font-semibold cursor-pointer">
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
