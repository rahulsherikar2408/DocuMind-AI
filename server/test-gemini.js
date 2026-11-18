
import genAI from "./config/gemini.js";

const testGemini = async () => {
  try {
    console.log("\nTesting Gemini 3.5 Flash Lite...");

    const interaction = await genAI.interactions.create({
      model: "gemini-3.5-flash-lite",
      input: "Explain RAG in one simple sentence.",
    });

    console.log("\nGemini API Connected Successfully!");
    console.log("\nModel: Gemini 3.5 Flash Lite");
    console.log("\nGemini Response:");
    console.log(interaction.output_text);

  } catch (error) {
    console.error("\nGemini API Connection Failed:");
    console.error(error.message);
  }
};

testGemini();
