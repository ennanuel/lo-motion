import React from "react";
import { DesignElement } from "../types/design";
import { v4 as generateId } from "uuid";

interface TemplateGalleryProps {
  onTemplateSelect: (elements: Partial<DesignElement>[]) => void;
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  onTemplateSelect,
}) => {
  const templates = [
    {
      id: "social-post",
      name: "Social Media Post",
      preview:
        "https://images.pexels.com/photos/1933900/pexels-photo-1933900.jpeg?auto=compress&cs=tinysrgb&w=400",
      elements: [
        {
          id: generateId(),
          type: "rectangle" as const,
          x: 0,
          y: 0,
          width: 400,
          height: 400,
          style: {
            fill: "#1f2937",
            stroke: "transparent",
            strokeWidth: 0,
          },
          animations: [],
        },
        {
          id: generateId(),
          type: "text" as const,
          x: 50,
          y: 50,
          width: 300,
          height: 60,
          content: "Your Brand",
          style: {
            fill: "#ffffff",
            fontSize: 32,
            fontFamily: "Inter, sans-serif",
          },
          animations: [],
        },
        {
          id: generateId(),
          type: "text" as const,
          x: 50,
          y: 120,
          width: 300,
          height: 200,
          content: "Create amazing designs with our powerful design studio",
          style: {
            fill: "#e2e8f0",
            fontSize: 18,
            fontFamily: "Inter, sans-serif",
          },
          animations: [],
        },
      ],
    },
    {
      id: "presentation",
      name: "Presentation Slide",
      preview:
        "https://images.pexels.com/photos/3184454/pexels-photo-3184454.jpeg?auto=compress&cs=tinysrgb&w=400",
      elements: [
        {
          id: generateId(),
          type: "rectangle" as const,
          x: 0,
          y: 0,
          width: 800,
          height: 600,
          style: {
            fill: "#ffffff",
            stroke: "#e2e8f0",
            strokeWidth: 1,
          },
          animations: [],
        },
        {
          id: generateId(),
          type: "text" as const,
          x: 100,
          y: 100,
          width: 600,
          height: 80,
          content: "Presentation Title",
          style: {
            fill: "#1f2937",
            fontSize: 48,
            fontFamily: "Inter, sans-serif",
          },
          animations: [],
        },
        {
          id: generateId(),
          type: "circle" as const,
          x: 350,
          y: 250,
          width: 100,
          height: 100,
          style: {
            fill: "#3b82f6",
            stroke: "#ffffff",
            strokeWidth: 3,
          },
          animations: [],
        },
      ],
    },
  ];

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-white mb-6">
        Design Templates
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => onTemplateSelect(template.elements)}
            className="bg-slate-700 rounded-lg p-4 cursor-pointer hover:bg-slate-600 transition-colors group"
          >
            <div className="aspect-video bg-slate-800 rounded-md mb-3 overflow-hidden">
              <img
                src={template.preview}
                alt={template.name}
                className="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity"
              />
            </div>
            <h4 className="text-sm font-medium text-white">{template.name}</h4>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateGallery;
