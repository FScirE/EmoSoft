## Emotionally Aware IDE Plugin
This document serves as a guide for installing and using the Emotionally Aware IDE plugin for VScode. Designed to enhance programmer productivity, the plugin leverages biosensing technology to monitor your focus and emotional state.

## Features
Real-time Focus & Calm Tracking: Gain insights into your focus and calmness levels (measured as percentages) to understand your coding state.
AI Chat Assistant: Interact with an AI assistant powered by OpenAI's GPT-4 for personalized guidance and advice on maintaining focus.
Session Recording & Evaluation: Start, manage, and evaluate coding sessions with detailed focus and eye-tracking data visualization to identify areas for improvement.

## Requirements
VScode
Neurosity Crown EEG headset
GP3 Eye-tracker by Gazepoint
OpenAI account with balance and access key
Installation
Ensure you have the required hardware and software listed above.
Open VScode and navigate to the Extensions tab.
Search for "Emotionally Aware IDE by Emosoft" and install the extension.
Refer to the "How to set up..." sections below for specific device configuration instructions.
How to Use
## Set Up Devices

### Neurosity Crown:
Create a file named "envNeurosity.env" in the plugin folder.
The file should contain the following lines (including quotation marks):
DEVICE_ID="your_neurosity_device_id_hexadecimal"
EMAIL="your_neurosity_account_email@email.com"
PASSWORD="your_neurosity_account_password"
Eye-tracker: Refer to the eye-tracker's manual for setup instructions.
2. Start a Session

Click the "Start Session" button within the VScode interface.

3. Interact with the AI Assistant

Type your message in the chat window and press Enter to send. The AI assistant will respond in the same window.

4. End Session

Click the "End Session" button when finished with your coding session.

5. Evaluate Session Data

After ending a session, you can view graphs of your focus and calmness levels, along with eye-tracking heatmaps to analyze your coding behavior.

## Security and Privacy
The Emotionally Aware IDE plugin prioritizes user privacy. All data regarding your emotional state is saved locally on your machine and not transmitted to the creators. The plugin itself does not encrypt this data. It's recommended to encrypt extracted session data files before storing or sharing them.

For more detailed information, refer to the full user manual.
## Known Issues


## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release
* Chat with AI assistant (based on GPT4)
* AI gives notification when unfocused/agitated
* Show your current focus and calm level (bottom of UI/Chat window)

### 1.1.0
Major changes:

* Implementation of eye-tracking feature (generates heatmap, highlights lines)
* Implementation of evaluate session
* Implementation of start/end recording sessions
* Implementation of status bar (focus and calm)

Minor changes:
* AI chat now remembers the last promtp sent

### 1.2.0

Major changes:
* Implementation of settings
The user can now change certain settings such as: allow notifications, max lenght of session, color schemes, adjust threshold etc.
* In the evaluate session page, top 3 functions you were looking at is now visable

Minor changes:
* Various bug fixes
* When the evaluate page is loading, the user is presented with a notification
* Status bar colors and size changed



Added features X, Y, and Z.
## Additional Notes
The AI assistant may prompt you with advice if your focus or calmness levels drop below a set threshold.
A color indicator at the bottom of VScode reflects your current emotional state (blue - focused/calm, red - unfocused/uncalm, orange - mixed state)