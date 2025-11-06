"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Toolbar from "./Toolbar";
import Canvas from "./Canvas";
import PropertiesPanel from "./PropertiesPanel";
import CodeEditor from "./CodeEditor";
import ImageProcessor from "./ImageProcessor";
import { DesignElement, Tool } from "../types/design";
import Taskbar from "./Taskbar";

const DesignStudio: React.FC = () => {
  const [docDetails, setDocDetails] = useState({
    title: "Untitled Design",
    width: 0,
    height: 0,
  });
  const [selectedTool, setSelectedTool] = useState<Tool>("select");
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [showImageProcessor, setShowImageProcessor] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const addElement = useCallback((element: DesignElement) => {
    setElements((prev) => [...prev, element]);
    setTimeout(() => {
      if (element.type === "text") {
        const textArea = document
          .getElementById(element.id)
          ?.querySelector(".text-content") as HTMLElement;
        textArea.textContent = element.content || "Add text content";
        textArea?.focus();

        const range = document.createRange();
        range.selectNodeContents(textArea);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      } else {
        document.getElementById(element.id)?.focus();
      }
    }, 50);
  }, []);

  const updateElement = useCallback(
    (id: string, updates: Partial<DesignElement>) => {
      setElements((prev) =>
        prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
      );
    },
    []
  );

  const deleteElement = useCallback(
    (id: string) => {
      setElements((prev) => prev.filter((el) => el.id !== id));
      if (selectedElement === id) {
        setSelectedElement(null);
      }
    },
    [selectedElement]
  );
  const rearrangeElements = (initial: number, final: number) => {
    if (
      initial < 0 ||
      initial > elements.length - 1 ||
      final < 0 ||
      final > elements.length - 1
    )
      return;
    const newElements = [...elements];
    newElements[initial] = elements[final];
    newElements[final] = elements[initial];
    setElements(newElements);
  };

  const executeCode = useCallback(
    (code: string) => {
      try {
        // Create a safe execution context
        const context = {
          elements,
          addElement,
          updateElement,
          deleteElement,
          setSelectedElement,
        };

        // Execute the code in the context
        const func = new Function("context", code);
        func(context);
      } catch (error) {
        console.error("Code execution error:", error);
      }
    },
    [elements, addElement, updateElement, deleteElement]
  );

  const playAnimations = () => {
    elements.forEach((element) => {
      updateElement(element.id, { isPlayingAnimation: true });
    });
  };

  useEffect(() => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDocDetails((prev) => ({
      ...prev,
      width: rect.width,
      height: rect.height,
    }));
  }, [canvasRef]);

  return (
    <div className="flex w-full h-screen bg-slate-900">
      <div className="flex-1 flex flex-col">
        <Taskbar
          {...docDetails}
          playAnimations={playAnimations}
          onTitleChange={(event) =>
            setDocDetails((prev) => ({
              ...prev,
              title: event.target.value,
            }))
          }
        />
        <div className="flex-1 flex">
          {/* Toolbar */}
          <Toolbar
            selectedTool={selectedTool}
            onToolSelect={setSelectedTool}
            onShowCodeEditor={() => setShowCodeEditor(true)}
            onShowImageProcessor={() => setShowImageProcessor(true)}
          />
          <Canvas
            ref={canvasRef}
            elements={elements}
            selectedElement={selectedElement}
            selectedTool={selectedTool}
            onElementSelect={setSelectedElement}
            onElementAdd={addElement}
            onElementUpdate={updateElement}
            onElementDelete={deleteElement}
          />
        </div>
      </div>

      {/* Properties Panel */}
      <PropertiesPanel
        rearrangeElements={rearrangeElements}
        onElementRemove={(id: string) =>
          setElements((prev) => prev.filter((el) => el.id != id))
        }
        onElementSelect={(id: string) => setSelectedElement(id)}
        selectedElement={
          elements.find((el) => el.id === selectedElement) || null
        }
        onElementUpdate={updateElement}
        elements={elements}
      />

      {/* Code Editor Modal */}
      {showCodeEditor && (
        <CodeEditor
          onClose={() => setShowCodeEditor(false)}
          onExecute={executeCode}
          elements={elements}
        />
      )}

      {/* Image Processor Modal */}
      {showImageProcessor && (
        <ImageProcessor
          onClose={() => setShowImageProcessor(false)}
          onElementsExtracted={(extractedElements) => {
            extractedElements.forEach(addElement);
          }}
        />
      )}
    </div>
  );
};

export default DesignStudio;
