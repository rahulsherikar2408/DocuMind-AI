import extractPDFText from "./pdfService.js";
import chunkPDFPages from "./chunkingService.js";

import DocumentChunk from "../models/DocumentChunk.js";

const processAndStorePDF = async({
    fileBuffer,
    documentId,
    userId,
}) => {
    // Step 1: extract text from the PDF.
    const extractedData = await extractPDFText(fileBuffer);

    // Step 2: Split extracted text into chunks.
    const chunks = chunkPDFPages(extractedData.pages);

    if(chunks.length === 0){
        throw new Error("No text chunks were generated from the PDF.");
    }

    // Step 3: Prepare MongoDB records.
    const chunkDocuments = chunks.map((chunk) => ({
        document: documentId,
        user: userId,
        chunkIndex: chunk.chunkIndex,
        pageNumber: chunk.pageNumber,
        text: chunk.text,
        characterCount: chunk.characterCount,
    }));

    // Step 4: Save chunks in MongoDB.
    await DocumentChunk.insertMany(chunkDocuments);

    // Step 5: Return processing information.
    return {
        pageCount: extractedData.pageCount,
        chunkCount: chunks.length,
    };
};

export default processAndStorePDF;