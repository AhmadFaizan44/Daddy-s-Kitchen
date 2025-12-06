import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

interface LiveConfig {
  apiKey: string;
  systemInstruction: string;
  onAudioData: (base64Audio: string) => void;
  onTranscript: (text: string, type: 'user' | 'model') => void;
  onClose: () => void;
}

export class GeminiLiveService {
  private ai: GoogleGenAI;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private nextStartTime = 0;
  private sessionPromise: Promise<any> | null = null;
  private isConnected = false;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async connect(config: LiveConfig) {
    if (this.isConnected) return;
    
    // Initialize Audio Contexts
    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    this.sessionPromise = this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          console.log("Gemini Live Session Opened");
          this.isConnected = true;
          this.startAudioInputStream();
        },
        onmessage: async (message: LiveServerMessage) => {
          // Handle Audio Output
          const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (base64Audio) {
            await this.playAudioChunk(base64Audio);
            config.onAudioData(base64Audio);
          }

          // Handle Transcriptions (Optional for UI)
          if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
             config.onTranscript(message.serverContent.modelTurn.parts[0].text, 'model');
          }
          
          const turnComplete = message.serverContent?.turnComplete;
          if (turnComplete) {
              // Turn is done
          }
        },
        onclose: () => {
          console.log("Gemini Live Session Closed");
          this.isConnected = false;
          this.cleanup();
          config.onClose();
        },
        onerror: (err) => {
          console.error("Gemini Live Error:", err);
          this.cleanup();
          config.onClose();
        }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: config.systemInstruction,
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } }
        }
      }
    });
  }

  private startAudioInputStream() {
    if (!this.inputAudioContext || !this.mediaStream || !this.sessionPromise) return;

    this.source = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
    this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBase64 = this.pcmToB64(inputData);
      
      this.sessionPromise?.then(session => {
        session.sendRealtimeInput({
          media: {
            mimeType: 'audio/pcm;rate=16000',
            data: pcmBase64
          }
        });
      });
    };

    this.source.connect(this.processor);
    this.processor.connect(this.inputAudioContext.destination);
  }

  private async playAudioChunk(base64Audio: string) {
    if (!this.outputAudioContext) return;

    const audioData = this.b64ToPcm(base64Audio);
    const audioBuffer = await this.createAudioBuffer(audioData, this.outputAudioContext);
    
    const source = this.outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.outputAudioContext.destination);
    
    // Ensure gapless playback
    const currentTime = this.outputAudioContext.currentTime;
    if (this.nextStartTime < currentTime) {
      this.nextStartTime = currentTime;
    }
    
    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;
  }

  async disconnect() {
    this.cleanup();
  }

  private cleanup() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
    if (this.processor && this.source) {
      this.source.disconnect();
      this.processor.disconnect();
    }
    if (this.inputAudioContext) this.inputAudioContext.close();
    if (this.outputAudioContext) this.outputAudioContext.close();
    
    this.isConnected = false;
    this.mediaStream = null;
    this.processor = null;
    this.source = null;
    this.inputAudioContext = null;
    this.outputAudioContext = null;
    this.sessionPromise = null;
    this.nextStartTime = 0;
  }

  // --- Helpers ---

  private pcmToB64(data: Float32Array): string {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return this.arrayBufferToBase64(int16.buffer);
  }

  private b64ToPcm(base64: string): Int16Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Int16Array(bytes.buffer);
  }

  private async createAudioBuffer(dataInt16: Int16Array, ctx: AudioContext): Promise<AudioBuffer> {
    const sampleRate = 24000;
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(1, frameCount, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}
