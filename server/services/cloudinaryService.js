import cloudinary from "../config/cloudinary.js";
import { Readable } from "node:stream";
import { randomUUID } from "node:crypto";
import path from "node:path";

const uploadPDFToCloudinary = (
  fileBuffer,
  originalFileName,
  mimeType = "application/pdf"
) => {
  return new Promise((resolve, reject) => {
    const isImage = mimeType.startsWith("image/");
    const ext = path.extname(originalFileName).toLowerCase() || (isImage ? ".png" : ".pdf");
    const safeFileName = originalFileName
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60);

    const publicId = isImage
      ? `${safeFileName}-${randomUUID()}`
      : `${safeFileName}-${randomUUID()}${ext}`;

    const resourceType = isImage ? "image" : "raw";

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        type: "authenticated",
        asset_folder: "documind/documents",
        public_id: publicId,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result) {
          return reject(new Error("Cloudinary upload returned no result."));
        }

        resolve({
          ...result,
          storageResourceType: resourceType,
        });
      }
    );

    Readable.from(fileBuffer).pipe(uploadStream);
  });
};

export const deleteDocumentFromCloudinary = async (doc) => {
  if (!doc) return { result: "skipped" };

  if (doc.storageProvider && doc.storageProvider !== "cloudinary") {
    return { result: "skipped" };
  }

  let publicId = doc.storageKey;
  let cldType = "authenticated";
  const isImage =
    doc.storageResourceType === "image" ||
    (doc.mimeType && doc.mimeType.startsWith("image/"));
  const resourceType = isImage ? "image" : "raw";

  if (doc.storageUrl) {
    if (
      doc.storageUrl.includes("/raw/upload/") ||
      doc.storageUrl.includes("/image/upload/")
    ) {
      cldType = "upload";
    }
    if (!publicId) {
      const match = doc.storageUrl.match(
        /\/(?:raw|image)\/(?:authenticated|upload)\/(?:v\d+\/)?(.+?)(?:\?.*)?$/
      );
      if (match) {
        publicId = decodeURIComponent(match[1]);
      }
    }
  }

  if (!publicId) {
    return { result: "skipped" };
  }

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    type: cldType,
    invalidate: true,
  });

  if (result?.result === "not found" && cldType === "authenticated") {
    const fallbackResult = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      type: "upload",
      invalidate: true,
    });
    return fallbackResult;
  }

  return result;
};

export default uploadPDFToCloudinary;
