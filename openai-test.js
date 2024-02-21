const { OpenAI } = require('openai');
const dotenv = require('dotenv');
const path = require('path')

//TODO SET UP TEST CASES USING HTTP FOR TEST OF ESTABLISHED CONNECTION

async function retrieveResponse(preset, msg, extensionpath) {
    dotenv.config({ path: path.join(extensionpath, './ai.env') });

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        organization: process.env.OPENAI_ORGANIZATION
    })

    if (msg.lenght > 750) // test if long msg
        {return -1;}
    let outputList = [];
    const stream = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: preset},
            { role: "user", content: msg }],
        stream: true,
    });
    for await (const chunk of stream) {
        var output = chunk.choices[0].delta.content || "";
        outputList.push(output);
        //process.stdout.write(chunk.choices[0]?.delta?.content || "");
    }
    
    return outputList;
}

module.exports = {
    retrieveResponse
}
