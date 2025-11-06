import React from "react";
import {
  MousePointer,
  Type,
  Square,
  Circle,
  Image,
  Code2,
  Upload,
  Download,
} from "lucide-react";
import { Tool } from "../types/design";

interface ToolbarProps {
  selectedTool: Tool;
  onToolSelect: (tool: Tool) => void;
  onShowCodeEditor: () => void;
  onShowImageProcessor: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  selectedTool,
  onToolSelect,
  onShowCodeEditor,
  onShowImageProcessor,
}) => {
  const tools = [
    { id: "select" as Tool, icon: MousePointer, label: "Select" },
    { id: "text" as Tool, icon: Type, label: "Text" },
    { id: "rectangle" as Tool, icon: Square, label: "Rectangle" },
    { id: "circle" as Tool, icon: Circle, label: "Circle" },
    { id: "image" as Tool, icon: Image, label: "Image" },
  ];

  return (
    <div className="w-16 bg-slate-100 dark:bg-zinc-900 border-r border-slate-700 dark:border-zinc-700/50 flex flex-col">
      {/* Design Tools */}
      <div className="flex-1 p-2 space-y-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolSelect(tool.id)}
            className={`w-full h-12 rounded-lg flex items-center justify-center transition-all duration-200 group cursor-pointer ${
              selectedTool === tool.id
                ? "bg-blue-100 dark:bg-blue-400/20 text-sky-900 dark:text-blue-100 shadow-lg"
                : "text-slate-400 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-blue-100 hover:bg-sky-100 dark:hover:bg-blue-400/5"
            }`}
            title={tool.label}
          >
            <tool.icon className="w-5 h-5" />
          </button>
        ))}

        {/* Divider */}
        <hr className="border-none outline-none w-full h-px bg-slate-700 dark:bg-zinc-700/50 my-4" />

        {/* Advanced Tools */}
        <button
          onClick={onShowCodeEditor}
          className="w-full h-12 rounded-lg flex items-center justify-center transition-all duration-200 group cursor-pointer text-slate-400 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-blue-100 hover:bg-sky-100 dark:hover:bg-blue-400/5"
          title="Code Editor"
        >
          <Code2 className="w-5 h-5" />
        </button>

        <button
          onClick={onShowImageProcessor}
          className="w-full h-12 rounded-lg flex items-center justify-center transition-all duration-200 group cursor-pointer text-slate-400 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-blue-100 hover:bg-sky-100 dark:hover:bg-blue-400/5"
          title="Image Processor"
        >
          <Upload className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Actions */}
      <div className="p-2 border-t border-slate-700 dark:border-zinc-700/50 space-y-2">
        <button
          className="w-full h-12 rounded-lg flex items-center justify-center transition-all duration-200 group cursor-pointer text-slate-400 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-blue-100 hover:bg-sky-100 dark:hover:bg-blue-400/5"
          title="Export"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
