import React, { forwardRef, useRef } from "react";
import { DesignElement, Tool } from "../types/design";
import CanvasElement from "./CanvasElement";
import { v4 as generateId } from "uuid";
import { Minus, Plus } from "lucide-react";

interface CanvasProps {
  elements: DesignElement[];
  selectedElement: string | null;
  selectedTool: Tool;
  onElementSelect: (id: string | null) => void;
  onElementAdd: (element: DesignElement) => void;
  onElementUpdate: (id: string, updates: Partial<DesignElement>) => void;
  onElementDelete: (id: string) => void;
}

type ResizeDirection = "n" | "e" | "s" | "w" | "ne" | "nw" | "se" | "sw" | null;

const Canvas = forwardRef<HTMLDivElement, CanvasProps>(
  (
    {
      elements,
      selectedElement,
      selectedTool,
      onElementSelect,
      onElementAdd,
      onElementUpdate,
      onElementDelete,
    },
    ref
  ) => {
    const highlightRef = useRef<HTMLElement>(null);
    const dragState = useRef<{
      isDragging: boolean;
      elementId: string | null;
      offset: { x: number; y: number };
      position: { x: number; y: number };
      resize: {
        dir: ResizeDirection;
        w: number;
        h: number;
        x: number;
        y: number;
      };
      dragDimensions: { width: number; height: number };
    }>({
      isDragging: false,
      elementId: null,
      offset: { x: 0, y: 0 },
      position: { x: 0, y: 0 },
      resize: { dir: null, w: 0, h: 0, x: 0, y: 0 },
      dragDimensions: { width: 0, height: 0 },
    });

    const handleCanvasMouseDown: React.MouseEventHandler<HTMLElement> = (
      event
    ) => {
      onElementSelect(null);
      const rect = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      dragState.current = {
        position,
        elementId: null,
        isDragging: true,
        resize: { dir: null, w: 0, h: 0, x: 0, y: 0 },
        offset: position,
        dragDimensions: { width: 0, height: 0 },
      };
    };

    const handleCanvasMouseUp: React.MouseEventHandler<HTMLElement> = () => {
      let elementId: string | null = null;

      if (
        !dragState.current.elementId &&
        dragState.current.isDragging &&
        selectedTool !== "select"
      ) {
        elementId = generateId();

        const newElement: DesignElement = {
          id: elementId,
          type: selectedTool,
          x: dragState.current.position.x,
          y: dragState.current.position.y,
          width: Math.max(
            selectedTool === "text" ? 100 : 40,
            Math.abs(dragState.current.dragDimensions.width)
          ),
          height: Math.max(
            selectedTool === "text" ? 40 : 40,
            Math.abs(dragState.current.dragDimensions.height)
          ),
          content: selectedTool === "text" ? "Click to edit" : "",
          style: {},
          animations: [],
          isPlayingAnimation: false,
          startAnimation: () =>
            elementId &&
            onElementUpdate(elementId, { isPlayingAnimation: true }),
          stopAnimation: () =>
            elementId &&
            onElementUpdate(elementId, { isPlayingAnimation: false }),
        };

        onElementAdd(newElement);
      }

      dragState.current = {
        elementId,
        isDragging: false,
        position: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
        resize: { dir: null, w: 0, h: 0, x: 0, y: 0 },
        dragDimensions: { width: 0, height: 0 },
      };

      if (!highlightRef.current) return;
      highlightRef.current.style.opacity = "0";
    };

    const handleMouseDown: React.MouseEventHandler<HTMLElement> = (event) => {
      event.stopPropagation();
      const element = elements.find((el) => el.id === event.currentTarget.id);

      if (!element || dragState.current.isDragging) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const offset = {
        x: event.clientX - rect.left - element.x,
        y: event.clientY - rect.top - element.y,
      };
      dragState.current = {
        ...dragState.current,
        elementId: event.currentTarget.id,
        isDragging: true,
        offset,
      };

      if ((event.target as HTMLButtonElement).value) {
        const element = elements.find(
          (el) => el.id === dragState.current.elementId
        );

        if (!element) return;
        dragState.current.resize = {
          dir: (event.target as HTMLButtonElement).value as ResizeDirection,
          w: element.width,
          h: element.height,
          x: element.x,
          y: element.y,
        };
      }

      onElementSelect(event.currentTarget.id);

      const textAreaElement =
        event.currentTarget.querySelector(".text-content");
      if (!textAreaElement) return;
      (textAreaElement as HTMLElement).focus();
    };

    const handleMouseMove: React.MouseEventHandler<HTMLElement> = (event) => {
      if (!dragState.current.isDragging) return;
      const rect = event.currentTarget.getBoundingClientRect();

      if (dragState.current.elementId) {
        const resizeDirection = dragState.current.resize.dir;

        if (resizeDirection) {
          const displacementX =
            (/w/.test(resizeDirection) ? -1 : 1) *
            (event.clientX -
              rect.left -
              dragState.current.resize.x -
              (/e/.test(resizeDirection) ? dragState.current.resize.w : 0));
          const displacementY =
            (/n/.test(resizeDirection) ? -1 : 1) *
            (event.clientY -
              rect.top -
              dragState.current.resize.y -
              (/s/.test(resizeDirection) ? dragState.current.resize.h : 0));

          const height = dragState.current.resize.h + displacementY;
          const width = dragState.current.resize.w + displacementX;
          const dimensions: Partial<DesignElement> = {};

          if (/[ns]/.test(resizeDirection)) {
            dimensions.height = Math.abs(height);
            dimensions.y =
              dragState.current.resize.y +
              (/n/.test(resizeDirection)
                ? Math.min(-displacementY, dragState.current.resize.h)
                : Math.min(0, height));
          }
          if (/[we]/.test(resizeDirection)) {
            dimensions.width = Math.abs(width);
            dimensions.x =
              dragState.current.resize.x +
              (/w/.test(resizeDirection)
                ? Math.min(-displacementX, dragState.current.resize.w)
                : Math.min(0, width));
          }

          onElementUpdate(dragState.current.elementId, dimensions);
        } else {
          const x = event.clientX - rect.left - dragState.current.offset.x;
          const y = event.clientY - rect.top - dragState.current.offset.y;

          onElementUpdate(dragState.current.elementId, { x, y });
        }
      } else {
        const dragDimensions = {
          width: event.clientX - rect.left - dragState.current.offset.x,
          height: event.clientY - rect.top - dragState.current.offset.y,
        };
        const position = {
          x: dragState.current.offset.x + Math.min(0, dragDimensions.width),
          y: dragState.current.offset.y + Math.min(0, dragDimensions.height),
        };
        dragState.current = {
          ...dragState.current,
          position,
          dragDimensions,
        };

        if (highlightRef.current && !dragState.current.elementId) {
          highlightRef.current.style.opacity = "1";
          highlightRef.current.style.borderRadius =
            selectedTool === "circle" ? "50%" : "0";
          highlightRef.current.style.transform = `translateY(${dragState.current.position.y}px) translateX(${dragState.current.position.x}px)`;
          highlightRef.current.style.width = `${Math.abs(
            dragState.current.dragDimensions.width
          )}px`;
          highlightRef.current.style.height = `${Math.abs(
            dragState.current.dragDimensions.height
          )}px`;
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const element = (event.currentTarget as HTMLElement).querySelector(
        "textarea"
      );

      if (event.key === "Delete") {
        onElementDelete((event.currentTarget as HTMLElement).id);
      }
      if (event.key === "Enter" && event.shiftKey && element) {
        element.focus();
      } else if (event.key === "Escape" || event.key === "Enter") {
        element?.blur();
      }
    };
    const handleFocus: React.FocusEventHandler<HTMLElement> = (event) => {
      onElementSelect(event.currentTarget.id);
      event.currentTarget.addEventListener("keydown", handleKeyDown);
    };

    const handleBlur: React.FocusEventHandler<HTMLElement> = (event) => {
      event.currentTarget.querySelector("textarea")?.blur();
    };

    return (
      <div className="flex-1 flex flex-col bg-slate-100 dark:bg-zinc-900 overflow-hidden relative">
        {/* Canvas Area */}
        <div className="flex-1 flex flex-col gap-8 items-center justify-center p-8">
          <div
            id="canvas-container"
            ref={ref}
            className={`
              ${
                selectedTool !== "select" ? "cursor-crosshair" : ""
              } flex-1 w-full relative bg-white dark:bg-zinc-800 shadow-2xl shadow-black/10 border border-slate-200 dark:border-zinc-700/50 rounded-lg overflow-hidden
            `}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          >
            {elements.map((element) => (
              <CanvasElement
                key={element.id}
                element={element}
                isSelected={selectedElement === element.id}
                onUpdate={(updates) => onElementUpdate(element.id, updates)}
                onDelete={() => onElementDelete(element.id)}
                onMouseDown={handleMouseDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            ))}
            <span
              ref={highlightRef}
              className="absolute top-0 left-0 block border border-dashed border-sky-400 dark:border-zinc-300 opacity-0 pointer-events-none"
            />
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-full p-2 shadow-2xl shadow-black/10 gap-3 w-fit border border-slate-200 dark:border-zinc-700/50 flex items-center">
            <button className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 flex items-center justify-center text-slate-600 dark:text-zinc-100 cursor-pointer">
              <Minus size={16} />
            </button>
            <span className="text-sm font-medium text-slate-700 dark:text-zinc-400 min-w-12 text-center">
              100%
            </span>
            <button className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 flex items-center justify-center text-slate-600 dark:text-zinc-100 cursor-pointer">
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }
);

export default Canvas;
