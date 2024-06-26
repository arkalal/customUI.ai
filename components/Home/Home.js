"use client";

import React, { useState } from "react";
import styles from "./Home.module.scss";
import axios from "../../axios/api";
import Canvas from "../Canvas/Canvas";
import ToolPanel from "../ToolPanel/ToolPanel";
import ShapeEditor from "../ShapeEditor/ShapeEditor";
import Modal from "../Modal/Modal";

const Home = () => {
  const [shapes, setShapes] = useState([]);
  const [groupShapes, setGroupShapes] = useState([]);
  const [generatedCode, setGeneratedCode] = useState({
    jsxCode: "",
    scssCode: "",
  });
  const [tool, setTool] = useState(null);
  const [selectedShape, setSelectedShape] = useState(null);
  const [designId, setDesignId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addShape = (type) => {
    setTool(type);
  };

  const saveDesign = async () => {
    const response = await axios.post("saveDesign", {
      name: "MyDesign",
      components: [...shapes, ...groupShapes],
      styles: {},
    });

    if (response.status === 200) {
      alert("Design saved successfully!");
      setDesignId(response.data.designId);
    } else {
      alert("Failed to save design.");
    }
  };

  const generateCode = async () => {
    const response = await axios.post("generateCode", { designId });

    const result = await response.data;

    if (response.status === 200 && result.jsxCode && result.scssCode) {
      setGeneratedCode({ jsxCode: result.jsxCode, scssCode: result.scssCode });
      setIsModalOpen(true);
    } else {
      alert("Failed to generate code.");
    }
  };

  const clearCanvas = () => {
    setShapes([]);
    setSelectedShape(null);
    setGroupShapes([]);
  };

  const handleGroupComponents = () => {
    const selectedShapes = shapes.filter((shape) => shape.selected);
    if (selectedShapes.length > 0) {
      const newGroup = {
        id: `group${Math.random().toString(36).substr(2, 9)}`,
        type: "group",
        shapes: selectedShapes,
      };
      setGroupShapes([...groupShapes, newGroup]);
      setShapes(shapes.filter((shape) => !shape.selected));
      setSelectedShape(null);
    }
  };

  return (
    <div className={styles.appContainer}>
      <ToolPanel
        onAddRectangle={() => addShape("rectangle")}
        onAddCircle={() => addShape("circle")}
        onAddLine={() => addShape("line")}
        onAddText={() => addShape("text")}
        onSaveDesign={saveDesign}
        onGenerateCode={generateCode}
        onClearCanvas={clearCanvas}
        onGroupComponents={handleGroupComponents}
      />
      <Canvas
        shapes={shapes}
        setShapes={setShapes}
        tool={tool}
        setTool={setTool}
        selectedShape={selectedShape}
        setSelectedShape={setSelectedShape}
        groupShapes={groupShapes}
        setGroupShapes={setGroupShapes}
      />
      <ShapeEditor selectedShape={selectedShape} setShapes={setShapes} />
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generated Code"
      >
        <div className={styles.codeContainer}>
          <h3>JSX Code</h3>
          <pre>{generatedCode.jsxCode}</pre>
          <h3>SCSS Code</h3>
          <pre>{generatedCode.scssCode}</pre>
        </div>
      </Modal>
    </div>
  );
};

export default Home;
