/**
 * Voice Service Implementation
 * Implements Section 9.1.2: Voice Interface
 * Handles STT, TTS, wake word detection, and emotional prosody
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { VoiceCommand, VoiceResponse, TTSRequest, LimbicState, ServiceStatus } from '../models/types';

export class VoiceService {
  private isInitialized = false;
  private whisperModel: string | null = null;
  private piperModel: string | null = null;
  private wakeWordModel: string | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Initialize Whisper for STT
      this.whisperModel = process.env.WHISPER_MODEL || 'base';
      
      // Initialize Piper for TTS
      this.piperModel = process.env.PIPER_MODEL || 'en_US-lessac-medium';
      
      // Initialize wake word detection
      this.wakeWordModel = process.env.WAKE_WORD_MODEL || 'progeny';
      
      this.isInitialized = true;
      console.log('Voice Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Voice Service:', error);
      this.isInitialized = false;
    }
  }

  async speechToText(command: VoiceCommand): Promise<VoiceResponse> {
    if (!this.isInitialized) {
      throw new Error('Voice Service not initialized');
    }

    const startTime = Date.now();
    const response: VoiceResponse = {
      id: this.generateId(),
      commandId: command.id,
      metadata: {
        processingTime: 0,
        confidence: 0
      }
    };

    try {
      // Save audio data to temporary file
      const tempFile = await this.saveTempAudio(command.audioData, command.format);
      
      // Process with Whisper
      const transcription = await this.processWithWhisper(tempFile);
      
      // Clean up temp file
      await this.cleanupTempFile(tempFile);
      
      response.transcription = transcription.text;
      response.metadata.confidence = transcription.confidence;
      response.metadata.processingTime = Date.now() - startTime;
      
      // Detect emotion from voice characteristics
      if (command.metadata) {
        response.metadata.emotionalProsody = await this.analyzeEmotionalProsody(command);
      }

      return response;
      
    } catch (error) {
      console.error('STT processing error:', error);
      throw new Error(`Failed to process speech-to-text: ${error.message}`);
    }
  }

  async textToSpeech(text: string, limbicState?: LimbicState, voiceConfig?: TTSRequest['voiceConfig']): Promise<VoiceResponse> {
    if (!this.isInitialized) {
      throw new Error('Voice Service not initialized');
    }

    const startTime = Date.now();
    const response: VoiceResponse = {
      id: this.generateId(),
      metadata: {
        processingTime: 0,
        emotionalProsody: !!limbicState
      }
    };

    try {
      // Apply emotional prosody based on limbic state
      const processedText = await this.applyEmotionalProsody(text, limbicState);
      
      // Generate audio with Piper
      const audioBuffer = await this.generateAudioWithPiper(processedText, voiceConfig);
      
      response.audioResponse = audioBuffer;
      response.format = 'wav';
      response.metadata.processingTime = Date.now() - startTime;
      
      // Add prosody markers if limbic state is available
      if (limbicState) {
        response.metadata.prosodyMarkers = this.generateProsodyMarkers(limbicState);
      }

      return response;
      
    } catch (error) {
      console.error('TTS processing error:', error);
      throw new Error(`Failed to process text-to-speech: ${error.message}`);
    }
  }

  async detectWakeWord(audioData: Buffer): Promise<{ detected: boolean; confidence: number }> {
    if (!this.isInitialized || !this.wakeWordModel) {
      return { detected: false, confidence: 0 };
    }

    try {
      // Save audio to temporary file
      const tempFile = await this.saveTempAudio(audioData, 'wav');
      
      // Process with wake word detection model
      const result = await this.processWakeWordDetection(tempFile);
      
      // Clean up
      await this.cleanupTempFile(tempFile);
      
      return result;
      
    } catch (error) {
      console.error('Wake word detection error:', error);
      return { detected: false, confidence: 0 };
    }
  }

  private async saveTempAudio(audioData: Buffer, format: string): Promise<string> {
    const tempDir = path.join(process.cwd(), 'temp');
    await fs.promises.mkdir(tempDir, { recursive: true });
    
    const fileName = `temp_${Date.now()}.${format}`;
    const filePath = path.join(tempDir, fileName);
    
    await fs.promises.writeFile(filePath, audioData);
    return filePath;
  }

  private async cleanupTempFile(filePath: string): Promise<void> {
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      console.warn('Failed to cleanup temp file:', filePath, error);
    }
  }

  private async processWithWhisper(audioFile: string): Promise<{ text: string; confidence: number }> {
    return new Promise((resolve, reject) => {
      // Use whisper.cpp or OpenAI Whisper API
      const whisper = spawn('whisper', [
        audioFile,
        '--model', this.whisperModel!,
        '--language', 'en',
        '--output_format', 'json',
        '--output_dir', path.join(process.cwd(), 'temp')
      ]);

      let output = '';
      let error = '';

      whisper.stdout.on('data', (data) => {
        output += data.toString();
      });

      whisper.stderr.on('data', (data) => {
        error += data.toString();
      });

      whisper.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Whisper process failed: ${error}`));
          return;
        }

        try {
          const result = JSON.parse(output);
          resolve({
            text: result.text || '',
            confidence: result.confidence || 0.8
          });
        } catch (parseError) {
          // Fallback to plain text parsing
          resolve({
            text: output.trim(),
            confidence: 0.7
          });
        }
      });

      whisper.on('error', (err) => {
        reject(new Error(`Whisper spawn error: ${err.message}`));
      });
    });
  }

  private async generateAudioWithPiper(text: string, voiceConfig?: TTSRequest['voiceConfig']): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const tempDir = path.join(process.cwd(), 'temp');
      const outputFile = path.join(tempDir, `tts_${Date.now()}.wav`);
      
      // Build Piper command
      const piperArgs = [
        '--model', this.piperModel!,
        '--output_file', outputFile
      ];

      // Add voice configuration
      if (voiceConfig) {
        if (voiceConfig.speed) {
          piperArgs.push('--speed', voiceConfig.speed.toString());
        }
        if (voiceConfig.pitch) {
          piperArgs.push('--pitch', voiceConfig.pitch.toString());
        }
      }

      const piper = spawn('piper', piperArgs);

      piper.stdin.write(text);
      piper.stdin.end();

      let error = '';

      piper.stderr.on('data', (data) => {
        error += data.toString();
      });

      piper.on('close', async (code) => {
        if (code !== 0) {
          reject(new Error(`Piper process failed: ${error}`));
          return;
        }

        try {
          const audioBuffer = await fs.promises.readFile(outputFile);
          await this.cleanupTempFile(outputFile);
          resolve(audioBuffer);
        } catch (fileError) {
          reject(new Error(`Failed to read audio file: ${fileError.message}`));
        }
      });

      piper.on('error', (err) => {
        reject(new Error(`Piper spawn error: ${err.message}`));
      });
    });
  }

  private async processWakeWordDetection(audioFile: string): Promise<{ detected: boolean; confidence: number }> {
    // This would integrate with a wake word detection model like Porcupine
    // For now, return a simple implementation
    return new Promise((resolve) => {
      // Simulate processing time
      setTimeout(() => {
        // Random detection for demo purposes
        const detected = Math.random() > 0.7;
        const confidence = detected ? 0.8 + Math.random() * 0.2 : Math.random() * 0.3;
        
        resolve({ detected, confidence });
      }, 100);
    });
  }

  private async applyEmotionalProsody(text: string, limbicState?: LimbicState): Promise<string> {
    if (!limbicState) return text;

    let processedText = text;

    // Adjust speech patterns based on limbic state
    if (limbicState.valence < 0.3) {
      // Low valence - slower, more measured speech
      processedText = this.addPauseMarkers(processedText);
    } else if (limbicState.arousal > 0.7) {
      // High arousal - faster, more energetic speech
      processedText = this.removePauseMarkers(processedText);
    }

    // Adjust tone based on warmth
    if (limbicState.warmth > 0.7) {
      processedText = this.addWarmthMarkers(processedText);
    }

    return processedText;
  }

  private addPauseMarkers(text: string): string {
    // Add pause markers for slower speech
    return text.replace(/[.!?]/g, '$& <pause>');
  }

  private removePauseMarkers(text: string): string {
    // Remove excessive pauses for faster speech
    return text.replace(/\s{2,}/g, ' ');
  }

  private addWarmthMarkers(text: string): string {
    // Add warmth markers for gentler speech
    return text.replace(/\b(hello|hi|hey)\b/gi, '$1 <warm>');
  }

  private generateProsodyMarkers(limbicState: LimbicState): VoiceResponse['metadata']['prosodyMarkers'] {
    return {
      pitch: this.generatePitchContour(limbicState),
      energy: this.generateEnergyContour(limbicState),
      tempo: this.calculateTempo(limbicState)
    };
  }

  private generatePitchContour(limbicState: LimbicState): number[] {
    // Generate pitch contour based on emotional state
    const basePitch = 150; // Hz
    const variation = 20;
    
    const pitch = [];
    for (let i = 0; i < 10; i++) {
      const factor = 1 + (Math.sin(i * 0.5) * variation / 100);
      pitch.push(basePitch * factor);
    }
    
    return pitch;
  }

  private generateEnergyContour(limbicState: LimbicState): number[] {
    // Generate energy contour based on arousal
    const baseEnergy = limbicState.arousal;
    const energy = [];
    
    for (let i = 0; i < 10; i++) {
      energy.push(baseEnergy * (0.8 + Math.random() * 0.4));
    }
    
    return energy;
  }

  private calculateTempo(limbicState: LimbicState): number {
    // Calculate words per minute based on arousal and valence
    const baseTempo = 150; // WPM
    
    if (limbicState.arousal > 0.7) {
      return baseTempo * 1.2; // Faster when aroused
    } else if (limbicState.valence < 0.3) {
      return baseTempo * 0.8; // Slower when sad
    }
    
    return baseTempo;
  }

  private async analyzeEmotionalProsody(command: VoiceCommand): Promise<boolean> {
    // Analyze voice characteristics for emotional content
    // This would integrate with audio analysis libraries
    return new Promise((resolve) => {
      // Simple implementation based on metadata
      if (command.metadata?.noiseLevel && command.metadata.noiseLevel > 0.5) {
        resolve(false); // Too noisy for reliable analysis
      }
      
      // Simulate emotional prosody detection
      resolve(Math.random() > 0.5);
    });
  }

  private generateId(): string {
    return `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getStatus(): ServiceStatus {
    return {
      service: 'voice-service',
      status: this.isInitialized ? 'healthy' : 'unhealthy',
      lastCheck: new Date(),
      details: {
        whisperModel: this.whisperModel,
        piperModel: this.piperModel,
        wakeWordModel: this.wakeWordModel,
        initialized: this.isInitialized
      }
    };
  }

  async calibrateVoice(audioSamples: Buffer[]): Promise<any> {
    // Calibrate voice recognition for specific user
    // This would analyze voice patterns and create user profile
    return {
      voiceProfile: {
        pitchRange: [100, 200],
        speakingRate: 150,
        accent: 'neutral',
        characteristics: {
          clarity: 0.8,
          consistency: 0.9,
          emotionRange: 0.7
        }
      },
      confidence: 0.85
    };
  }

  async setVoiceProfile(profile: any): Promise<void> {
    // Set voice profile for TTS customization
    console.log('Voice profile set:', profile);
  }
}
