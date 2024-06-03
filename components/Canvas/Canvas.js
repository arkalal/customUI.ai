"use client";

import React, { useRef, useEffect, useState } from "react";
import styles from "./Canvas.module.scss";

const Canvas = ({
  shapes,
  setShapes,
  tool,
  setTool,
  selectedShape,
  setSelectedShape,
  isDraggingCanvas,
  setIsDraggingCanvas,
}) => {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState(null);
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandleIndex, setResizeHandleIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCanvasDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      const handleResize = () => {
        setCanvasDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const drawSelectionOutline = (context, shape) => {
    context.lineWidth = 2;
    context.strokeStyle = "blue";
    context.setLineDash([5, 5]);

    if (shape.type === "rectangle") {
      context.strokeRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.type === "circle") {
      context.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
      context.stroke();
    }

    context.setLineDash([]);
    context.fillStyle = "white";
    context.strokeStyle = "black";
    context.lineWidth = 1;

    const handleSize = 8;
    const halfHandleSize = handleSize / 2;
    let handles = [];

    if (shape.type === "rectangle") {
      handles = [
        { x: shape.x - halfHandleSize, y: shape.y - halfHandleSize },
        {
          x: shape.x + shape.width - halfHandleSize,
          y: shape.y - halfHandleSize,
        },
        {
          x: shape.x - halfHandleSize,
          y: shape.y + shape.height - halfHandleSize,
        },
        {
          x: shape.x + shape.width - halfHandleSize,
          y: shape.y + shape.height - halfHandleSize,
        },
      ];
    } else if (shape.type === "circle") {
      handles = [
        {
          x: shape.x + shape.radius - halfHandleSize,
          y: shape.y - halfHandleSize,
        },
        {
          x: shape.x - shape.radius - halfHandleSize,
          y: shape.y - halfHandleSize,
        },
        {
          x: shape.x - halfHandleSize,
          y: shape.y + shape.radius - halfHandleSize,
        },
        {
          x: shape.x - halfHandleSize,
          y: shape.y - shape.radius - halfHandleSize,
        },
      ];
    }

    handles.forEach((handle, index) => {
      context.fillRect(handle.x, handle.y, handleSize, handleSize);
      context.strokeRect(handle.x, handle.y, handleSize, handleSize);
      handle.index = index;
    });

    return handles;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = canvasDimensions.width;
    canvas.height = canvasDimensions.height;

    const drawShapes = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      shapes.forEach((shape) => {
        context.beginPath();
        if (shape.type === "rectangle") {
          context.rect(shape.x, shape.y, shape.width, shape.height);
          context.fillStyle = shape.fill;
          context.fill();
          if (shape.selected) {
            drawSelectionOutline(context, shape);
          }
        } else if (shape.type === "circle") {
          context.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
          context.fillStyle = shape.fill;
          context.fill();
          if (shape.selected) {
            drawSelectionOutline(context, shape);
          }
        } else if (shape.type === "line") {
          context.moveTo(shape.points[0], shape.points[1]);
          context.lineTo(shape.points[2], shape.points[3]);
          context.strokeStyle = shape.stroke;
          context.lineWidth = shape.strokeWidth;
          context.stroke();
        } else if (shape.type === "text") {
          context.font = `${shape.fontSize}px Arial`;
          context.fillStyle = shape.fill;
          context.fillText(shape.text, shape.x, shape.y);
          if (shape.selected) {
            drawSelectionOutline(context, shape);
          }
        }
        context.closePath();
      });
    };

    drawShapes();
  }, [shapes, canvasDimensions]);

  const getShapeAtCoordinates = (x, y) => {
    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i];
      if (shape.type === "rectangle") {
        if (
          x >= shape.x &&
          x <= shape.x + shape.width &&
          y >= shape.y &&
          y <= shape.y + shape.height
        ) {
          return shape;
        }
      } else if (shape.type === "circle") {
        const dx = x - shape.x;
        const dy = y - shape.y;
        if (Math.sqrt(dx * dx + dy * dy) <= shape.radius) {
          return shape;
        }
      } else if (shape.type === "line") {
        // Approximate hit detection for line
        const [x1, y1, x2, y2] = shape.points;
        const distance =
          Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) /
          Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
        if (distance <= shape.strokeWidth) {
          return shape;
        }
      } else if (shape.type === "text") {
        const textWidth = context.measureText(shape.text).width;
        const textHeight = shape.fontSize; // Approximate height
        if (
          x >= shape.x &&
          x <= shape.x + textWidth &&
          y >= shape.y - textHeight &&
          y <= shape.y
        ) {
          return shape;
        }
      }
    }
    return null;
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool) {
      setDrawing(true);
      const newShape = {
        id: `shape${shapes.length + 1}`,
        type: tool,
        x: x,
        y: y,
        ...(tool === "rectangle" ? { width: 0, height: 0, fill: "red" } : {}),
        ...(tool === "circle" ? { radius: 0, fill: "blue" } : {}),
        ...(tool === "line"
          ? { points: [x, y, x, y], stroke: "black", strokeWidth: 5 }
          : {}),
        ...(tool === "text"
          ? { text: "Sample Text", fontSize: 24, fill: "black" }
          : {}),
        selected: true,
      };
      setCurrentShape(newShape);
      setShapes([
        ...shapes.map((shape) => ({ ...shape, selected: false })),
        newShape,
      ]);
      setSelectedShape(newShape);
    } else if (isDraggingCanvas) {
      setDragStart({ x, y });
      setIsDragging(true);
    } else {
      const clickedShape = getShapeAtCoordinates(x, y);
      if (clickedShape) {
        setSelectedShape(clickedShape);
        setShapes((prevShapes) =>
          prevShapes.map((shape) =>
            shape.id === clickedShape.id
              ? { ...shape, selected: true }
              : { ...shape, selected: false }
          )
        );
        setDragStart({ x, y });
        setIsDragging(true);
      } else {
        setSelectedShape(null);
        setShapes((prevShapes) =>
          prevShapes.map((shape) => ({ ...shape, selected: false }))
        );
      }
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (drawing && tool) {
      const updatedShape = { ...currentShape };
      if (tool === "rectangle") {
        updatedShape.width = x - currentShape.x;
        updatedShape.height = y - currentShape.y;
      } else if (tool === "circle") {
        updatedShape.radius = Math.sqrt(
          Math.pow(x - currentShape.x, 2) + Math.pow(y - currentShape.y, 2)
        );
      } else if (tool === "line") {
        updatedShape.points = [
          currentShape.points[0],
          currentShape.points[1],
          x,
          y,
        ];
      }
      setCurrentShape(updatedShape);
      setShapes([...shapes.slice(0, -1), updatedShape]);
    } else if (isDragging && isDraggingCanvas) {
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;
      setShapes(
        shapes.map((shape) => ({
          ...shape,
          x: shape.x + dx,
          y: shape.y + dy,
        }))
      );
      setDragStart({ x, y });
    } else if (isDragging && selectedShape) {
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;
      setShapes(
        shapes.map((shape) =>
          shape.selected
            ? {
                ...shape,
                x: shape.x + dx,
                y: shape.y + dy,
              }
            : shape
        )
      );
      setDragStart({ x, y });
    } else if (isResizing && selectedShape) {
      const updatedShape = { ...selectedShape };
      if (updatedShape.type === "rectangle") {
        switch (resizeHandleIndex) {
          case 0:
            updatedShape.width += updatedShape.x - x;
            updatedShape.height += updatedShape.y - y;
            updatedShape.x = x;
            updatedShape.y = y;
            break;
          case 1:
            updatedShape.width = x - updatedShape.x;
            updatedShape.height += updatedShape.y - y;
            updatedShape.y = y;
            break;
          case 2:
            updatedShape.width += updatedShape.x - x;
            updatedShape.x = x;
            updatedShape.height = y - updatedShape.y;
            break;
          case 3:
            updatedShape.width = x - updatedShape.x;
            updatedShape.height = y - updatedShape.y;
            break;
          default:
            break;
        }
      } else if (updatedShape.type === "circle") {
        const newRadius = Math.sqrt(
          Math.pow(x - updatedShape.x, 2) + Math.pow(y - updatedShape.y, 2)
        );
        updatedShape.radius = newRadius;
      }
      setShapes(
        shapes.map((shape) =>
          shape.id === selectedShape.id ? updatedShape : shape
        )
      );
    }
  };

  const handleMouseUp = (e) => {
    setDrawing(false);
    setTool(null);
    setIsDragging(false);
    setIsResizing(false);
    setIsDraggingCanvas(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Delete" && selectedShape) {
      setShapes(shapes.filter((shape) => shape.id !== selectedShape.id));
      setSelectedShape(null);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedShape]);

  return (
    <div className={styles.canvasContainer}>
      <canvas
        ref={canvasRef}
        width={canvasDimensions.width}
        height={canvasDimensions.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
};

export default Canvas;
