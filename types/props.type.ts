import { LegacyAnimationControls } from "framer-motion";
import { DesignElement, SelectedAnimationProperty } from "./design";

export interface AnimationControlPanelProps {
  id: string;
  title: string;
  selectedProperty: SelectedAnimationProperty;
  selectProperty: ({ id, value }: { id: string; value: string }) => void;
  selectPropertyValue: ({
    id,
    index,
    value,
  }: {
    id: string;
    index: number;
    value: string;
    fieldname?: string;
  }) => void;
  decrementPropertyValues: ({
    id,
    index,
  }: {
    id: string;
    index: number;
  }) => void;
  incrementPropertyValues: ({
    id,
    index,
  }: {
    id: string;
    index: number;
  }) => void;
  removeProperty: () => void;
}

export interface CanvasElementProps {
  element: DesignElement;
  isSelected: boolean;
  onUpdate: (updates: Partial<DesignElement>) => void;
  onDelete: () => void;
  onMouseDown: React.MouseEventHandler<HTMLElement>;
  onFocus: React.FocusEventHandler<HTMLElement>;
  onBlur: React.FocusEventHandler<HTMLElement>;
}

export interface InputProps {
  labelText: string;
  id: string;
  value?: string | number;
  gap?: number;
  inputType?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
  options?: { title: string; value: string }[];
}

export interface PropertiesPanelProps {
  selectedElement: DesignElement | null;
  rearrangeElements: (initial: number, final: number) => void;
  onElementRemove: (id: string) => void;
  onElementSelect: (id: string) => void;
  onElementUpdate: (id: string, updates: Partial<DesignElement>) => void;
  elements: DesignElement[];
}

export interface RenderElementProps {
  element: DesignElement;
  controls: LegacyAnimationControls;
  onUpdate: (val: Partial<DesignElement>) => void;
}
