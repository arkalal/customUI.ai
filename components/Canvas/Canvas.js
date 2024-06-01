"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Line,
  Text,
  Transformer,
} from "react-konva";
import styles from "./Canvas.module.scss";

const Canvas = ({
  shapes,
  setShapes,
  tool,
  setTool,
  selectedShape,
  setSelectedShape,
}) => {
  const [drawing, setDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState(null);
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 0,
    height: 0,
  });
  const stageRef = useRef();
  const layerRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCanvasDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      window.addEventListener("resize", updateCanvasDimensions);
      return () => window.removeEventListener("resize", updateCanvasDimensions);
    }
  }, []);

  const updateCanvasDimensions = () => {
    setCanvasDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useEffect(() => {
    if (selectedShape) {
      const node = layerRef.current.findOne(`#${selectedShape.id}`);
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer().batchDraw();
      }
    } else {
      trRef.current.nodes([]);
      trRef.current.getLayer().batchDraw();
    }
  }, [selectedShape]);

  const handleMouseDown = (e) => {
    if (tool) {
      const stage = stageRef.current.getStage();
      const point = stage.getPointerPosition();
      setDrawing(true);

      const newShape = {
        id: `shape${shapes.length + 1}`,
        type: tool,
        x: point.x,
        y: point.y,
        ...(tool === "rectangle" ? { width: 0, height: 0, fill: "red" } : {}),
        ...(tool === "circle" ? { radius: 0, fill: "blue" } : {}),
        ...(tool === "line"
          ? {
              points: [point.x, point.y, point.x, point.y],
              stroke: "black",
              strokeWidth: 5,
            }
          : {}),
        ...(tool === "text"
          ? { text: "Sample Text", fontSize: 24, fill: "black" }
          : {}),
      };
      setCurrentShape(newShape);
      setShapes([...shapes, newShape]);
    } else {
      const clickedOnEmpty = e.target === stageRef.current;
      if (clickedOnEmpty) {
        setSelectedShape(null);
      } else {
        const node = e.target;
        const shape = shapes.find((shape) => shape.id === node.id());
        setSelectedShape(shape);
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!drawing) return;

    const stage = stageRef.current.getStage();
    const point = stage.getPointerPosition();
    const shapesCopy = [...shapes];

    if (tool === "rectangle") {
      shapesCopy[shapesCopy.length - 1] = {
        ...currentShape,
        width: point.x - currentShape.x,
        height: point.y - currentShape.y,
      };
    } else if (tool === "circle") {
      shapesCopy[shapesCopy.length - 1] = {
        ...currentShape,
        radius: Math.sqrt(
          Math.pow(point.x - currentShape.x, 2) +
            Math.pow(point.y - currentShape.y, 2)
        ),
      };
    } else if (tool === "line") {
      shapesCopy[shapesCopy.length - 1] = {
        ...currentShape,
        points: [currentShape.x, currentShape.y, point.x, point.y],
      };
    }
    setShapes(shapesCopy);
  };

  const handleMouseUp = () => {
    setDrawing(false);
    setTool(null);
  };

  const handleDragEnd = (e, id) => {
    const shapesCopy = shapes.map((shape) => {
      if (shape.id === id) {
        return { ...shape, x: e.target.x(), y: e.target.y() };
      }
      return shape;
    });
    setShapes(shapesCopy);
  };

  const handleTransformEnd = (e, id) => {
    const node = e.target;
    const shapesCopy = shapes.map((shape) => {
      if (shape.id === id) {
        return {
          ...shape,
          x: node.x(),
          y: node.y(),
          width: node.width() * node.scaleX(),
          height: node.height() * node.scaleY(),
          scaleX: 1,
          scaleY: 1,
        };
      }
      return shape;
    });
    setShapes(shapesCopy);
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
      <Stage
        width={canvasDimensions.width}
        height={canvasDimensions.height}
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer ref={layerRef}>
          {shapes.map((shape, i) => {
            if (shape.type === "rectangle") {
              return (
                <Rect
                  key={shape.id}
                  id={shape.id}
                  {...shape}
                  draggable
                  onDragEnd={(e) => handleDragEnd(e, shape.id)}
                  onTransformEnd={(e) => handleTransformEnd(e, shape.id)}
                  onClick={() => setSelectedShape(shape)}
                />
              );
            } else if (shape.type === "circle") {
              return (
                <Circle
                  key={shape.id}
                  id={shape.id}
                  {...shape}
                  draggable
                  onDragEnd={(e) => handleDragEnd(e, shape.id)}
                  onTransformEnd={(e) => handleTransformEnd(e, shape.id)}
                  onClick={() => setSelectedShape(shape)}
                />
              );
            } else if (shape.type === "line") {
              return (
                <Line
                  key={shape.id}
                  id={shape.id}
                  {...shape}
                  draggable
                  onDragEnd={(e) => handleDragEnd(e, shape.id)}
                  onTransformEnd={(e) => handleTransformEnd(e, shape.id)}
                  onClick={() => setSelectedShape(shape)}
                />
              );
            } else if (shape.type === "text") {
              return (
                <Text
                  key={shape.id}
                  id={shape.id}
                  {...shape}
                  draggable
                  onDragEnd={(e) => handleDragEnd(e, shape.id)}
                  onTransformEnd={(e) => handleTransformEnd(e, shape.id)}
                  onClick={() => setSelectedShape(shape)}
                />
              );
            }
            return null;
          })}
          <Transformer ref={trRef} />
        </Layer>
      </Stage>
    </div>
  );
};

export default Canvas;
