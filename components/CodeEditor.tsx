import React, { useEffect, useRef, useState } from "react";
import { X, Play, Book } from "lucide-react";
import { DesignElement } from "../types/design";

import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  onClose: () => void;
  onExecute: (code: string) => void;
  elements: DesignElement[];
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  onClose,
  onExecute,
  elements,
}) => {
  const [editorHeight, setEditorHeight] = useState(0);
  const [code, setCode] = useState(`// Design Manipulation API
// Available functions:
// - context.addElement(element)
// - context.updateElement(id, updates)
// - context.deleteElement(id)
// - context.setSelectedElement(id)

// Example: Create a red rectangle
context.addElement({
  id: 'rect-' + Date.now(),
  type: 'rectangle',
  x: 100,
  y: 100,
  width: 150,
  height: 100,
  style: {
    fill: '#ef4444',
    stroke: '#ffffff',
    strokeWidth: 2
  }
});

// Example: Update all text elements to be blue
context.elements
  .filter(el => el.type === 'text')
  .forEach(el => {
    context.updateElement(el.id, {
      style: { ...el.style, fill: '#3b82f6' }
    });
  });`);

  const outputTimeout = useRef<NodeJS.Timeout>(undefined);
  const [output, setOutput] = useState("");

  const handleExecute = () => {
    if (outputTimeout) clearTimeout(outputTimeout.current);

    try {
      onExecute(code);
      setOutput("✅ Code executed successfully!");
    } catch (error) {
      setOutput(`❌ Error: ${(error as Error).message}`);
    } finally {
      outputTimeout.current = setTimeout(() => setOutput(""), 5000);
    }
  };

  const examples = [
    {
      title: "Create Multiple Shapes",
      code: `// Create a grid of colorful circles
const colors = ['#ef4444', '#10b981', '#3b82f6', '#f59e0b'];
for (let i = 0; i < 4; i++) {
  for (let j = 0; j < 4; j++) {
    context.addElement({
      id: \`circle-\${i}-\${j}\`,
      type: 'circle',
      x: 50 + i * 120,
      y: 50 + j * 120,
      width: 80,
      height: 80,
      style: {
        fill: colors[(i + j) % 4],
        stroke: '#ffffff',
        strokeWidth: 3
      }
    });
  }
}`,
    },
    {
      title: "Animate Elements",
      code: `// Animate all rectangles in a wave pattern
const rectangles = context.elements.filter(el => el.type === 'rectangle');
rectangles.forEach((rect, index) => {
  setTimeout(() => {
    context.updateElement(rect.id, {
      y: rect.y + Math.sin(index) * 50,
      style: { ...rect.style, fill: '#8b5cf6' }
    });
  }, index * 100);
});`,
    },
    {
      title: "Batch Text Styling",
      code: `// Style all text elements with gradient colors
const textElements = context.elements.filter(el => el.type === 'text');
const gradientColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];

textElements.forEach((text, index) => {
  context.updateElement(text.id, {
    style: {
      ...text.style,
      fill: gradientColors[index % gradientColors.length],
      fontSize: 24,
      fontFamily: 'Inter, sans-serif'
    }
  });
});`,
    },
  ];

  useEffect(() => {
    const rect = document
      .getElementById("code-editor-container")
      ?.getBoundingClientRect();
    const rectHeader = document
      .getElementById("code-editor-header")
      ?.getBoundingClientRect();
    const rectExecuteBar = document
      .getElementById("code-editor-execute-bar")
      ?.getBoundingClientRect();
    const rectOutput = document
      .getElementById("code-output")
      ?.getBoundingClientRect();

    if (!rect || !rectHeader || !rectExecuteBar || !rectOutput) return;
    const height =
      rect.height -
      (rectHeader.height + rectExecuteBar.height + rectOutput.height);
    setEditorHeight(height);
  }, [output]);

  return (
    <div className="fixed top-0 left-0 w-full h-full p-10 bg-black/50 flex items-center justify-center">
      <div
        id="code-editor-container"
        className="bg-gray-100 dark:bg-zinc-800 rounded-xl overflow-hidden shadow-2xl w-full h-full max-h-[600px] max-w-[1120px] flex flex-col"
      >
        {/* Header */}
        <div
          id="code-editor-header"
          className="min-h-20 flex items-center justify-between px-6 border-b border-gray-200 dark:border-zinc-700"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-sky-400/20 dark:bg-sky-400/20 rounded-lg flex items-center justify-center">
              <Book className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            </div>
            <h2 className="text-xl font-semibold text-zinc-800 dark:text-white">
              Code Editor
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-red-200 dark:bg-zinc-700 hover:bg-red-600 dark:hover:bg-zinc-600 flex items-center justify-center text-red-600 dark:text-zinc-300 hover:text-red-100 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="h-[calc(100%-80px)] grid grid-cols-[1fr_320px]">
          {/* Code Editor */}
          <div className="flex-1 flex flex-col">
            <div
              id="code-editor-execute-bar"
              className="flex items-center justify-between px-4 h-18 border-b border-gray-200 dark:border-zinc-700"
            >
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                JavaScript Editor
              </h3>
              <button
                onClick={handleExecute}
                className="px-4 h-10 bg-green-400/20 hover:bg-green-400/30 text-green-400 dark:text-green-200 rounded-md flex items-center space-x-2 transition-colors"
              >
                <Play className="w-4 h-4" />
                <span className="text-sm font-semibold">Execute</span>
              </button>
            </div>
            <Editor
              height={`${editorHeight}px`}
              width="100%"
              className="flex-1 bg-slate-900 text-white"
              defaultLanguage="javascript"
              theme="vs-dark"
              options={{
                fontSize: 12,
                minimap: { enabled: false },
              }}
              defaultValue={code}
              onChange={(value) => (value ? setCode(value) : null)}
            />
            <div
              id="code-output"
              className={`${
                !output
                  ? "p-0 h-0 border-transparent"
                  : "p-4 border-t bg-gray-200 dark:bg-zinc-900 border-gray-200 dark:border-zinc-700/50 dark:border-zinc-70 text-sm"
              }`}
            >
              <pre className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                {output}
              </pre>
            </div>
          </div>

          {/* Examples Sidebar */}
          <div className="flex flex-1 h-full max-w-80 overflow-y-auto flex-col bg-gray-200 dark:bg-zinc-900 border-l border-gray-200 dark:border-zinc-700">
            <div className="p-4 border-b border-gray-200 dark:border-zinc-700">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Examples
              </h3>
            </div>
            <div className="p-4 space-y-4">
              {examples.map((example, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-100 dark:bg-zinc-800 rounded-lg cursor-pointer hover:bg-slate-750 transition-colors"
                  onClick={() => setCode(example.code)}
                >
                  <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2">
                    {example.title}
                  </h4>
                  <pre className="text-xs text-gray-500 dark:text-zinc-400 overflow-hidden">
                    {example.code.split("\n").slice(0, 3).join("\n")}...
                  </pre>
                </div>
              ))}
            </div>

            {/* Current Elements Info */}
            <div className="flex flex-col border-t border-gray-200 dark:border-zinc-700">
              <div className="p-4">
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Current Elements
                </h3>
              </div>
              <div className="space-y-2 p-4">
                {elements.map((element) => (
                  <div
                    key={element.id}
                    className="text-xs text-zinc-500 dark:text-zinc-400 p-2 rounded bg-gray-100 dark:bg-zinc-800 cursor-pointer hover:bg-slate-750 transition-colors"
                  >
                    <div className="font-medium capitalize">{element.type}</div>
                    <div>ID: {element.id}</div>
                    <div>
                      Position: ({Math.round(element.x)},{" "}
                      {Math.round(element.y)})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
