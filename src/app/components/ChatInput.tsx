import { useState, KeyboardEvent, useRef } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Send, Loader2, Mic, MicOff, Image as ImageIcon, X } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string, image?: File) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>("");

  const handleSend = () => {
    if ((input.trim() || selectedImage) && !disabled) {
      onSend(input.trim(), selectedImage || undefined);
      setInput("");
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const startRecording = async () => {
    try {
      
      // Check if browser supports Web Speech API
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        alert("⚠️ Voice recognition is not supported in this browser.\nPlease use Chrome or Edge for the best experience.");
        return;
      }
      
      // Initialize speech recognition with professional settings
      const recognition = new SpeechRecognition();
      
      // Professional English-only configuration
      recognition.lang = 'en-US'; // English (United States) only
      recognition.continuous = true; // Keep listening until manually stopped
      recognition.interimResults = true; // Show real-time results
      recognition.maxAlternatives = 1; // Best result only
      
      // Clear transcript at start
      transcriptRef.current = "";
      
      recognition.onstart = () => {
        setIsRecording(true);
        setIsTranscribing(true);
      };
      
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            // Final result - add to permanent transcript
            finalTranscript += transcript;
          } else {
            // Interim result - show temporarily
            interimTranscript += transcript;
          }
        }
        
        // Update transcript reference with final results only
        if (finalTranscript) {
          transcriptRef.current += (transcriptRef.current ? ' ' : '') + finalTranscript;
        }
        
        // Update input field with final + interim (for real-time feedback)
        const fullText = transcriptRef.current + (interimTranscript ? ' ' + interimTranscript : '');
        setInput(fullText.trim());
      };
      
      recognition.onerror = (event: any) => {
        
        if (event.error === 'not-allowed') {
          alert("Microphone access denied. Please enable it in your browser settings.");
          setIsRecording(false);
          setIsTranscribing(false);
        } else if (event.error === 'no-speech') {
          // Don't stop, just continue
        } else if (event.error !== 'aborted') {
        }
      };
      
      recognition.onend = () => {
        setIsRecording(false);
        setIsTranscribing(false);
        
        // Keep the final transcript in the input
        if (transcriptRef.current) {
          setInput(transcriptRef.current.trim());
        }
      };
      
      recognitionRef.current = recognition;
      recognition.start();
      
    } catch (error) {
      alert("Unable to access microphone. Please check your browser permissions.");
      setIsRecording(false);
      setIsTranscribing(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        // Ignore stop errors
      }
      recognitionRef.current = null;
    }
    
    setIsRecording(false);
    setIsTranscribing(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="border-t border-border/50 bg-background/95 backdrop-blur-md p-3 sm:p-4 lg:p-6 shadow-lg">
      <div className="max-w-4xl mx-auto">
        {imagePreview && (
          <div className="mb-3 relative inline-block group animate-in fade-in slide-in-from-bottom-2">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-20 w-20 sm:h-24 sm:w-24 object-cover rounded-xl border-2 border-primary shadow-lg"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-destructive hover:bg-destructive/90 text-white rounded-full p-1.5 shadow-lg transition-all hover:scale-110"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <div className="flex gap-2 sm:gap-3 items-end">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-[52px] w-[52px] sm:h-[58px] sm:w-[58px] lg:h-[64px] lg:w-[64px] shrink-0 border-2 border-border/50 hover:border-primary/50 hover:bg-muted/80 rounded-xl sm:rounded-2xl transition-all duration-200 hover:scale-105 shadow-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            <ImageIcon className="w-5 h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Runner Code anything..."
              className="min-h-[52px] sm:min-h-[58px] lg:min-h-[64px] max-h-[200px] bg-input-background/50 backdrop-blur-sm border-2 border-border/50 focus:border-primary/50 rounded-xl sm:rounded-2xl resize-none pr-12 sm:pr-14 text-sm sm:text-base leading-relaxed shadow-sm transition-all duration-200 placeholder:text-muted-foreground/60"
              disabled={disabled}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={`absolute right-2 bottom-2 h-9 w-9 sm:h-10 sm:w-10 rounded-lg transition-all duration-200 ${
                isRecording 
                  ? "text-red-500 bg-red-500/10 animate-pulse scale-110 ring-2 ring-red-500/50" 
                  : "hover:bg-muted/80 hover:scale-105"
              }`}
              onClick={toggleRecording}
              disabled={disabled}
              title={isRecording ? "🛑 Stop recording" : "🎤 Start voice input"}
            >
              {isRecording ? (
                <div className="relative">
                  <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  {isTranscribing && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                  )}
                </div>
              ) : (
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </Button>
          </div>

          <Button
            onClick={handleSend}
            disabled={disabled || (!input.trim() && !selectedImage)}
            size="icon"
            className="h-[52px] w-[52px] sm:h-[58px] sm:w-[58px] lg:h-[64px] lg:w-[64px] bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shrink-0 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {disabled ? (
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
            ) : (
              <Send className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </Button>
        </div>
        <div className="mt-2 text-[10px] sm:text-xs text-muted-foreground/60 text-center flex items-center justify-center gap-2 flex-wrap">
          <span>Press Enter to send • Shift + Enter for new line</span>
          
          {isRecording && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500/10 text-red-500 rounded-full animate-pulse font-medium">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              Listening in English...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
