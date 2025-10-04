import { Injectable, signal, WritableSignal, computed } from '@angular/core';
import { ChatMessage, MessageThread } from '../models';

@Injectable()
export class ChatStateService {
  // Core chat state signals
  private messagesSignal: WritableSignal<ChatMessage[]> = signal([]);
  private isOpenSignal: WritableSignal<boolean> = signal(false);
  private isLoadingSignal: WritableSignal<boolean> = signal(false);
  private currentThreadSignal: WritableSignal<MessageThread | null> =
    signal(null);

  // Computed signals for derived state
  readonly messages = this.messagesSignal.asReadonly();
  readonly isOpen = this.isOpenSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly currentThread = this.currentThreadSignal.asReadonly();

  // Computed signal for unread message count
  readonly hasUnreadMessages = computed(
    () =>
      this.messagesSignal().filter(
        (msg) => !msg.isAssistant && !this.isOpenSignal()
      ).length
  );

  // Computed signal for last assistant message
  readonly lastAssistantMessage = computed(() => {
    const messages = this.messagesSignal();
    const assistantMessages = messages.filter((msg) => msg.isAssistant);
    return assistantMessages.length > 0
      ? assistantMessages[assistantMessages.length - 1]
      : null;
  });

  /**
   * Opens the chat widget
   */
  openChat(): void {
    this.isOpenSignal.set(true);
    this.createNewThreadIfNeeded();
  }

  /**
   * Closes the chat widget
   */
  closeChat(): void {
    this.isOpenSignal.set(false);
  }

  /**
   * Toggles chat widget visibility
   */
  toggleChat(): void {
    this.isOpenSignal.update((current) => !current);
    if (this.isOpenSignal()) {
      this.createNewThreadIfNeeded();
    }
  }

  /**
   * Adds a new message to the chat
   */
  addMessage(message: ChatMessage): void {
    this.messagesSignal.update((messages) => [...messages, message]);
  }

  /**
   * Adds user message and returns message ID
   */
  addUserMessage(content: string): string {
    const message: ChatMessage = {
      id: this.generateMessageId(),
      content,
      isAssistant: false,
      timestamp: new Date(),
      type: 'text',
    };
    this.addMessage(message);
    console.log('👤 [ChatStateService] User message added:', {
      id: message.id,
      content: content.substring(0, 50) + '...',
    });
    return message.id;
  }

  /**
   * Adds assistant message (diagnosis, pharmacy recommendations, etc.)
   */
  addAssistantMessage(
    content: string,
    type: ChatMessage['type'] = 'text'
  ): string {
    const message: ChatMessage = {
      id: this.generateMessageId(),
      content,
      isAssistant: true,
      timestamp: new Date(),
      type,
    };
    this.addMessage(message);
    console.log('🤖 [ChatStateService] Assistant message added:', {
      id: message.id,
      type,
      content: content.substring(0, 50) + '...',
    });
    return message.id;
  }

  /**
   * Adds a loading message for AI processing
   */
  addLoadingMessage(): string {
    const message: ChatMessage = {
      id: this.generateMessageId(),
      content: 'AI is analyzing your symptoms...',
      isAssistant: true,
      timestamp: new Date(),
      type: 'loading',
    };
    this.addMessage(message);
    return message.id;
  }

  /**
   * Removes loading message by ID
   */
  removeLoadingMessage(messageId: string): void {
    this.messagesSignal.update((messages) =>
      messages.filter((msg) => msg.id !== messageId)
    );
  }

  /**
   * Sets loading state
   */
  setLoading(isLoading: boolean): void {
    this.isLoadingSignal.set(isLoading);
  }

  /**
   * Clears all messages and starts fresh
   */
  clearChat(): void {
    this.messagesSignal.set([]);
    this.currentThreadSignal.set(null);
  }

  /**
   * Gets conversation history as text for AI context
   */
  getConversationHistory(): string[] {
    return this.messagesSignal().map(
      (msg) => `${msg.isAssistant ? 'Assistant' : 'User'}: ${msg.content}`
    );
  }

  /**
   * Creates new thread if none exists
   */
  private createNewThreadIfNeeded(): void {
    if (!this.currentThreadSignal()) {
      const thread: MessageThread = {
        id: this.generateThreadId(),
        messages: [],
        createdAt: new Date(),
        status: 'active',
      };
      this.currentThreadSignal.set(thread);
    }
  }

  /**
   * Generates unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generates unique thread ID
   */
  private generateThreadId(): string {
    return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
