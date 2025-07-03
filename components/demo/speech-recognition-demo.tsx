'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';

export function SpeechRecognitionDemo() {
  const [output, setOutput] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [shouldKeepListening, setShouldKeepListening] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    addDebugLog('Component mounted on client');
  }, []);

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLog(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[Speech Debug] ${message}`);
  };
  
  const {
    transcript,
    interimTranscript,
    finalTranscript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error
  } = useSpeechRecognition({
    continuous: true,  // Back to true - but with better handling
    interimResults: true,
    lang: 'en-US',
    onTranscript: (transcript) => {
      addDebugLog(`Transcript received: "${transcript}"`);
      setOutput(prev => prev + transcript + ' ');
    },
    onError: (error) => {
      addDebugLog(`Error occurred: ${error}`);
      setShouldKeepListening(false); // Stop the loop on error
      console.error('Speech recognition error:', error);
    }
  });

  const handleToggleRecording = () => {
    if (isListening) {
      addDebugLog('Stopping recording...');
      setShouldKeepListening(false);
      stopListening();
    } else {
      addDebugLog('Starting recording...');
      addDebugLog(`Speech supported: ${isSupported}`);
      addDebugLog(`Browser: ${navigator.userAgent}`);
      setShouldKeepListening(true);
      startListening();
    }
  };

  // Handle when recognition ends
  useEffect(() => {
    if (!isListening && shouldKeepListening) {
      addDebugLog('Recognition ended. Click Start Recording again to continue.');
      setShouldKeepListening(false);
    }
  }, [isListening, shouldKeepListening]);

  const handleReset = () => {
    addDebugLog('Resetting transcript and output');
    setShouldKeepListening(false);
    resetTranscript();
    setOutput('');
    setDebugLog([]);
  };

  const handleTextToSpeech = () => {
    if (isClient && 'speechSynthesis' in window && output) {
      const utterance = new SpeechSynthesisUtterance(output);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const testMicrophoneAccess = async () => {
    try {
      addDebugLog('Testing microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      addDebugLog('Microphone access granted!');
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      addDebugLog(`Microphone access denied: ${error}`);
    }
  };

  const testSpeechRecognition = () => {
    if (!isClient) return;
    
    try {
      addDebugLog('Testing speech recognition manually...');
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        addDebugLog('SpeechRecognition not available');
        return;
      }
      
      addDebugLog(`Using ${window.SpeechRecognition ? 'SpeechRecognition' : 'webkitSpeechRecognition'}`);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;  // Try continuous mode
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      let hasStarted = false;
      
      recognition.onstart = () => {
        hasStarted = true;
        addDebugLog('Manual test: Recognition started - SPEAK NOW!');
      };
      
      recognition.onend = () => {
        addDebugLog('Manual test: Recognition ended');
        if (hasStarted) {
          addDebugLog('Manual test: Completed successfully');
        }
      };
      
      recognition.onerror = (e) => {
        addDebugLog(`Manual test: Error - ${e.error}`);
        if (e.error === 'no-speech') {
          addDebugLog('Manual test: No speech detected - try speaking louder');
        }
      };
      
      recognition.onresult = (e) => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const result = e.results[i];
          if (result.isFinal) {
            addDebugLog(`Manual test: FINAL - "${result[0].transcript}" (confidence: ${result[0].confidence})`);
          } else {
            addDebugLog(`Manual test: interim - "${result[0].transcript}"`);
          }
        }
      };
      
      recognition.start();
      
      // Auto-stop after 10 seconds for testing
      setTimeout(() => {
        if (hasStarted) {
          recognition.stop();
          addDebugLog('Manual test: Auto-stopped after 10 seconds');
        }
      }, 10000);
      
    } catch (error) {
      addDebugLog(`Manual test failed: ${error}`);
    }
  };

  const testSimpleRecognition = () => {
    addDebugLog('Starting simple one-time recognition...');
    startListening();
  };

  // Monitor listening state changes
  useEffect(() => {
    addDebugLog(`Listening state changed: ${isListening}`);
  }, [isListening]);

  // Monitor transcript changes
  useEffect(() => {
    if (transcript) {
      addDebugLog(`Transcript updated: "${transcript}"`);
    }
  }, [transcript]);

  // Monitor interim transcript changes
  useEffect(() => {
    if (interimTranscript) {
      addDebugLog(`Interim transcript: "${interimTranscript}"`);
    }
  }, [interimTranscript]);

  // Monitor final transcript changes
  useEffect(() => {
    if (finalTranscript) {
      addDebugLog(`Final transcript: "${finalTranscript}"`);
    }
  }, [finalTranscript]);

  // Monitor error changes
  useEffect(() => {
    if (error) {
      addDebugLog(`Error: ${error}`);
    }
  }, [error]);

  if (!isClient) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Loading Speech Recognition Demo...</CardTitle>
          <CardDescription>
            Initializing speech recognition functionality...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!isSupported) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-red-600">Speech Recognition Not Supported</CardTitle>
          <CardDescription>
            Your browser doesn't support speech recognition. Please use a modern browser like Chrome, Firefox, or Safari.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Speech Recognition Demo
        </CardTitle>
        <CardDescription>
          Test the speech-to-text functionality that powers the chatbot voice input.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleToggleRecording}
            variant={(isListening || shouldKeepListening) ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            {(isListening || shouldKeepListening) ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {(isListening || shouldKeepListening) ? 'Stop Recording' : 'Start Recording'}
          </Button>
          
          <Button onClick={handleReset} variant="outline">
            Reset
          </Button>
          
          <Button 
            onClick={handleTextToSpeech} 
            variant="outline"
            disabled={!output}
            className="flex items-center gap-2"
          >
            <Volume2 className="h-4 w-4" />
            Read Aloud
          </Button>
          
          <Button 
            onClick={testMicrophoneAccess} 
            variant="outline"
            className="flex items-center gap-2"
          >
            Test Microphone
          </Button>
          
          <Button 
            onClick={testSpeechRecognition} 
            variant="outline"
            className="flex items-center gap-2"
          >
            Manual Test
          </Button>
          
          <Button 
            onClick={testSimpleRecognition} 
            variant="outline"
            className="flex items-center gap-2"
            disabled={isListening}
          >
            Simple Test
          </Button>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isListening || shouldKeepListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <span className="text-sm text-gray-600">
              {isListening ? 'Recording...' : shouldKeepListening ? 'Restarting...' : 'Not recording'}
            </span>
          </div>
          
          {/* Debug info */}
          <div className="text-xs text-gray-500">
            <p>Is Client: {isClient ? 'Yes' : 'No'}</p>
            <p>Speech Supported: {isSupported ? 'Yes' : 'No'}</p>
            <p>Is Listening: {isListening ? 'Yes' : 'No'}</p>
            <p>Should Keep Listening: {shouldKeepListening ? 'Yes' : 'No'}</p>
            <p>Transcript Length: {transcript.length}</p>
            <p>Interim Length: {interimTranscript.length}</p>
            <p>Final Length: {finalTranscript.length}</p>
            <p>Output Length: {output.length}</p>
          </div>
          
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              Error: {error}
            </div>
          )}
        </div>

        {/* Debug Log */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">Debug Log:</h4>
          <div className="text-xs text-yellow-700 max-h-32 overflow-y-auto">
            {debugLog.length > 0 ? (
              debugLog.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))
            ) : (
              <div>No debug logs yet...</div>
            )}
          </div>
        </div>

        {/* Live transcript */}
        {interimTranscript && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-800 mb-2">Live Transcript:</p>
            <p className="text-blue-700 italic">{interimTranscript}</p>
          </div>
        )}

        {/* Final output */}
        <div className="bg-gray-50 p-4 rounded-lg border min-h-[100px]">
          <p className="text-sm font-medium text-gray-800 mb-2">Recognized Text:</p>
          <p className="text-gray-700 whitespace-pre-wrap">{output || 'No text recognized yet. Click "Start Recording" and speak.'}</p>
        </div>

        {/* Browser Support Test */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Browser Support Check:</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <div>✓ User Agent: {isClient ? navigator.userAgent.split(' ')[0] : 'Loading...'}</div>
            <div>✓ Window object: {typeof window !== 'undefined' ? 'Available' : 'Not Available'}</div>
            <div>✓ SpeechRecognition: {isClient && 'SpeechRecognition' in window ? 'Available' : 'Not Available'}</div>
            <div>✓ webkitSpeechRecognition: {isClient && 'webkitSpeechRecognition' in window ? 'Available' : 'Not Available'}</div>
            <div>✓ HTTPS: {isClient && location.protocol === 'https:' ? 'Yes' : location.protocol === 'http:' ? 'No (required for production)' : 'Unknown'}</div>
            <div>✓ Speech API: {isClient && (window.SpeechRecognition || window.webkitSpeechRecognition) ? 'Available (using webkit)' : 'Not Available'}</div>
          </div>
        </div>

        {/* Quick Test Instructions */}
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <h4 className="text-sm font-medium text-orange-800 mb-2">Quick Test Guide:</h4>
          <ol className="text-sm text-orange-700 space-y-1">
            <li>1. Click "Test Microphone" and allow access</li>
            <li>2. Click "Manual Test" and speak immediately when it starts</li>
            <li>3. If that works, try "Simple Test" with the main hook</li>
            <li>4. For continuous recording, use "Start Recording"</li>
          </ol>
        </div>

        {/* Usage instructions */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="text-sm font-medium text-green-800 mb-2">How to use:</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Click "Start Recording" and allow microphone access</li>
            <li>• Speak clearly into your microphone</li>
            <li>• The text will appear in real-time</li>
            <li>• Click "Stop Recording" when done</li>
            <li>• Use "Read Aloud" to hear the recognized text</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
