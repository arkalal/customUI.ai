import { NextResponse } from "next/server";
import Design from "../../../../models/Design";
import connectMongoDB from "../../../../utils/mongoDB";

export async function POST(req) {
  const { name, components, styles } = await req.json();

  try {
    await connectMongoDB();
    const newDesign = new Design({ name, components, styles });
    await newDesign.save();

    return NextResponse.json(
      { message: "Design saved successfully.", designId: newDesign._id },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
