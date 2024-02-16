import OpenAI from "openai";
import dotenv from 'dotenv';
dotenv.config();
//TODO set up eviroment variables to hide sensitive information
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORGANIZATION
})


//TODO SET UP TEST CASES USING HTTP FOR TEST OF ESTABLISHED CONNECTION



export async function retrieveResponse(preset, msg) {
    let outputList = [];
    const stream = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: preset},
            { role: "user", content: msg }],
        stream: true,
    });
    for await (const chunk of stream) {
        var output = chunk.choices[0]?.delta?.content || "";
        outputList.push(output);
        process.stdout.write(chunk.choices[0]?.delta?.content || "");
    }
    
    return outputList;
}
