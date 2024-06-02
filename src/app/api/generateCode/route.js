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
        const stylesName =
          component.id.charAt(0).toLowerCase() + component.id.slice(1);

        return `
        <div className={styles.${stylesName}} style={{
          position: 'absolute',
          left: '${component.x}px',
          top: '${component.y}px',
          width: '${component.width || 0}px',
          height: '${component.height || 0}px',
          backgroundColor: '${component.fill || "transparent"}'
        }}>
          ${component.text || ""}
        </div>`;
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

    return `
.${stylesName} {
  position: absolute;
  left: ${component.x}px;
  top: ${component.y}px;
  width: ${component.width || 0}px;
  height: ${component.height || 0}px;
  background-color: ${component.fill || "transparent"};
}
    `;
  })
  .join("\n")}
  `;
}
