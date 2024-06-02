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
  groupShapes,
  setGroupShapes,
}) => {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState(null);
  const [selectionRect, setSelectionRect] = useState(null);
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

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
        } else if (shape.type === "circle") {
          context.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
          context.fillStyle = shape.fill;
          context.fill();
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
        }
        context.closePath();
      });

      if (selectionRect) {
        context.beginPath();
        context.rect(
          selectionRect.x,
          selectionRect.y,
          selectionRect.width,
          selectionRect.height
        );
        context.fillStyle = "rgba(0, 0, 255, 0.3)";
        context.fill();
        context.closePath();
      }
    };

    drawShapes();
  }, [shapes, selectionRect, canvasDimensions]);

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
      };
      setCurrentShape(newShape);
      setShapes([...shapes, newShape]);
    } else {
      setSelectionRect({ x: x, y: y, width: 0, height: 0 });
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
    } else if (selectionRect) {
      setSelectionRect({
        ...selectionRect,
        width: x - selectionRect.x,
        height: y - selectionRect.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDrawing(false);
    setTool(null);
    if (selectionRect) {
      const updatedShapes = shapes.map((shape) => {
        if (
          shape.x > selectionRect.x &&
          shape.y > selectionRect.y &&
          shape.x < selectionRect.x + selectionRect.width &&
          shape.y < selectionRect.y + selectionRect.height
        ) {
          return { ...shape, selected: true };
        }
        return shape;
      });
      setShapes(updatedShapes);
      setSelectionRect(null);
    }
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

  useEffect(() => {
    const handleResize = () => {
      setCanvasDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
