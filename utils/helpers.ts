import { Easing } from "framer-motion";

export const downloadCanvasAsImage = (
  canvas: HTMLCanvasElement,
  filename: string = "design.png"
) => {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL();
  link.click();
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export const hexToRgb = (
  hex: string
): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

export function getTimingFunction(easeStr: string): Easing[] {
  const ease = !/[0-9]/.test(easeStr)
    ? [easeStr.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())]
    : easeStr
        .replace(/(cubic|bezier|-|\(|\))/gi, "")
        .split(",")
        .map((val) =>
          !isNaN(Number(val.trim())) ? Number(val.trim()) : val.trim()
        );
  return ((ease.some((tf) => typeof tf === "string") && ease.length === 1) ||
  ease.length === 4
    ? ease
    : ["linear"]) as unknown as Easing[];
}
