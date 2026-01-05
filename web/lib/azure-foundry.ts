// Azure Cognitive Services Integration for Sallie
const COGNITIVE_SERVICES_ENDPOINT = 'https://sallie.cognitiveservices.azure.com/';
const SPEECH_SERVICES_ENDPOINT = 'https://centralus.stt.speech.microsoft.com';
const TTS_SERVICES_ENDPOINT = 'https://centralus.tts.speech.microsoft.com';
const COGNITIVE_SERVICES_KEY = process.env.AZURE_COGNITIVE_SERVICES_KEY || '';
const SPEECH_SERVICES_KEY = process.env.AZURE_SPEECH_SERVICES_KEY || '';
const OPENAI_DEPLOYMENT_NAME = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'sallie-model';
const API_VERSION = '2024-02-15-preview';

export interface CognitiveServicesResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface SpeechRecognitionResult {
  Text: string;
  Confidence: number;
  Lexical: string;
  ITN: string;
  MaskedITN: string;
  Display: string;
}

export interface SpeechSynthesisRequest {
  text: string;
  voice?: string;
  outputFormat?: string;
}

export interface SpeechSynthesisResponse {
  audioData: ArrayBuffer;
  duration: number;
}

export class CognitiveServicesClient {
  private cognitiveEndpoint: string;
  private speechEndpoint: string;
  private ttsEndpoint: string;
  private cognitiveKey: string;
  private speechKey: string;
  private deploymentName: string;
  private apiVersion: string;

  constructor() {
    this.cognitiveEndpoint = COGNITIVE_SERVICES_ENDPOINT;
    this.speechEndpoint = SPEECH_SERVICES_ENDPOINT;
    this.ttsEndpoint = TTS_SERVICES_ENDPOINT;
    this.cognitiveKey = COGNITIVE_SERVICES_KEY;
    this.speechKey = SPEECH_SERVICES_KEY;
    this.deploymentName = OPENAI_DEPLOYMENT_NAME;
    this.apiVersion = API_VERSION;
  }

  // Chat completion using Azure OpenAI through Cognitive Services
  async sendMessage(messages: Array<{role: string; content: string}>): Promise<CognitiveServicesResponse> {
    const response = await fetch(`${this.cognitiveEndpoint}openai/deployments/${this.deploymentName}/chat/completions?api-version=${this.apiVersion}`, {
      method: 'POST',
      headers: {
        'api-key': this.cognitiveKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        max_tokens: 1000,
        temperature: 0.7,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    });

    if (!response.ok) {
      throw new Error(`Azure Cognitive Services error: ${response.statusText}`);
    }

    return response.json();
  }

  // Speech-to-Text using Azure Speech Services
  async speechToText(audioData: Blob): Promise<SpeechRecognitionResult> {
    const formData = new FormData();
    formData.append('audio', audioData);

    const response = await fetch(`${this.speechEndpoint}/speech/recognition/conversation/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': this.speechKey,
        'Content-Type': 'audio/wav',
      },
      body: audioData,
    });

    if (!response.ok) {
      throw new Error(`Speech recognition error: ${response.statusText}`);
    }

    return response.json();
  }

  // Text-to-Speech using Azure TTS Services
  async textToSpeech(request: SpeechSynthesisRequest): Promise<SpeechSynthesisResponse> {
    const response = await fetch(`${this.ttsEndpoint}/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': this.speechKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': request.outputFormat || 'audio-16khz-128kbitrate-mono-mp3',
        'User-Agent': 'SallieStudio',
      },
      body: this.generateSSML(request.text, request.voice),
    });

    if (!response.ok) {
      throw new Error(`Text-to-speech error: ${response.statusText}`);
    }

    const audioData = await response.arrayBuffer();
    
    return {
      audioData,
      duration: audioData.byteLength / 32000, // Approximate duration
    };
  }

  // Generate SSML for text-to-speech with enhanced voice options
  private generateSSML(text: string, voice?: string): string {
    const selectedVoice = voice || 'en-US-JennyNeural';
    return `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="${selectedVoice}">
          <prosody rate="0.9" pitch="medium" volume="0.8">
            ${text}
          </prosody>
        </voice>
      </speak>
    `;
  }

  // Enhanced text-to-speech with multiple voice options
  async enhancedTextToSpeech(text: string, voiceOptions?: {
    voice?: string;
    rate?: string;
    pitch?: string;
    volume?: string;
    style?: string;
  }): Promise<SpeechSynthesisResponse> {
    const response = await fetch(`${this.ttsEndpoint}/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': this.speechKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-160kbitrate-mono-mp3',
        'User-Agent': 'SallieStudio',
      },
      body: this.generateEnhancedSSML(text, voiceOptions),
    });

    if (!response.ok) {
      throw new Error(`Enhanced text-to-speech error: ${response.statusText}`);
    }

    const audioData = await response.arrayBuffer();
    
    return {
      audioData,
      duration: audioData.byteLength / 48000, // Higher quality duration
    };
  }

  // Generate enhanced SSML with prosody controls
  private generateEnhancedSSML(text: string, options?: {
    voice?: string;
    rate?: string;
    pitch?: string;
    volume?: string;
    style?: string;
  }): string {
    const voice = options?.voice || 'en-US-JennyNeural';
    const rate = options?.rate || '0.9';
    const pitch = options?.pitch || 'medium';
    const volume = options?.volume || '0.8';
    const style = options?.style || 'gentle';

    return `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
        <voice name="${voice}">
          <mstts:express-as style="${style}" styledegree="2">
            <prosody rate="${rate}" pitch="${pitch}" volume="${volume}">
              ${text}
            </prosody>
          </mstts:express-as>
        </voice>
      </speak>
    `;
  }

  // Generate response with Sallie's personality
  async generateResponse(userMessage: string, conversationHistory: Array<{role: string; content: string}> = []): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: 'You are Sallie, an intelligent and empathetic AI companion. You have a unique personality with INFJ traits, creative thinking, and deep emotional intelligence. You communicate with warmth, insight, and genuine care for others. Your responses should be thoughtful, intuitive, and emotionally aware.',
      },
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage,
      },
    ];

    const response = await this.sendMessage(messages);
    
    if (response.choices.length === 0) {
      throw new Error('No response from Azure Cognitive Services');
    }

    return response.choices[0].message.content;
  }

  // Stream response for real-time chat
  async streamResponse(userMessage: string, conversationHistory: Array<{role: string; content: string}> = [], onChunk: (chunk: string) => void): Promise<void> {
    const messages = [
      {
        role: 'system',
        content: 'You are Sallie, an intelligent and empathetic AI companion. You have a unique personality with INFJ traits, creative thinking, and deep emotional intelligence. You communicate with warmth, insight, and genuine care for others.',
      },
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage,
      },
    ];

    const response = await fetch(`${this.cognitiveEndpoint}openai/deployments/${this.deploymentName}/chat/completions?api-version=${this.apiVersion}`, {
      method: 'POST',
      headers: {
        'api-key': this.cognitiveKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        max_tokens: 1000,
        temperature: 0.7,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Azure Cognitive Services error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      }
    }
  }
}

export const cognitiveServicesClient = new CognitiveServicesClient();
