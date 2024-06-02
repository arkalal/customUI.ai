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
      <h3>Edit Shape</h3>
      {selectedShape.type === "text" && (
        <>
          <label>
            Text:
            <input
              type="text"
              name="text"
              value={selectedShape.text}
              onChange={handleChange}
            />
          </label>
          <label>
            Font Size:
            <input
              type="number"
              name="fontSize"
              value={selectedShape.fontSize}
              onChange={handleChange}
            />
          </label>
        </>
      )}
      {selectedShape.type !== "text" && (
        <>
          <label>
            Fill Color:
            <input
              type="color"
              name="fill"
              value={selectedShape.fill}
              onChange={handleChange}
            />
          </label>
          {selectedShape.type === "line" && (
            <label>
              Stroke Color:
              <input
                type="color"
                name="stroke"
                value={selectedShape.stroke}
                onChange={handleChange}
              />
            </label>
          )}
        </>
      )}
    </div>
  );
};

export default ShapeEditor;
