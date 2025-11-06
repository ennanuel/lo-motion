import React, { JSX, useRef } from "react";
import { DesignElement, SelectedAnimationProperty } from "../types/design";
import {
  Palette,
  Type,
  Move,
  LucideProps,
  Layers,
  GripHorizontal,
  Settings,
  Plus,
  Minus,
  X,
  Puzzle,
} from "lucide-react";
import { v4 as generateId } from "uuid";
import { ANIMATION_PROPERTIES } from "@/utils/constants";
import {
  AnimationControlPanelProps,
  InputProps,
  PropertiesPanelProps,
} from "@/types/props.type";

const MIN_HEIGHT = 64;
const PROPERTIES_PANEL_ID = "properties-panel-container";
const CANVAS_PANEL_ID = "canvas-layers-panel-container";
const ANIMATIONS_PANEL_ID = "animations-panel-container";

export default function PropertiesPanel({
  selectedElement,
  rearrangeElements,
  onElementUpdate,
  onElementSelect,
  onElementRemove,
  elements,
}: PropertiesPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<{
    panelId: string | null;
    isResizing: boolean;
    offset: {
      panels: { id: string; height: number }[];
      y: number;
    };
  }>({
    panelId: null,
    isResizing: false,
    offset: {
      panels: [],
      y: 0,
    },
  });

  const updateStyle = (styleUpdates: Record<string, any>) => {
    if (!selectedElement) return;
    onElementUpdate(selectedElement.id, {
      style: { ...selectedElement.style, ...styleUpdates },
    });
  };

  const handleMouseDown: React.MouseEventHandler<HTMLButtonElement> = (
    event
  ) => {
    const value = event.currentTarget.value;
    if (!value || resizeRef.current.panelId) return;

    const panels = [
      value,
      CANVAS_PANEL_ID,
      value === PROPERTIES_PANEL_ID ? ANIMATIONS_PANEL_ID : PROPERTIES_PANEL_ID,
    ].map((panel) => ({
      id: panel,
      height:
        document.getElementById(panel)?.getBoundingClientRect()?.height || 0,
    }));

    resizeRef.current = {
      panelId: value,
      isResizing: true,
      offset: {
        panels,
        y: event.clientY,
      },
    };
  };
  const handleMouseMove: React.MouseEventHandler<
    HTMLButtonElement | HTMLDivElement
  > = (event) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!resizeRef.current.isResizing || !containerRect) return;

    let displacement =
      resizeRef.current.panelId === PROPERTIES_PANEL_ID
        ? event.clientY - resizeRef.current.offset.y
        : resizeRef.current.offset.y - event.clientY;

    const maxHeight =
      (containerRef.current?.getBoundingClientRect()?.height || 0) -
      (MIN_HEIGHT + 16) * 2;
    const calculatedHeight =
      resizeRef.current.offset.panels[0].height + displacement;
    const height = Math.max(MIN_HEIGHT, Math.min(maxHeight, calculatedHeight));

    for (let i = 0; i < resizeRef.current.offset.panels.length; i++) {
      const currentPanel = resizeRef.current.offset.panels[i];
      const doc = document.getElementById(currentPanel.id);
      if (!doc) continue;
      if (resizeRef.current.panelId == currentPanel.id) {
        doc.style.height = `${height}px`;
        if (height <= 64 && displacement < 0) break;
      } else {
        doc.style.height = `${Math.max(
          64,
          currentPanel.height - displacement
        )}px`;
        displacement = Math.max(0, displacement + 64 - currentPanel.height);
      }
    }
  };
  const handleMouseUp: React.MouseEventHandler<
    HTMLButtonElement | HTMLDivElement
  > = () => {
    resizeRef.current = {
      panelId: null,
      isResizing: false,
      offset: {
        y: 0,
        panels: [],
      },
    };
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="max-w-80 flex-1 flex flex-col justify-stretch bg-gray-100 dark:bg-zinc-800 border-l border-slate-700 dark:border-zinc-700/50"
    >
      {!selectedElement ? (
        <div
          id={PROPERTIES_PANEL_ID}
          className="w-full flex-1 border-b border-slate-700 dark:border-zinc-700/50 overflow-y-auto flex flex-col"
        >
          <div className="px-6 min-h-16 sticky top-0 z-1 bg-gray-100 dark:bg-zinc-800 flex items-center border-b border-slate-700 dark:border-zinc-700/50">
            <FieldTitle Icon={Puzzle}>Properties</FieldTitle>
          </div>
          <div className="flex flex-col justify-center items-center flex-1 p-6">
            <div className="flex flex-col justify-center items-center text-center text-zinc-600 dark:text-zinc-400">
              <Palette className="w-12 h-12 mx-auto mb-6 opacity-50" />
              <h3 className="text-lg font-medium">No element selected</h3>
              <p className="text-sm">
                Select an element to edit its properties
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div
          id={PROPERTIES_PANEL_ID}
          className="flex-1 w-full border-b border-slate-700 dark:border-zinc-700/50 overflow-y-auto"
        >
          {/* Header */}
          <div className="px-6 min-h-16 sticky top-0 z-1 bg-gray-100 dark:bg-zinc-800 flex items-center border-b border-slate-700 dark:border-zinc-700/50">
            <FieldTitle
              Icon={Puzzle}
            >{`${selectedElement.type} Properties`}</FieldTitle>
          </div>

          {/* Position & Size */}
          <PropertiesGroup>
            <FieldTitle Icon={Move}>Position & Size</FieldTitle>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  title: "X",
                  id: "x-input",
                  fieldname: "x",
                },
                {
                  title: "Y",
                  id: "y-input",
                  fieldname: "y",
                },
                {
                  title: "Width",
                  id: "width-input",
                  fieldname: "width",
                },
                {
                  title: "height",
                  id: "height-input",
                  fieldname: "height",
                },
              ].map(({ title, id, fieldname }) => (
                <InputAndLabel
                  key={title}
                  id={id}
                  labelText={title}
                  value={
                    selectedElement[fieldname as keyof DesignElement]
                      ? Math.round(
                          Number(
                            selectedElement[fieldname as keyof DesignElement]
                          )
                        )
                      : ""
                  }
                  onChange={(e) =>
                    onElementUpdate(selectedElement.id, {
                      [fieldname]: Number(e.target.value),
                    })
                  }
                />
              ))}
            </div>
          </PropertiesGroup>

          {/* Style Properties */}
          <PropertiesGroup>
            <FieldTitle Icon={Palette}>Appearance</FieldTitle>
            <div className="space-y-4">
              <ColorInputAndLabel
                id="fill-color-input"
                labelText="Fill Color"
                value={selectedElement.style?.background}
                onChange={(e) => updateStyle({ background: e.target.value })}
              />
              <ColorInputAndLabel
                id="stroke-color-input"
                labelText="Stroke Color"
                value={selectedElement.style?.borderColor}
                onChange={(e) => updateStyle({ borderColor: e.target.value })}
              />
              <RangeInputAndLabel
                id="stroke-width-input"
                labelText="Stroke Width"
                min={0}
                value={selectedElement.style?.borderWidth}
                onChange={(e) =>
                  updateStyle({ borderWidth: Number(e.target.value) })
                }
              />
            </div>
          </PropertiesGroup>

          {/* Text Properties */}
          {selectedElement.type === "text" && (
            <PropertiesGroup noBorder>
              <FieldTitle Icon={Type}>Typography</FieldTitle>
              <div className="space-y-4">
                <RangeInputAndLabel
                  id="font-size-input"
                  labelText="Font Size"
                  value={selectedElement.style?.fontSize}
                  onChange={(e) =>
                    updateStyle({ fontSize: Number(e.target.value) })
                  }
                />
                <SelectInputAndLabel
                  id="font-family-input"
                  labelText="Font Family"
                  value={
                    selectedElement.style?.fontFamily || "Inter, sans-serif"
                  }
                  onChange={(e) => updateStyle({ fontFamily: e.target.value })}
                  options={[
                    { value: "Inter", title: "Inter, sans-serif" },
                    {
                      value: "Helvetica, Arial, sans-serif",
                      title: "Helvetica",
                    },
                    { value: "Times, serif", title: "Times" },
                    { value: "Courier, monospace", title: "Courier" },
                  ]}
                />
                <ColorInputAndLabel
                  id="stroke-color-input"
                  labelText="Color"
                  value={selectedElement.style?.color}
                  onChange={(e) => updateStyle({ color: e.target.value })}
                />
              </div>
            </PropertiesGroup>
          )}
        </div>
      )}
      <button
        value={PROPERTIES_PANEL_ID}
        onMouseDown={handleMouseDown}
        className="w-full h-4 rounded-none outline-3 outline-transparent bg-gray-100 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700/50 hover:bg-gray-200 dark:hover:bg-zinc-900/50 text-gray-400 dark:text-zinc-500 flex items-center justify-center cursor-ns-resize"
      >
        <GripHorizontal className="h-3" />
      </button>
      <CanvasLayers
        selectedElement={selectedElement}
        elements={elements}
        selectElement={onElementSelect}
        removeElement={onElementRemove}
        rearrangeElements={rearrangeElements}
      />
      <button
        value={ANIMATIONS_PANEL_ID}
        onMouseDown={handleMouseDown}
        className="w-full h-4 rounded-none outline-3 outline-transparent bg-gray-100 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700/50 hover:bg-gray-200 dark:hover:bg-zinc-900/50 text-gray-400 dark:text-zinc-500 flex items-center justify-center cursor-ns-resize"
      >
        <GripHorizontal className="h-3" />
      </button>
      <AnimationPanel
        onElementUpdate={onElementUpdate}
        selectedElement={selectedElement}
      />
    </div>
  );
}

function PropertiesGroup({
  children,
  noBorder,
}: {
  children: JSX.Element[];
  noBorder?: boolean;
}) {
  return (
    <div
      className={`p-6 flex flex-col gap-4 ${
        !noBorder ? "border-b border-slate-700 dark:border-zinc-700/50" : ""
      }`}
    >
      {children}
    </div>
  );
}

function FieldTitle({
  children,
  Icon,
}: {
  children: string;
  Icon?: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
}) {
  return (
    <h3 className="text-sm flex items-center gap-2 capitalize">
      {Icon ? <Icon className="w-4 h-4" /> : null}
      <span className="font-medium">{children}</span>
    </h3>
  );
}

function LabelTitle({ text, id }: { text: string; id: string }) {
  return (
    <label
      htmlFor={id}
      className="block text-xs text-zinc-600 dark:text-zinc-400"
    >
      {text}
    </label>
  );
}

function InputAndLabel({
  labelText,
  id,
  gap = 4,
  inputType = "number",
  value = "",
  placeholder,
  onChange,
}: InputProps) {
  return (
    <div style={{ gap: `${gap}px` }} className="flex flex-col">
      <LabelTitle id={id} text={labelText} />
      <input
        id={id}
        type={inputType}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className="w-full px-3 h-10 bg-gray-200 dark:bg-zinc-900 border border-gray-300/50 dark:border-zinc-700/50 rounded-md text-zinc-800 dark:text-zinc-200 text-sm focus:outline-none focus:border-gray-300 dark:focus:border-zinc-700"
      />
    </div>
  );
}

function ColorInputAndLabel({
  id,
  labelText,
  gap = 8,
  value = "",
  onChange,
}: InputProps) {
  return (
    <div style={{ gap: `${gap}px` }} className="flex flex-col">
      <LabelTitle id={id} text={labelText} />
      <div className="flex items-center space-x-2">
        <div className="w-10 aspect-square rounded-md overflow-hidden flex items-center justify-center">
          <input
            type="color"
            value={value}
            onChange={onChange}
            className="min-w-20 h-20"
          />
        </div>
        <input
          id={id}
          type="text"
          value={value}
          onChange={onChange}
          className="w-full px-3 h-10 bg-gray-200 dark:bg-zinc-900 border border-gray-300/50 dark:border-zinc-700/50 rounded-md text-zinc-800 dark:text-zinc-200 text-sm focus:outline-none focus:border-gray-300 dark:focus:border-zinc-700"
        />
      </div>
    </div>
  );
}

function RangeInputAndLabel({
  id,
  gap = 8,
  labelText,
  value = "",
  min = 0,
  max = 100,
  onChange,
}: InputProps) {
  return (
    <div style={{ gap: `${gap}px` }} className="flex flex-col gap-2">
      <div className="flex itemss-center justify-between">
        <LabelTitle id={id} text={labelText} />
        <p className="text-xs text-zinc-600 dark:text-zinc-400">{value}px</p>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        className="w-full"
      />
    </div>
  );
}

function SelectInputAndLabel({
  id,
  gap = 8,
  labelText,
  value,
  options,
  onChange,
}: InputProps) {
  return (
    <div style={{ gap: `${gap}px` }} className="flex flex-col">
      <LabelTitle id={id} text={labelText} />
      <select
        value={value}
        onChange={onChange}
        className="w-full px-3 h-10 bg-gray-200 dark:bg-zinc-900 border border-gray-300/50 dark:border-zinc-700/50 rounded-md text-zinc-800 dark:text-zinc-200 text-sm focus:outline-none focus:border-gray-300 dark:focus:border-zinc-700"
      >
        {options?.map(({ title, value }) => (
          <option key={title} value={value}>
            {title}
          </option>
        ))}
      </select>
    </div>
  );
}

function CanvasLayers({
  elements,
  selectedElement,
  selectElement,
  removeElement,
  rearrangeElements,
}: {
  selectedElement: DesignElement | null;
  elements: DesignElement[];
  selectElement: (id: string) => void;
  removeElement: (id: string) => void;
  rearrangeElements: (iniial: number, final: number) => void;
}) {
  const initialElementIndex = useRef(-1);
  const finalElementIndex = useRef(-1);

  const handleKeyDown: EventListener = (event) => {
    if ((event as KeyboardEvent).key === "Delete") {
      removeElement((event.currentTarget as HTMLButtonElement).value);
    }
  };
  const setIndices = (index: number) => {
    initialElementIndex.current = finalElementIndex.current = index;
  };
  const setFinalIndex = (index: number) => {
    finalElementIndex.current = index;
  };
  const stopDragging = () => {
    rearrangeElements(initialElementIndex.current, finalElementIndex.current);
    finalElementIndex.current = initialElementIndex.current = -1;
  };

  return (
    <div
      id={CANVAS_PANEL_ID}
      className="w-full overflow-y-scroll flex flex-col border-b border-gray-200 dark:border-zinc-700/50"
    >
      <div className="px-6 min-h-16 flex items-center sticky top-0 z-1 bg-zinc-800 border-b border-gray-200 dark:border-zinc-700/50">
        <FieldTitle Icon={Layers}>Layers</FieldTitle>
      </div>
      {elements.length > 0 ? (
        <div className="space-y-2 px-6 py-4">
          {elements.map((element, index) => (
            <button
              draggable
              key={element.id}
              value={element.id}
              onDragStart={() => setIndices(index)}
              onDragOver={() => setFinalIndex(index)}
              onDragEnd={() => stopDragging()}
              onFocus={(event) => {
                selectElement(event.currentTarget.value);
                event.currentTarget.scrollIntoView();
                event.currentTarget.addEventListener("keydown", handleKeyDown);
              }}
              onBlur={(event) => {
                event.currentTarget.removeEventListener(
                  "keydown",
                  handleKeyDown
                );
              }}
              className={`p-3 w-full flex flex-col gap-1 text-left rounded-md cursor-pointer transition-colors ${
                selectedElement?.id === element.id
                  ? "bg-sky-300 dark:bg-zinc-700 text-sky-900 dark:text-zinc-300"
                  : "bg-sky-100 dark:bg-zinc-900 text-sky-800 dark:text-zinc-400 hover:bg-sky-200 dark:hover:bg-zinc-900/70"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm capitalize">{element.type}</span>
                <span className="text-xs opacity-75">
                  #{elements.length - index}
                </span>
              </div>
              {element.content && (
                <div className="text-xs opacity-75">
                  {element.content.length > 20
                    ? `${element.content.substring(0, 20)}...`
                    : element.content}
                </div>
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const DEFAULT_ANIMATION_PROPERTY = {
  duration: 3,
  delay: 0,
  title: "",
  value: "",
  values: ["", ""],
};

function AnimationPanel({
  selectedElement,
  onElementUpdate,
}: {
  selectedElement: DesignElement | null;
  onElementUpdate: (id: string, updates: Partial<DesignElement>) => void;
}) {
  const addAnimationProperty = () => {
    if (!selectedElement?.id) return;

    const id = generateId();
    const newAnimationProperty: SelectedAnimationProperty = {
      id,
      type: "dimension",
      ease: "linear",
      ...DEFAULT_ANIMATION_PROPERTY,
    };
    onElementUpdate(selectedElement.id, {
      animations: [newAnimationProperty, ...selectedElement.animations],
    });
  };
  const removeAnimationProperty = (id: string) => () => {
    if (!selectedElement?.id) return;
    onElementUpdate(selectedElement.id, {
      animations: selectedElement.animations.filter((prop) => prop.id !== id),
    });
  };
  const handlePropertySelection = ({
    id,
    value,
  }: {
    id: string;
    value: string;
  }) => {
    if (!selectedElement?.id) return;

    const newProperty = {
      ...DEFAULT_ANIMATION_PROPERTY,
      ...ANIMATION_PROPERTIES.find((prop) => prop.value === value),
    };

    onElementUpdate(selectedElement.id, {
      animations: selectedElement.animations.map((prop) =>
        prop.id === id && prop.value !== value
          ? { ...prop, ...newProperty }
          : prop
      ),
    });
  };
  const handlePropertyValueSelection = ({
    id,
    index,
    value,
    fieldname,
  }: {
    id: string;
    index: number;
    value: string;
    fieldname?: string;
  }) => {
    if (!selectedElement?.id) return;

    onElementUpdate(selectedElement.id, {
      animations: selectedElement.animations.map((prop) =>
        prop.id === id
          ? {
              ...prop,
              ...(fieldname && fieldname !== "values"
                ? { [fieldname]: value }
                : {
                    values: prop.values.map((val, i) =>
                      i === index ? value : val
                    ),
                  }),
            }
          : prop
      ),
    });
  };

  const decrementPropertyValues = ({
    id,
    index,
  }: {
    id: string;
    index: number;
  }) => {
    if (!selectedElement?.id) return;

    onElementUpdate(selectedElement.id, {
      animations: selectedElement.animations.map((prop) =>
        prop.id === id
          ? {
              ...prop,
              values: [
                ...prop.values.slice(0, index),
                ...prop.values.slice(index + 1),
              ],
            }
          : prop
      ),
    });
  };
  const incrementPropertyValues = ({
    id,
    index,
  }: {
    id: string;
    index: number;
  }) => {
    if (!selectedElement?.id) return;
    onElementUpdate(selectedElement.id, {
      animations: selectedElement.animations.map((prop) =>
        prop.id === id
          ? {
              ...prop,
              values: [
                ...prop.values.slice(0, index >= 0 ? index + 1 : index),
                "",
                ...prop.values.slice(index >= 0 ? index + 1 : index),
              ],
            }
          : prop
      ),
    });
  };

  return (
    <div id={ANIMATIONS_PANEL_ID} className="flex flex-col overflow-y-auto">
      <div className="px-6 min-h-16 flex items-center justify-between sticky top-0 z-1 bg-zinc-800 border-b border-gray-200 dark:border-zinc-700/50">
        <FieldTitle Icon={Settings}>Animations</FieldTitle>
        {selectedElement ? (
          <button
            onClick={addAnimationProperty}
            className="w-6 aspect-square rounded-md flex items-center justify-center hover:bg-gray-200 dark:hover:bg-zinc-700/50 text-zinc-600 dark:text-zinc-300 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        ) : null}
      </div>
      {selectedElement ? (
        <div className="w-full px-2 py-4 flex flex-col gap-4">
          {selectedElement.animations.map((animationProperty, index) => (
            <AnimationControlPanel
              key={animationProperty.id}
              id={animationProperty.id}
              title={`Animation ${selectedElement.animations.length - index}`}
              selectedProperty={animationProperty}
              selectProperty={handlePropertySelection}
              selectPropertyValue={handlePropertyValueSelection}
              removeProperty={removeAnimationProperty(animationProperty.id)}
              decrementPropertyValues={decrementPropertyValues}
              incrementPropertyValues={incrementPropertyValues}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function AnimationControlPanel({
  id,
  title,
  selectedProperty,
  selectProperty,
  selectPropertyValue,
  incrementPropertyValues,
  decrementPropertyValues,
  removeProperty,
}: AnimationControlPanelProps) {
  const handleAnimationPropertyChange: React.ChangeEventHandler<
    HTMLSelectElement
  > = (event) => {
    selectProperty({ id, value: event.currentTarget.value });
  };

  return (
    <div id={id} className="w-full rounded-lg bg-zinc-900/50 flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-zinc-700/50 flex items-center justify-between gap-4">
        <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {title}
        </h3>
        <button
          onClick={removeProperty}
          className="w-4 aspect-square flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
        >
          <X className="-ml-px -mt-px" size={16} />
        </button>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <SelectInputAndLabel
          id="animation-property-select"
          labelText="Property"
          gap={4}
          value={selectedProperty.value}
          options={ANIMATION_PROPERTIES}
          onChange={handleAnimationPropertyChange}
        />
        {selectedProperty?.value ? (
          <div className="w-full flex flex-col gap-2">
            {selectedProperty.values.map((value, index, arr) => (
              <div key={index} className="flex gap-2 items-end">
                {selectedProperty.type === "color" ? (
                  <ColorInputAndLabel
                    id={`${Date.now()}`}
                    gap={4}
                    labelText={
                      index === 0
                        ? "Initial"
                        : arr.length > 2 && index !== arr.length - 1
                        ? `Value ${index + 1}`
                        : "Final"
                    }
                    value={value}
                    onChange={(event) =>
                      selectPropertyValue({
                        id,
                        index,
                        value: event.target.value,
                      })
                    }
                  />
                ) : (
                  <InputAndLabel
                    id={`${Date.now()}`}
                    gap={4}
                    inputType="text"
                    labelText={
                      index === 0
                        ? "Initial"
                        : arr.length > 2 && index !== arr.length - 1
                        ? `Value ${index + 1}`
                        : "Final"
                    }
                    value={value}
                    onChange={(event) =>
                      selectPropertyValue({
                        id,
                        index,
                        value: event.target.value,
                      })
                    }
                  />
                )}
                <div className="h-10 flex gap-1 items-center">
                  {arr.length > 2 ? (
                    <button
                      onClick={() => decrementPropertyValues({ id, index })}
                      className="flex items-center justify-center w-8 aspect-square rounded-md text-zinc-800 dark:text-zinc-300 bg-gray-200/50 dark:bg-zinc-700/50 hover:bg-gray-200 dark:hover:bg-zinc-700/50 cursor-pointer"
                    >
                      <Minus size={12} />
                    </button>
                  ) : null}
                  <button
                    onClick={() => incrementPropertyValues({ id, index })}
                    className="flex items-center justify-center w-8 aspect-square rounded-md text-zinc-800 dark:text-zinc-300 bg-gray-200/50 dark:bg-zinc-700/50 hover:bg-gray-200 dark:hover:bg-zinc-700/50 cursor-pointer"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {selectedProperty.value ? (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <InputAndLabel
                id={`${Date.now()}`}
                gap={4}
                labelText="Duration (s)"
                inputType="number"
                value={selectedProperty.duration}
                onChange={(event) =>
                  selectPropertyValue({
                    id,
                    index: -1,
                    value: event.target.value,
                    fieldname: "duration",
                  })
                }
              />
              <InputAndLabel
                id={`${Date.now()}`}
                gap={4}
                labelText="Delay (s)"
                inputType="number"
                value={selectedProperty.delay}
                onChange={(event) =>
                  selectPropertyValue({
                    id,
                    index: -1,
                    value: event.target.value,
                    fieldname: "delay",
                  })
                }
              />
            </div>
            <InputAndLabel
              id={`${Date.now()}`}
              gap={4}
              labelText="Ease"
              inputType="text"
              value={selectedProperty.ease}
              onChange={(event) =>
                selectPropertyValue({
                  id,
                  index: -1,
                  value: event.target.value,
                  fieldname: "ease",
                })
              }
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
