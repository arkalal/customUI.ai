"use client";

import React from "react";
import styles from "./ShapeEditor.module.scss";

const ShapeEditor = ({ selectedShape, setShapes }) => {
  if (!selectedShape) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShapes((prevShapes) =>
      prevShapes.map((shape) =>
        shape.id === selectedShape.id ? { ...shape, [name]: value } : shape
      )
    );
  };

  return (
    <div className={styles.shapeEditor}>
      <label>
        Color:
        <input
          type="color"
          name="fill"
          value={selectedShape.fill || "#000000"}
          onChange={handleChange}
        />
      </label>
      <label>
        Border Color:
        <input
          type="color"
          name="stroke"
          value={selectedShape.stroke || "#000000"}
          onChange={handleChange}
        />
      </label>
      <label>
        Border Width:
        <input
          type="number"
          name="strokeWidth"
          value={selectedShape.strokeWidth || 0}
          onChange={handleChange}
        />
      </label>
      <label>
        Z-Index:
        <input
          type="number"
          name="zIndex"
          value={selectedShape.zIndex || 0}
          onChange={handleChange}
        />
      </label>
    </div>
  );
};

export default ShapeEditor;
