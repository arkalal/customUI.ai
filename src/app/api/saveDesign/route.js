import { NextResponse } from "next/server";
import Design from "../../../../models/Design";
import connectMongoDB from "../../../../utils/mongoDB";

export async function POST(req) {
  const { name, components, styles } = await req.json();

  try {
    await connectMongoDB();

    // Ensure every component has width and height
    const validatedComponents = components.map((component) => {
      if (!component.width) component.width = 100; // Default width
      if (!component.height) component.height = 100; // Default height
      return component;
    });

    const newDesign = new Design({
      name,
      components: validatedComponents,
      styles,
    });
    await newDesign.save();

    return NextResponse.json(
      { message: "Design saved successfully.", designId: newDesign._id },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
