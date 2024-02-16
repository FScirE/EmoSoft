import axios from 'axios';
import './openai-test.mjs'; // Update the path accordingly

jest.setTimeout(30000); // Set timeout to allow for longer response times

describe('OpenAI Connection Test', () => {
  test('Should retrieve response from OpenAI', async () => {
    const preset = 'Your system preset'; // Replace with your actual preset
    const msg = 'User message for testing'; // Replace with your actual user message

    // Make a request to your API or module
    const responseList = await retrieveResponse(preset, msg);

    // Check if the response list is an array and contains some content
    expect(Array.isArray(responseList)).toBeTruthy();
    expect(responseList.length).toBeGreaterThan(0);

    // Add more specific assertions as needed based on your use case
  });
});
