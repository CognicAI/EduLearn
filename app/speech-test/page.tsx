'use client';

import { SpeechRecognitionDemo } from '@/components/demo/speech-recognition-demo';
import { ChatbotWidget } from '@/components/chatbot/chatbot-widget';

export default function SpeechTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Speech Recognition Test
          </h1>
          <p className="text-lg text-gray-600">
            Test the speech-to-text functionality for the EduLearn chatbot
          </p>
        </div>

        <SpeechRecognitionDemo />

        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Chatbot with Speech Recognition
          </h2>
          <p className="text-gray-600 mb-4">
            The chatbot now includes a microphone button for voice input. Click the microphone icon next to the paperclip to start speaking.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-800 mb-2">Features:</h3>
            <ul className="text-blue-700 space-y-1">
              <li>• Real-time speech recognition using Web Speech API</li>
              <li>• Visual feedback with animated microphone and speech waves</li>
              <li>• Automatic text insertion into the chat input</li>
              <li>• Error handling for permission denied and network issues</li>
              <li>• Support for multiple languages (default: English)</li>
              <li>• Continuous and interim results for better user experience</li>
            </ul>
          </div>
        </div>

        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h3 className="font-medium text-amber-800 mb-2">Browser Compatibility:</h3>
          <p className="text-amber-700 text-sm">
            Speech recognition works best in Chrome, Firefox, and Safari. Make sure to allow microphone access when prompted.
          </p>
        </div>
      </div>

      {/* Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
}
