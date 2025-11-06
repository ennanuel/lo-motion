export type AnimationPropertyDimensions = "raw" | "dimension" | "color";
export type Tool = "select" | "text" | "rectangle" | "circle" | "image";

export interface AnimationProperty {
  title: string;
  value: string;
  type: AnimationPropertyDimensions;
}

export interface DesignElement {
  id: string;
  type: Tool;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  isEditing?: boolean;
  style?: React.CSSProperties;
  isPlayingAnimation: boolean;
  animations: SelectedAnimationProperty[];
  startAnimation: () => void;
  stopAnimation: () => void;
}

export interface CanvasState {
  elements: DesignElement[];
  selectedElement: string | null;
  zoom: number;
  panX: number;
  panY: number;
}

export interface SelectedAnimationProperty extends AnimationProperty {
  id: string;
  values: string[];
  duration: number;
  delay: number;
  ease: string;
}
