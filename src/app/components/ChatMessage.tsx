import { useState } from "react";
import { ChatMessage as ChatMessageType } from "../types/chat";
import { User, Bot, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "./ui/button";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (code: string) => {
    try {
      // Use fallback method directly to avoid clipboard permission issues
      const textArea = document.createElement("textarea");
      textArea.value = code;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          setCopiedCode(code);
          setTimeout(() => setCopiedCode(null), 2000);
        }
      } catch (err) {
        console.error('Unable to copy', err);
      } finally {
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div
      className={`flex gap-3 sm:gap-4 md:gap-5 p-3 sm:p-5 md:p-6 lg:p-7 ${
        isUser 
          ? "bg-background" 
          : "bg-card/50"
      }`}
    >
      <div className="flex-shrink-0">
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg ${
            isUser 
              ? "bg-gradient-to-br from-muted to-muted/80" 
              : "bg-gradient-to-br from-primary to-primary/80 ring-2 ring-primary/20"
          }`}
        >
          {isUser ? (
            <User className="w-4 h-4 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 text-foreground" />
          ) : (
            <Bot className="w-4 h-4 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 text-primary-foreground" />
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="mb-1.5 sm:mb-2 flex items-center gap-2">
          <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
            {isUser ? "You" : "Runner Code AI"}
          </span>
          <span className="text-[10px] sm:text-xs text-muted-foreground/60">
            {new Date(message.timestamp).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
        
        {/* Display image if present */}
        {message.imageUrl && (
          <div className="mb-3 sm:mb-4">
            <img
              src={message.imageUrl}
              alt="Uploaded image"
              className="max-w-full sm:max-w-md lg:max-w-lg rounded-xl border-2 border-primary/20 shadow-lg cursor-pointer"
              onClick={() => window.open(message.imageUrl, '_blank')}
            />
          </div>
        )}
        
        <div className="prose prose-sm sm:prose-base prose-invert prose-pre:p-0 prose-pre:bg-transparent max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                const codeString = String(children).replace(/\n$/, "");
                
                return !inline && match ? (
                  <div className="relative group my-3 sm:my-4 rounded-xl overflow-hidden shadow-lg border border-border/50">
                    <div className="flex items-center justify-between bg-gradient-to-r from-[#1e1e1e] to-[#252525] px-3 sm:px-4 py-2 sm:py-2.5 border-b border-gray-700/50">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                        <span className="text-xs sm:text-sm font-mono text-gray-400 ml-2">{match[1]}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm font-medium rounded-lg opacity-50 group-hover:opacity-100 transition-all hover:bg-white/10 hover:scale-105"
                        onClick={() => copyToClipboard(codeString)}
                      >
                        {copiedCode === codeString ? (
                          <>
                            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5 text-green-400" />
                            <span className="hidden sm:inline text-green-400">Copied!</span>
                            <span className="sm:hidden text-green-400">✓</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
                            <span className="hidden sm:inline">Copy</span>
                            <span className="sm:hidden">Copy</span>
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="overflow-x-auto">
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        className="!mt-0 !rounded-none !bg-[#1e1e1e] text-xs sm:text-sm"
                        customStyle={{
                          margin: 0,
                          padding: '1rem',
                          fontSize: 'inherit'
                        }}
                        {...props}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                ) : (
                  <code
                    className="bg-primary/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs sm:text-sm text-primary font-mono border border-primary/20"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              pre({ children }: any) {
                return <div className="my-3 sm:my-4">{children}</div>;
              },
              p({ children }: any) {
                return <p className="mb-3 sm:mb-4 leading-relaxed sm:leading-loose text-sm sm:text-base text-foreground/90">{children}</p>;
              },
              h1({ children }: any) {
                return (
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 mt-5 sm:mt-6 text-foreground border-b border-border/30 pb-2">
                    {children}
                  </h1>
                );
              },
              h2({ children }: any) {
                return (
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 mt-4 sm:mt-5 text-foreground">
                    {children}
                  </h2>
                );
              },
              h3({ children }: any) {
                return (
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-2 mt-3 sm:mt-4 text-foreground">
                    {children}
                  </h3>
                );
              },
              ul({ children }: any) {
                return (
                  <ul className="list-disc list-outside ml-5 sm:ml-6 mb-3 sm:mb-4 space-y-1.5 sm:space-y-2 text-sm sm:text-base text-foreground/90">
                    {children}
                  </ul>
                );
              },
              ol({ children }: any) {
                return (
                  <ol className="list-decimal list-outside ml-5 sm:ml-6 mb-3 sm:mb-4 space-y-1.5 sm:space-y-2 text-sm sm:text-base text-foreground/90">
                    {children}
                  </ol>
                );
              },
              li({ children }: any) {
                return <li className="leading-relaxed marker:text-primary">{children}</li>;
              },
              a({ href, children }: any) {
                return (
                  <a
                    href={href}
                    className="text-primary hover:text-primary/80 underline decoration-primary/30 hover:decoration-primary/60 transition-colors font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                );
              },
              img({ src, alt }: any) {
                return (
                  <div className="my-4 rounded-xl overflow-hidden shadow-lg border-2 border-primary/10 hover:border-primary/30 transition-all duration-200 group">
                    <img
                      src={src}
                      alt={alt || "Image"}
                      className="w-full h-auto object-cover cursor-pointer group-hover:scale-[1.02] transition-transform duration-200"
                      onClick={() => window.open(src, '_blank')}
                      loading="lazy"
                    />
                  </div>
                );
              },
              blockquote({ children }: any) {
                return (
                  <blockquote className="border-l-4 border-primary/60 bg-primary/5 pl-4 pr-4 py-2 rounded-r-lg italic my-3 sm:my-4 text-muted-foreground text-sm sm:text-base">
                    {children}
                  </blockquote>
                );
              },
              table({ children }: any) {
                return (
                  <div className="overflow-x-auto my-3 sm:my-4 rounded-xl border border-border/50 shadow-md">
                    <table className="min-w-full divide-y divide-border text-sm sm:text-base">
                      {children}
                    </table>
                  </div>
                );
              },
              thead({ children }: any) {
                return <thead className="bg-gradient-to-r from-muted to-muted/70">{children}</thead>;
              },
              th({ children }: any) {
                return (
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-bold text-xs sm:text-sm uppercase tracking-wider text-foreground">
                    {children}
                  </th>
                );
              },
              td({ children }: any) {
                return (
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-foreground/90 border-t border-border/30">
                    {children}
                  </td>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}