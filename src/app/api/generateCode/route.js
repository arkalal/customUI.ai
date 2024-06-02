import { NextResponse } from "next/server";
import connectMongoDB from "../../../../utils/mongoDB";
import Design from "../../../../models/Design";

export async function POST(req) {
  const { designId } = await req.json();

  try {
    await connectMongoDB();
    const design = await Design.findById(designId);
    if (!design) {
      return NextResponse.json({ error: "Design not found." }, { status: 404 });
    }

    const jsxCode = generateJSX(design);
    const scssCode = generateSCSS(design);

    return NextResponse.json({ jsxCode, scssCode }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

function generateJSX(design) {
  return `
import React from 'react';
import styles from './${design.name}.module.scss';

const ${design.name} = () => (
  <div className={styles.container}>
    ${design.components
      .map((component) => {
        const componentTag = component.type === "text" ? "span" : "div";
        const stylesName =
          component.id.charAt(0).toLowerCase() + component.id.slice(1);

        return `
        <${componentTag} className={styles.${stylesName}}>
          ${component.text || ""}
        </${componentTag}>`;
      })
      .join("\n")}
  </div>
);

export default ${design.name};
  `;
}

function generateSCSS(design) {
  return `
.container {
  position: relative;
  width: 100%;
  height: 100%;
}

${design.components
  .map((component) => {
    const stylesName =
      component.id.charAt(0).toLowerCase() + component.id.slice(1);
    let shapeSpecificStyles = "";

    if (component.type === "circle") {
      shapeSpecificStyles = `
        width: ${component.radius * 2}px;
        height: ${component.radius * 2}px;
        border-radius: 50%;
      `;
    } else if (component.type === "rectangle" || component.type === "text") {
      shapeSpecificStyles = `
        width: ${component.width}px;
        height: ${component.height}px;
      `;
    } else if (component.type === "line") {
      // For line, we might need to use different approach in real projects, such as SVG or canvas.
      shapeSpecificStyles = `
        width: ${Math.abs(component.points[2] - component.points[0])}px;
        height: ${component.strokeWidth}px;
        transform: rotate(${Math.atan2(
          component.points[3] - component.points[1],
          component.points[2] - component.points[0]
        )}rad);
      `;
    }

    return `
.${stylesName} {
  position: absolute;
  left: ${component.x}px;
  top: ${component.y}px;
  background-color: ${component.fill || "transparent"};
  ${shapeSpecificStyles}
}
    `;
  })
  .join("\n")}
  `;
}
