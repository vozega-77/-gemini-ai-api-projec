const { GoogleGenerativeAI } = require('@google/generative-ai'); // Import the Google Generative AI library
const express = require('express');  // Import Express for creating the API server
const dotenv = require('dotenv'); // Load environment variables from a .env file
dotenv.config(); // Load environment variables
const app = express(); // Create an Express application
const port = process.env.PORT || 3000; // Set the port from environment variables or default to 3000

app.use(express.json()); // Middleware to parse JSON request bodies
const multer = require('multer'); // Initialize multer for handling multipart/form-data
const upload = multer({ dest: 'uploads/' }); // Set the destination for uploaded files
const fs = require('fs'); // Import the file system module for file operations
const path = require('path'); // Import the path module for handling file paths


const genAI = new GoogleGenerativeAI(process.env.Gemini_API); // Initialize the Google Generative AI client with the API key
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); // Get the Gemini 2.5 Flash model

// ENDPOINT UNTUK GENERATE TEXT
app.post("/generate-text", async (req, res) => {
    try {
        const { prompt } = req.body; // Extract the prompt from the request body

        const result = await model.generateContent(prompt); // Generate content using the model
        const response = result.response // Get the response from the model
        const text = response.text(); // Extract the text from the response

        res.status(200).json({ output: text })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'An error occurred while generating text.' });
    }
})

const imageGenerativePart = (filePath, mimeType) => ({
    inlineData: {
        data: fs.readFileSync(filePath).toString('base64'), // Read the file and convert it to base64,
        mimeType: mimeType // Set the MIME type of the file
    }
})

// ENDPOINT UNTUK MEMBACA IMAGE
app.post("/generate-from-image", upload.single('image'), async (req, res) => {
    try {
        const { prompt } = req.body; // Extract the prompt from the request body
        const image = imageGenerativePart(req.file.path, req.file.mimetype); // Prepare the image data for the model

        const result = await model.generateContent([prompt, image])
        const response = result.response; // Get the response from the model
        const text = response.text(); // Extract the text from the response

        res.status(200).json({ output: text }) // Send the generated text as a response
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'An error occurred while generating text from image.' });
    } finally {
        fs.unlinkSync(req.file.path); // Delete the uploaded file
    }
})

// ENDPOINT UNTUK MEMBACA DOKUMEN

app.post("/generate-from-document", upload.single('document'), async (req, res) => {
    try {
        // const { prompt } = req.body; // Extract the prompt from the request body
        const filePath = req.file.path; // Get the path of the uploaded file
        const mimeType = req.file.mimetype; // Get the MIME type of the uploaded file
        const document = imageGenerativePart(filePath, mimeType); // Prepare the document data for the model
        const result = await model.generateContent(['Analyze this document: ', document])
        const response = result.response
        const text = response.text(); // Extract the text from the response
        res.status(200).json({ output: text }) // Send the generated text as a response
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'An error occurred while generating text from document.' });
    } finally {
        fs.unlinkSync(req.file.path); // Delete the uploaded file
    }
})

// ENDPOINT UNTUK MEMBACA AUDIO

app.post("/generate-from-audio", upload.single('audio'), async (req, res) => {
    try {
        // const { prompt } = req.body; // Extract the prompt from the request body
        const filePath = req.file.path; // Get the path of the uploaded file
        const mimeType = req.file.mimetype; // Get the MIME type of the uploaded file
        const audio = imageGenerativePart(filePath, mimeType); // Prepare the document data for the model
        const result = await model.generateContent(['Analyze this audio: ', audio])
        const response = result.response
        const text = response.text(); // Extract the text from the response
        res.status(200).json({ output: text }) // Send the generated text as a response
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'An error occurred while generating text from audio.' });
    } finally {
        fs.unlinkSync(req.file.path); // Delete the uploaded file
    }
})



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); // Start the server and listen on the specified port


