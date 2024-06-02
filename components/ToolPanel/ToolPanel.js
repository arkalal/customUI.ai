"use client";

import React from "react";
import styles from "./ToolPanel.module.scss";

const ToolPanel = ({
  onAddRectangle,
  onAddCircle,
  onAddLine,
  onAddText,
  onSaveDesign,
  onGenerateCode,
  onClearCanvas,
  onGroupComponents,
}) => {
  return (
    <div className={styles.toolPanel}>
      <button onClick={onAddRectangle}>Add Rectangle</button>
      <button onClick={onAddCircle}>Add Circle</button>
      <button onClick={onAddLine}>Add Line</button>
      <button onClick={onAddText}>Add Text</button>
      <button onClick={onGroupComponents}>Group Components</button>
      <button onClick={onSaveDesign}>Save Design</button>
      <button onClick={onGenerateCode}>Generate Code</button>
      <button onClick={onClearCanvas}>Clear Canvas</button>
    </div>
  );
};

export default ToolPanel;
