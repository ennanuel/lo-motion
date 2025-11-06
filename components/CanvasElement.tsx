import { useEffect } from "react";
import { ImagePlus, X } from "lucide-react";
import { CanvasElementProps, RenderElementProps } from "@/types/props.type";
import { motion, Transition, useAnimationControls } from "framer-motion";
import { getTimingFunction } from "@/utils/helpers";

export default function CanvasElement({
  element,
  isSelected,
  onMouseDown,
  onUpdate,
  onDelete,
  onFocus,
  onBlur,
}: CanvasElementProps) {
  const controls = useAnimationControls();

  const startAnimationSequence = async () => {
    controls.stop();

    try {
      for (let i = 0; i < element.animations.length; i++) {
        const step = element.animations[i];
        const target = {
          [step.value]:
            step.type == "raw"
              ? step.values.map((val) =>
                  /[^0-9]/i.test(val) ? val : Number(val)
                )
              : step.values,
        };
        const ease = getTimingFunction(step.ease);

        const transition: Transition = {
          delay: Number(step.delay),
          duration: Number(step.duration),
          ease: ease,
          onComplete: () => {
            controls.stop();
            element.stopAnimation();
          },
        };
        controls.start(target, transition);
      }
    } catch (error) {
      console.error((error as Error).message);
    }
  };

  useEffect(() => {
    if (element.isPlayingAnimation) {
      startAnimationSequence();
    }
  }, [element.isPlayingAnimation, startAnimationSequence]);

  return (
    <div
      id={element.id}
      onMouseDown={onMouseDown}
      onFocus={onFocus}
      onBlur={onBlur}
      tabIndex={2}
      className={`${
        element.type == "text" ? "cursor-text" : "cursor-move"
      } group focus:outline-none focus:border-none`}
    >
      <div
        className={`${
          isSelected || element.isPlayingAnimation
            ? element.isPlayingAnimation
              ? "opacity-0 pointer-events-none"
              : ""
            : `group-hover:opacity-100 group-focus:opacity-100 pointer-events-none opacity-0`
        } border border-sky-600 dark:border-zinc-400 absolute`}
        style={{
          left: element.x - 2,
          top: element.y - 2,
          width: element.width + 4,
          height: element.height + 4,
        }}
      >
        {/* Resize Handles */}
        {isSelected
          ? [
              {
                className:
                  "top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nw-resize",
                value: "nw",
              },
              {
                className:
                  "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-se-resize",
                value: "se",
              },
              {
                className:
                  "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-sw-resize",
                value: "sw",
              },
              {
                className:
                  "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 cursor-w-resize",
                value: "w",
              },
              {
                className:
                  "top-1/2 right-0 translate-x-1/2 -translate-y-1/2 cursor-e-resize",
                value: "e",
              },
              {
                className:
                  "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-n-resize",
                value: "n",
              },
              {
                className:
                  "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-s-resize",
                value: "s",
              },
            ].map(({ className, value }) => (
              <button
                key={className}
                value={value}
                className={`${className} bg-sky-600 dark:bg-zinc-300 absolute z-1 block w-2 aspect-square rounded-md focus:outline-none hover:outline-none`}
              />
            ))
          : null}

        {/* Delete Button */}
        {isSelected ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute z-1 top-0 right-0 translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 text-red-100 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:scale-90 hover:cursor-pointer"
          >
            <X className="-ml-px -mt-px w-3 h-3" />
          </button>
        ) : null}
      </div>
      <RenderElement
        element={element}
        controls={controls}
        onUpdate={onUpdate}
      />
    </div>
  );
}

function RenderElement({ element, controls, onUpdate }: RenderElementProps) {
  const commonStyle = {
    position: "absolute" as const,
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
  };

  switch (element.type) {
    case "text":
      return element.isPlayingAnimation ? (
        <motion.div
          animate={controls}
          style={{
            ...commonStyle,
            ...element.style,
          }}
          className="font-inter text-base text-black dark:text-100 text-content overflow-hidden border border-dashed border-zinc-600 dark:border-zinc-400 focus:outline-none cursor-text"
        />
      ) : (
        <div
          contentEditable
          onBlur={(event) => {
            const content = event.currentTarget.textContent?.length
              ? event.currentTarget.textContent
              : "Add text";
            event.currentTarget.textContent = content;
            onUpdate({ content });
          }}
          style={{
            ...commonStyle,
            ...element.style,
          }}
          className="font-inter text-base text-black dark:text-100 text-content overflow-hidden border border-dashed border-zinc-600 dark:border-zinc-400 focus:outline-none cursor-text"
        />
      );

    case "rectangle":
      return element.isPlayingAnimation ? (
        <motion.div
          animate={controls}
          style={{
            ...commonStyle,
            ...element.style,
          }}
          className="bg-gray-400 dark:bg-zinc-600 border border-white dark:border-zinc-800 rounded-md"
        />
      ) : (
        <div
          style={{
            ...commonStyle,
            ...element.style,
          }}
          className="bg-gray-400 dark:bg-zinc-600 border border-white dark:border-zinc-800 rounded-md"
        />
      );

    case "circle":
      return element.isPlayingAnimation ? (
        <motion.div
          animate={controls}
          style={{
            ...commonStyle,
            ...element.style,
          }}
          className="bg-gray-400 dark:bg-zinc-600  border border-white dark:border-zinc-800 rounded-[50%]"
        />
      ) : (
        <div
          style={{
            ...commonStyle,
            ...element.style,
          }}
          className="bg-gray-400 dark:bg-zinc-600  border border-white dark:border-zinc-800 rounded-[50%]"
        />
      );

    case "image":
      return element.isPlayingAnimation ? (
        <motion.div
          animate={controls}
          style={{
            ...commonStyle,
            ...element.style,
            backgroundImage: element.content
              ? `url(${element.content})`
              : undefined,
          }}
          className="flex items-center justify-center text-slate-500 dark:text-zinc-500 bg-cover bg-gray-400 dark:bg-zinc-600  border border-white dark:border-zinc-800 rounded-md"
        >
          {!element.content ? (
            <ImagePlus className="w-1/2 max-w-9 aspect-square" />
          ) : null}
        </motion.div>
      ) : (
        <label
          htmlFor={`${element.id}-image`}
          style={{
            ...commonStyle,
            ...element.style,
            backgroundImage: element.content
              ? `url(${element.content})`
              : undefined,
          }}
          className="flex items-center justify-center text-slate-500 dark:text-zinc-500 bg-cover bg-gray-400 dark:bg-zinc-600  border border-white dark:border-zinc-800 rounded-md"
        >
          {!element.content ? (
            <ImagePlus className="w-1/2 aspect-square max-w-9" />
          ) : null}
          <input
            id={`${element.id}-image`}
            type="file"
            onChange={(event) => {
              if (!event.target?.files?.[0]) return;
              const fileReader = new FileReader();
              fileReader.onload = () => {
                onUpdate({ content: String(fileReader.result) });
              };
              fileReader.readAsDataURL(event.target.files[0]);
            }}
            className="hidden"
          />
        </label>
      );

    default:
      return null;
  }
}
