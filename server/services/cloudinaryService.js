import cloudinary from "../config/cloudinary.js";
import { Readable } from "node:stream";
import { randomUUID } from "node:crypto";

const uploadPDFToCloudinary = (fileBuffer, originalFileName) => {
    return new Promise((resolve, reject) => {
        const safeFileName = originalFileName
            .replace(/\.pdf$/i, "")
            .replace(/[^a-zA-Z0-9_-]/g, "-")
            .replace(/-+/g, "-")
            .slice(0, 60);
        
        const publicId = `${safeFileName}-${randomUUID()}.pdf`;

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: "raw",
                type: "authenticated",
                asset_folder: "documind/documents",
                public_id: publicId,
            },
            (error, result) => {
                if(error) {
                    return reject(error);
                }

                if(!result) {
                    return reject(new Error("Cloudinary upload returned no result."));
                }

                resolve(result);
            }
        );

        Readable.from(fileBuffer).pipe(uploadStream);
    });
};

export default uploadPDFToCloudinary;