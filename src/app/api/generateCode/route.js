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

    console.log("Design:", design);

    const jsxCode = generateJSX(design);
    const scssCode = generateSCSS(design);

    return NextResponse.json({ jsxCode, scssCode }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

function generateJSX(design) {
  const componentsCode = design.components
    .map((component) => {
      if (!component.id) {
        throw new Error("Component ID is undefined");
      }

      const componentName =
        component.id.charAt(0).toUpperCase() + component.id.slice(1);
      const stylesName =
        component.id.charAt(0).toLowerCase() + component.id.slice(1);

      return `
const ${componentName} = () => (
  <div className={styles.${stylesName}} style={{
    width: '${component.width || 0}px',
    height: '${component.height || 0}px',
    backgroundColor: '${component.fill || "transparent"}'
  }}>
    ${component.content || ""}
  </div>
);

export default ${componentName};
    `;
    })
    .join("\n");

  return `
import React from 'react';
import styles from './${design.name}.module.scss';

${componentsCode}
`;
}

function generateSCSS(design) {
  const stylesCode = design.components
    .map((component) => {
      if (!component.id) {
        throw new Error("Component ID is undefined");
      }

      const stylesName =
        component.id.charAt(0).toLowerCase() + component.id.slice(1);

      return `
.${stylesName} {
  width: ${component.width || 0}px;
  height: ${component.height || 0}px;
  background-color: ${component.fill || "transparent"};
}
    `;
    })
    .join("\n");

  return stylesCode;
}
