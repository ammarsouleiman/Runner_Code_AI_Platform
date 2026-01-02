import { useState } from "react";
import { Conversation } from "../types/chat";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import logo from "../../assets/3546325734eebbae935ba64a28db9c350a382fdd.png";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

export function Sidebar({
  conversations,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
}: SidebarProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null);

  const handleDeleteClick = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent conversation selection
    setConversationToDelete(conv);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (conversationToDelete) {
      setDeletingId(conversationToDelete.id);
      onDeleteConversation(conversationToDelete.id);
      setDeletingId(null);
      setShowDeleteModal(false);
      setConversationToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setConversationToDelete(null);
  };

  return (
    <div className="w-[280px] sm:w-[300px] lg:w-[320px] bg-sidebar border-r border-sidebar-border flex flex-col h-full shadow-xl">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-sidebar-border bg-sidebar/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <img 
              src={logo} 
              alt="Runner Code" 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex-shrink-0 ring-2 ring-primary/20" 
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-sidebar"></div>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-bold text-sidebar-foreground truncate">
              Runner Code
            </h1>
            <p className="text-xs text-muted-foreground font-medium">AI Assistant</p>
          </div>
        </div>
        <Button
          onClick={onNewChat}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm sm:text-base font-semibold py-2.5 sm:py-3 rounded-xl shadow-lg hover:shadow-primary/20 transition-all duration-200 hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 px-2 py-3">
        {conversations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground font-medium">No conversations yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Start a new chat to begin</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group relative flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl transition-all duration-200 animate-in fade-in slide-in-from-left ${
                  deletingId === conv.id
                    ? "opacity-50 scale-95"
                    : conv.id === currentConversationId
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-md scale-[1.02]"
                    : "hover:bg-sidebar-accent/50 text-sidebar-foreground hover:scale-[1.01]"
                }`}
              >
                <div
                  className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer"
                  onClick={() => onSelectConversation(conv.id)}
                >
                  <div className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${
                    conv.id === currentConversationId 
                      ? "bg-primary/20" 
                      : "bg-muted/50"
                  }`}>
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 max-w-full">
                    <span className="block text-sm font-medium leading-snug break-words whitespace-normal line-clamp-2">
                      {conv.title}
                    </span>
                    <span className="block text-xs text-muted-foreground mt-1">
                      {new Date(conv.updatedAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                <button
                  className={`flex-shrink-0 p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 border border-red-500/20 hover:border-red-500/40 transition-all hover:scale-110 active:scale-95 self-start mt-0.5 ${
                    deletingId === conv.id ? 'animate-pulse opacity-50' : 'opacity-100'
                  }`}
                  onClick={(e) => handleDeleteClick(conv, e)}
                  disabled={deletingId === conv.id}
                  title="Delete conversation"
                  aria-label={`Delete conversation: ${conv.title}`}
                  style={{ 
                    minWidth: '44px', 
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar/50 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">Powered by</span>
          <span className="font-bold text-primary">Runner Code</span>
        </div>
        <div className="flex items-center justify-center gap-1 mt-2 text-[10px] text-muted-foreground/70">
          <span>v1.0.0</span>
          <span>•</span>
          <span>2026</span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        conversationTitle={conversationToDelete?.title || ""}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}