'use client';

import { useState, useEffect, useCallback } from 'react';
import { cognitiveServicesClient } from '@/lib/azure-foundry';

export function useCognitiveServices() {
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string; content: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingResponse, setStreamingResponse] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState<ArrayBuffer | null>(null);

  const sendMessage = useCallback(async (message: string) => {
    setLoading(true);
    setError(null);
    setStreamingResponse('');

    try {
      // Add user message to history
      const userMessage = { role: 'user', content: message };
      const newHistory = [...conversationHistory, userMessage];
      setConversationHistory(newHistory);

      // Stream response for real-time feel
      let fullResponse = '';
      await cognitiveServicesClient.streamResponse(
        message,
        conversationHistory,
        (chunk) => {
          fullResponse += chunk;
          setStreamingResponse(fullResponse);
        }
      );

      // Add assistant response to history
      const assistantMessage = { role: 'assistant', content: fullResponse };
      setConversationHistory(prev => [...prev, assistantMessage]);
      setStreamingResponse('');
      
      return fullResponse;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      return null;
    } finally {
      setLoading(false);
    }
  }, [conversationHistory]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      
      // Here you would implement audio recording logic
      // For now, we'll just set a placeholder
      console.log('Recording started');
      
      return stream;
    } catch (err) {
      setError('Failed to access microphone');
      return null;
    }
  }, []);

  const stopRecording = useCallback(async (stream: MediaStream) => {
    setIsRecording(false);
    
    try {
      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());
      
      // Here you would process the recorded audio
      // and send it to Azure Speech Services
      console.log('Recording stopped');
      
      // Placeholder for speech-to-text
      // const result = await cognitiveServicesClient.speechToText(audioBlob);
      
    } catch (err) {
      setError('Failed to process audio');
    }
  }, []);

  const textToSpeech = useCallback(async (text: string, voiceOptions?: {
    voice?: string;
    rate?: string;
    pitch?: string;
    volume?: string;
    style?: string;
  }) => {
    try {
      // Use enhanced TTS for better Sallie personality
      const response = await cognitiveServicesClient.enhancedTextToSpeech(text, {
        voice: 'en-US-JennyNeural',
        rate: '0.9',
        pitch: 'medium',
        volume: '0.8',
        style: 'gentle',
        ...voiceOptions
      });
      
      setAudioData(response.audioData);
      
      // Create audio blob and play
      const audioBlob = new Blob([response.audioData], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      // Auto-play with error handling
      audio.play().catch(err => {
        console.warn('Auto-play failed, user interaction may be required:', err);
      });
      
      return response;
    } catch (err) {
      setError('Failed to generate speech');
      return null;
    }
  }, []);

  const clearHistory = useCallback(() => {
    setConversationHistory([]);
    setStreamingResponse('');
    setError(null);
    setAudioData(null);
  }, []);

  return {
    conversationHistory,
    loading,
    error,
    streamingResponse,
    isRecording,
    audioData,
    sendMessage,
    startRecording,
    stopRecording,
    textToSpeech,
    clearHistory,
  };
}
