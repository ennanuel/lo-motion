import React, { useState, useRef, useCallback } from "react";
import { X, Upload, Wand2, Download } from "lucide-react";
import { DesignElement } from "../types/design";
import { v4 as generateId } from "uuid";

interface ImageProcessorProps {
  onClose: () => void;
  onElementsExtracted: (elements: DesignElement[]) => void;
}

export default function ImageProcessor({
  onClose,
  onElementsExtracted,
}: ImageProcessorProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedElements, setExtractedElements] = useState<DesignElement[]>(
    []
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setUploadedImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const processImage = useCallback(async () => {
    if (!uploadedImage || !canvasRef.current) return;

    setIsProcessing(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the image
        ctx.drawImage(img, 0, 0);

        // Get image data for processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Simulate element extraction (in a real app, you'd use AI/ML here)
        const elements = simulateElementExtraction(
          uploadedImage,
          img.width,
          img.height
        );
        setExtractedElements(elements);
      };
      img.src = uploadedImage;
    } catch (error) {
      console.error("Image processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedImage]);

  const simulateElementExtraction = (
    imageSrc: string,
    width: number,
    height: number
  ): DesignElement[] => {
    // This is a simulation - in a real app, you'd use computer vision/AI
    const elements: DesignElement[] = [];

    // Create background element
    elements.push({
      id: generateId(),
      type: "image",
      x: 0,
      y: 0,
      width: Math.min(400, width * 0.5),
      height: Math.min(300, height * 0.5),
      content: imageSrc,
      style: {
        fill: "transparent",
        stroke: "#e2e8f0",
        strokeWidth: 1,
      },
      animations: [],
    });

    // Simulate detected text elements
    elements.push({
      id: generateId(),
      type: "text",
      x: 50,
      y: 50,
      width: 200,
      height: 40,
      content: "Extracted Text",
      style: {
        fill: "#1f2937",
        fontSize: 18,
        fontFamily: "Inter, sans-serif",
      },
      animations: [],
    });

    // Simulate detected shapes
    elements.push({
      id: generateId(),
      type: "rectangle",
      x: 300,
      y: 100,
      width: 80,
      height: 60,
      style: {
        fill: "#3b82f6",
        stroke: "#ffffff",
        strokeWidth: 2,
      },
      animations: [],
    });

    return elements;
  };

  const handleAddToCanvas = () => {
    onElementsExtracted(extractedElements);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-100 dark:bg-zinc-800 rounded-xl overflow-hidden shadow-2xl w-full h-full max-h-[600px] max-w-[1120px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-20 border-b border-gray-200 dark:border-zinc-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-linear-to-br from-green-200/20 to-teal-400/50 rounded-lg flex items-center justify-center">
              <Wand2 className="w-4 h-4 text-teal-600 dark:text-teal-100" />
            </div>
            <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
              AI Image Processor
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-red-200 dark:bg-zinc-700 hover:bg-red-600 dark:hover:bg-zinc-600 flex items-center justify-center text-red-600 dark:text-zinc-300 hover:text-red-100 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Upload Area */}
          <div className="flex-1 flex">
            {!uploadedImage ? (
              <div className="flex-1 p-6">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full border-3 border-dashed border-gray-200 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-700/50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-transparent transition-colors"
                >
                  <Upload className="w-16 h-16 text-zinc-600 dark:text-zinc-400 mb-4" />
                  <h3 className="text-lg font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                    Upload an Image
                  </h3>
                  <p className="text-zinc-400 dark:text-zinc-500 text-center max-w-sm">
                    Upload an image to automatically extract design elements
                    like text, shapes, and objects
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            ) : (
              <div className="w-full flex-1 flex flex-col">
                <div className="px-6 h-18 flex items-center justify-between border-b border-gray-200 dark:border-zinc-700/50">
                  <h3 className="text-base font-medium text-zinc-800 dark:text-zinc-200">
                    Processing Results
                  </h3>
                  <div className="flex space-x-3">
                    <button
                      onClick={processImage}
                      disabled={isProcessing}
                      className="px-4 h-10 bg-purple-200/40 dark:bg-zinc-100 hover:bg-purple-200 dark:hover:bg-zinc-200 disabled:opacity-60 text-purple-700 dark:text-zinc-800 rounded-full flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <Wand2 className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        {isProcessing ? "Processing..." : "Extract Elements"}
                      </span>
                    </button>
                    {extractedElements.length > 0 && (
                      <button
                        onClick={handleAddToCanvas}
                        className="px-4 h-10 bg-green-200/20 dark:bg-green-600 hover:bg-green-200/50 dark:hover:bg-green-700 disabled:opacity-60 text-green-600 dark:text-green-50 rounded-full flex items-center space-x-2 transition-colors cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-sm font-semibold">
                          Add to Canvas
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto flex space-x-6">
                  {/* Original Image */}
                  <div className="p-6 flex-1 flex flex-col gap-6">
                    <h4 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      Original Image
                    </h4>
                    <div className="w-full bg-gray-200 dark:bg-zinc-900 rounded-lg p-4 flex items-center justify-center">
                      <img
                        src={uploadedImage}
                        alt="Uploaded"
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Extracted Elements */}
                  {extractedElements.length > 0 && (
                    <div className="p-6 flex-1 flex flex-col gap-6 bg-gray-200 dark:bg-zinc-900 border-l border-gray-200 dark:border-zinc-700/50">
                      <h4 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        Extracted Elements ({extractedElements.length})
                      </h4>
                      <div className="h-full">
                        <div className="space-y-3">
                          {extractedElements.map((element, index) => (
                            <div
                              key={element.id}
                              className="p-3 rounded-lg bg-gray-200 dark:bg-zinc-700/50"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 capitalize">
                                  {element.type}
                                </span>
                                <span className="text-xs text-zinc-600 dark:text-zinc-500">
                                  #{index + 1}
                                </span>
                              </div>
                              {element.content && (
                                <div className="relative h-4 w-full">
                                  <p className="absolute top-0 left-0 w-full text-xs text-zinc-700 dark:text-zinc-400 truncate">
                                    {element.content}
                                  </p>
                                </div>
                              )}
                              <div className="text-xs text-zinc-600 dark:text-zinc-500 mt-1">
                                {Math.round(element.width)} ×{" "}
                                {Math.round(element.height)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hidden canvas for image processing */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Instructions Panel */}
          <div className="w-80 h-full overflow-y-auto bg-gray-200 dark:bg-zinc-900 border-l border-gray-200 dark:border-zinc-700/50 p-6">
            <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-100 mb-4">
              How it works
            </h3>
            <ul className="space-y-4 text-sm text-slate-400">
              {[
                {
                  title: "Upload Image",
                  description:
                    "Choose any image file (PNG, JPG, etc.) to start processing.",
                },
                {
                  title: "Extract Elements",
                  description:
                    "Our AI analyzes the image to identify text, shapes, and objects.",
                },
                {
                  title: "Add to Canvas",
                  description:
                    "Import the extracted elements directly to your design canvas.",
                },
              ].map(({ title, description }, index) => (
                <li key={title} className="flex flex-col gap-1">
                  <h4 className="text-zinc-700 dark:text-zinc-300 font-medium">
                    <span className="inline-block min-w-4">{index + 1}.</span>
                    <span>{title}</span>
                  </h4>
                  <p className="pl-4 text-xs text-zinc-600 dark:text-zinc-400">
                    {description}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-8 p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg">
              <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-300 mb-3">
                Supported Features
              </h4>
              <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                {[
                  "Text recognition and extraction",
                  "Shape detection and isolation",
                  "Background removal",
                  "Color palette extraction",
                ].map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
