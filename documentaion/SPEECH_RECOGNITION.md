# Speech Recognition Implementation

This document describes the speech-to-text functionality added to the EduLearn chatbot.

## Features

### 🎤 Voice Input
- **Real-time speech recognition** using the Web Speech API
- **Visual feedback** with animated microphone and speech wave indicators
- **Automatic text insertion** into the chat input field
- **Error handling** for common issues like permission denied and network errors

### 🎯 User Experience
- **Intuitive microphone button** next to the file attachment button
- **Live transcript display** showing interim results while speaking
- **Visual cues** with red pulsing animation when recording
- **Smart placeholder text** that changes based on recording state

### 🔧 Technical Implementation
- **Custom React hook** (`useSpeechRecognition`) for speech recognition logic
- **TypeScript support** with proper type definitions
- **Error boundary** handling for unsupported browsers
- **Graceful degradation** when speech recognition is not available

## Files Modified/Created

### Core Components
- `components/chatbot/chatbot-widget.tsx` - Updated with speech recognition UI and logic
- `hooks/use-speech-recognition.ts` - Custom hook for speech recognition functionality
- `app/globals.css` - Added animations and styles for speech recognition UI

### Demo Components
- `components/demo/speech-recognition-demo.tsx` - Standalone demo component
- `app/speech-test/page.tsx` - Test page for speech recognition features

## Usage

### In the Chatbot
1. Click the microphone button (🎤) next to the paperclip
2. Allow microphone access when prompted
3. Speak clearly into your microphone
4. Watch the text appear in real-time in the input field
5. Click the microphone button again to stop recording
6. Review the text and send your message

### Browser Compatibility
- ✅ **Chrome** - Full support
- ✅ **Firefox** - Full support  
- ✅ **Safari** - Full support
- ❌ **Internet Explorer** - Not supported

## API Reference

### useSpeechRecognition Hook

```typescript
const {
  transcript,        // Complete transcript
  interimTranscript, // Current interim results
  finalTranscript,   // Final confirmed results
  isListening,       // Whether currently recording
  isSupported,       // Browser support status
  startListening,    // Start recording function
  stopListening,     // Stop recording function
  resetTranscript,   // Clear transcript function
  error             // Error message if any
} = useSpeechRecognition(options);
```

### Options
```typescript
interface UseSpeechRecognitionOptions {
  lang?: string;              // Language code (default: 'en-US')
  continuous?: boolean;       // Continuous recognition (default: false)
  interimResults?: boolean;   // Show interim results (default: true)
  maxAlternatives?: number;   // Max alternatives (default: 1)
  onTranscript?: (transcript: string) => void;  // Callback for new transcript
  onError?: (error: string) => void;            // Callback for errors
}
```

## Configuration

### Language Support
The speech recognition can be configured for different languages:

```typescript
const speechRecognition = useSpeechRecognition({
  lang: 'en-US',  // English (US)
  // lang: 'es-ES',  // Spanish
  // lang: 'fr-FR',  // French
  // lang: 'de-DE',  // German
  // lang: 'it-IT',  // Italian
  // lang: 'pt-BR',  // Portuguese (Brazil)
  // lang: 'ja-JP',  // Japanese
  // lang: 'ko-KR',  // Korean
  // lang: 'zh-CN',  // Chinese (Simplified)
});
```

### Customization
The speech recognition behavior can be customized:

```typescript
const speechRecognition = useSpeechRecognition({
  continuous: true,        // Keep listening until manually stopped
  interimResults: true,    // Show partial results while speaking
  maxAlternatives: 3,      // Get multiple recognition alternatives
  onTranscript: (text) => {
    // Handle new transcript
    console.log('New transcript:', text);
  },
  onError: (error) => {
    // Handle errors
    console.error('Speech recognition error:', error);
  }
});
```

## Error Handling

The implementation handles common errors:

- **`not-allowed`** - Microphone access denied
- **`network`** - Network connectivity issues
- **`no-speech`** - No speech detected
- **`aborted`** - Recognition aborted
- **`audio-capture`** - Audio capture failed
- **`service-not-allowed`** - Service not allowed

## Security Considerations

- **HTTPS Required** - Speech recognition requires HTTPS in production
- **User Consent** - Always request microphone permission explicitly
- **Privacy** - Speech data is processed locally by the browser
- **Fallback** - Provide text input as fallback for accessibility

## Testing

Visit `/speech-test` to test the speech recognition functionality with a dedicated demo page.

## Future Enhancements

- **Multi-language detection** - Automatically detect spoken language
- **Voice commands** - Add support for voice commands like "send message"
- **Offline support** - Add offline speech recognition capabilities
- **Custom wake words** - Support for wake word activation
- **Speaker identification** - Multi-user voice recognition

## Troubleshooting

### Common Issues

1. **Microphone not working**
   - Check browser permissions
   - Ensure microphone is not muted
   - Try refreshing the page

2. **Poor recognition accuracy**
   - Speak clearly and slowly
   - Reduce background noise
   - Check microphone quality

3. **Not supported message**
   - Update your browser
   - Try a different browser
   - Check if HTTPS is enabled

### Debug Mode

Enable debug logging in the browser console:

```javascript
// In browser console
localStorage.setItem('speechDebug', 'true');
```

This will log detailed information about speech recognition events and errors.
