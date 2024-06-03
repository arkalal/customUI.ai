"use client";

import React from "react";
import styles from "./ToolPanel.module.scss";
import {
  FaSquare,
  FaCircle,
  FaSlash,
  FaTextWidth,
  FaSave,
  FaCode,
  FaTrash,
  FaThumbsUp,
} from "react-icons/fa";

const ToolPanel = ({
  onAddRectangle,
  onAddCircle,
  onAddLine,
  onAddText,
  onSaveDesign,
  onGenerateCode,
  onClearCanvas,
  onDragCanvas,
}) => {
  return (
    <div className={styles.toolPanel}>
      <button onClick={onAddRectangle}>
        <FaSquare />
      </button>
      <button onClick={onAddCircle}>
        <FaCircle />
      </button>
      <button onClick={onAddLine}>
        <FaSlash />
      </button>
      <button onClick={onAddText}>
        <FaTextWidth />
      </button>
      <button onClick={onSaveDesign}>
        <FaSave />
      </button>
      <button onClick={onGenerateCode}>
        <FaCode />
      </button>
      <button onClick={onClearCanvas}>
        <FaTrash />
      </button>
      <button onClick={onDragCanvas}>
        <FaThumbsUp />
      </button>
    </div>
  );
};

export default ToolPanel;
