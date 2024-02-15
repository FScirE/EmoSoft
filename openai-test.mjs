import OpenAI from "openai";
//TODO set up eviroment variables to hide sensitive information
const openai = new OpenAI({
    apiKey: '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',
    organization: 'org-1hNgPZv2AosFPeMGTXAgL7dJ'
})
//Allow for context
var input = "Hjälp en programmerare som är ofokuserad att bli mer fokuserad. Ge 3 exempel på vad han kan göra med två meningar per exempel";


export async function main(msg) {
    const stream = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are a helpful coding assistant"},
            { role: "user", content: "förklara denna kod for i in range(10)" }], // content is input!
        stream: true,
    });
    for await (const chunk of stream) {
        var output = chunk.choices[0]?.delta?.content || "";
        process.stdout.write(chunk.choices[0]?.delta?.content || "");
    }
}
main();