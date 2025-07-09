'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

export interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  onTranscript?: (transcript: string) => void;
  onError?: (error: string) => void;
}

export interface UseSpeechRecognitionReturn {
  transcript: string;
  interimTranscript: string;
  finalTranscript: string;
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const {
    lang = 'en-US',
    continuous = false,
    interimResults = true,
    maxAlternatives = 1,
    onTranscript,
    onError
  } = options;

  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isInitializedRef = useRef(false);
  
  // Use refs to keep callbacks stable
  const onTranscriptRef = useRef(onTranscript);
  const onErrorRef = useRef(onError);
  
  // Update callback refs when they change
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);
  
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);
  
  // Check if running on client side
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const isSupported = isClient && typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Initialize speech recognition only once
  useEffect(() => {
    if (!isSupported || !isClient || isInitializedRef.current) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    const recognition = recognitionRef.current;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = lang;
    recognition.maxAlternatives = maxAlternatives;

    console.log(`[Speech Recognition] Initialized with ${window.SpeechRecognition ? 'SpeechRecognition' : 'webkitSpeechRecognition'}`);
    console.log(`[Speech Recognition] Settings: continuous=${continuous}, interimResults=${interimResults}, lang=${lang}`);

    recognition.onstart = () => {
      console.log('[Speech Recognition] Started');
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      console.log('[Speech Recognition] Ended');
      setIsListening(false);
      // Clear interim results when recognition ends
      setInterimTranscript('');
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[Speech Recognition] Error:', event.error, event.message);
      setError(event.error);
      setIsListening(false);
      onErrorRef.current?.(event.error);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      console.log('[Speech Recognition] Result event:', event);
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        console.log(`[Speech Recognition] Result ${i}:`, result[0].transcript, 'isFinal:', result.isFinal, 'confidence:', result[0].confidence);
        
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setInterimTranscript(interimTranscript);
      
      if (finalTranscript) {
        setFinalTranscript(prev => prev + finalTranscript);
        setTranscript(prev => prev + finalTranscript);
        console.log('[Speech Recognition] Calling onTranscript with:', finalTranscript);
        onTranscriptRef.current?.(finalTranscript);
      } else if (interimTranscript) {
        // Update transcript with interim results for real-time feedback
        setTranscript(prev => {
          const baseFinal = prev.replace(/[^.!?]*$/, ''); // Remove any previous interim text
          return baseFinal + interimTranscript;
        });
      }
    };

    isInitializedRef.current = true;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      isInitializedRef.current = false;
    };
  }, [isSupported, isClient]);

  // Update recognition settings when options change
  useEffect(() => {
    if (!recognitionRef.current || !isInitializedRef.current) return;

    const recognition = recognitionRef.current;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = lang;
    recognition.maxAlternatives = maxAlternatives;

    console.log(`[Speech Recognition] Updated settings: continuous=${continuous}, interimResults=${interimResults}, lang=${lang}`);
  }, [continuous, interimResults, lang, maxAlternatives]);

  const startListening = useCallback(() => {
    console.log('[Speech Recognition] Attempting to start...');
    console.log('isSupported:', isSupported);
    console.log('isClient:', isClient);
    console.log('recognitionRef.current:', recognitionRef.current);
    
    if (!isSupported || !isClient || !recognitionRef.current) {
      const errorMsg = 'Speech recognition not supported';
      console.error('[Speech Recognition]', errorMsg);
      setError(errorMsg);
      return;
    }

    try {
      console.log('[Speech Recognition] Starting recognition...');
      recognitionRef.current.start();
    } catch (error) {
      const errorMsg = 'Failed to start speech recognition';
      console.error('[Speech Recognition]', errorMsg, error);
      setError(errorMsg);
    }
  }, [isSupported, isClient]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setFinalTranscript('');
    setError(null);
  }, []);

  return {
    transcript,
    interimTranscript,
    finalTranscript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error
  };
}
