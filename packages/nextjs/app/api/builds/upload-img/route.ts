import { NextRequest, NextResponse } from "next/server";
import mime from "mime-types";
import { bucket } from "~~/services/firebase";

export async function POST(request: NextRequest) {
  try {
    if (!request.body) {
      return NextResponse.json({ error: "No request body" }, { status: 400 });
    }

    // Check if the content type is multipart/form-data
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Content type must be multipart/form-data" }, { status: 400 });
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file is an image
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Uploaded file must be an image" }, { status: 400 });
    }

    // Generate a unique filename
    const fileExtension = mime.extension(file.type) || "";
    const newFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExtension}`;
    const newPath = `builds/${newFileName}`;

    // Get file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a file in Firebase Storage
    const fileRef = bucket.file(newPath);

    // Upload the buffer
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        cacheControl: "public, max-age=31536000",
      },
      public: true, // Make the file publicly accessible
    });

    const publicUrl = fileRef.publicUrl();

    // Return the permanent media link
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
