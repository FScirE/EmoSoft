import OpenAI from "openai";
//TODO set up eviroment variables to hide sensitive information
const openai = new OpenAI({
    apiKey: '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',
    organization: 'org-1hNgPZv2AosFPeMGTXAgL7dJ'
})


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
