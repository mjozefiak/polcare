import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';

import { ChatStateService } from './services/chat-state.service';
import { GeminiAIService } from './services/gemini-ai.service';
import { PharmacyService } from '../../core/services/pharmacy.service';
import { AIAnalysis } from './models';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule],
  providers: [ChatStateService, GeminiAIService],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements OnInit {
  private chatState = inject(ChatStateService);
  private geminiAI = inject(GeminiAIService);
  private pharmacy = inject(PharmacyService);

  // Public signals for template
  readonly messages = this.chatState.messages;
  readonly isLoading = this.chatState.isLoading;

  // User input
  userInput = '';

  ngOnInit(): void {
    console.log('ChatComponent initialized');

    // Add welcome message on initialization if chat is empty
    if (this.messages().length === 0) {
      this.addWelcomeMessage();
    }
  }

  /**
   * Sends user message and processes with AI
   */
  async sendMessage(): Promise<void> {
    if (!this.userInput.trim()) return;

    const userMessage = this.userInput.trim();
    console.log('💬 [ChatComponent] User sending message:', userMessage);
    this.userInput = '';

    // Add user message
    this.chatState.addUserMessage(userMessage);
    console.log('✉️ [ChatComponent] User message added to chat');

    // Add loading message
    const loadingId = this.chatState.addLoadingMessage();
    this.chatState.setLoading(true);
    console.log('⏳ [ChatComponent] Loading indicator shown');

    try {
      // Get AI analysis
      const conversationHistory = this.chatState.getConversationHistory();
      console.log(
        '📚 [ChatComponent] Conversation history:',
        conversationHistory
      );

      console.log('🤖 [ChatComponent] Calling GeminiAI.analyzeSymptoms...');
      const analysis = await firstValueFrom(
        this.geminiAI.analyzeSymptoms(userMessage, conversationHistory)
      );

      if (analysis) {
        console.log('✅ [ChatComponent] AI analysis received, processing...');
        await this.processAIAnalysis(analysis);
      } else {
        console.log('❌ [ChatComponent] AI analysis is null/undefined');
      }
    } catch (error) {
      console.error('❌ [ChatComponent] Error processing message:', error);
      this.chatState.addAssistantMessage(
        "I apologize, but I'm experiencing some technical difficulties. Please try again or consider speaking with a healthcare professional.",
        'text'
      );
    } finally {
      // Remove loading message
      this.chatState.removeLoadingMessage(loadingId);
      this.chatState.setLoading(false);
      console.log('⏹️ [ChatComponent] Loading indicator hidden');
    }
  }

  /**
   * Handles enter key press in input
   */
  onEnterKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * Processes AI analysis and handles different response types
   */
  private async processAIAnalysis(analysis: AIAnalysis): Promise<void> {
    console.log('🔄 [ChatComponent] Processing AI analysis:', {
      status: analysis.diagnosis.status,
      urgency: analysis.urgency,
      intent: analysis.intent,
      responseLength: analysis.responseText.length,
    });

    // Add AI response message
    this.chatState.addAssistantMessage(analysis.responseText, 'diagnosis');
    console.log('💬 [ChatComponent] AI response message added to chat');

    // Handle different diagnosis outcomes
    switch (analysis.diagnosis.status) {
      case 'follow_up_needed':
        console.log(
          '❓ [ChatComponent] Follow-up needed, checking for questions...'
        );
        if (
          analysis.followUpQuestions &&
          analysis.followUpQuestions.length > 0
        ) {
          console.log(
            '❓ [ChatComponent] Follow-up questions available:',
            analysis.followUpQuestions.length
          );
          // Add follow-up question (for now, just add the first one as a response)
          setTimeout(() => {
            this.chatState.addAssistantMessage(
              `To help you better: ${analysis.followUpQuestions![0]}`,
              'text'
            );
            console.log(
              '💬 [ChatComponent] Follow-up question added after 1s delay'
            );
          }, 1000);
        } else {
          console.log('❓ [ChatComponent] No follow-up questions available');
        }
        break;

      case 'pharmacy_recommended':
        console.log('💊 [ChatComponent] Pharmacy recommendation triggered');
        await this.handlePharmacyRecommendation(analysis);
        break;

      case 'doctor_advised':
        console.log('👩‍⚕️ [ChatComponent] Doctor recommendation triggered');
        this.chatState.addAssistantMessage(
          'Based on your symptoms, I recommend seeking professional medical advice. Would you like help finding a doctor or hospital near you?',
          'diagnosis'
        );
        break;

      case 'emergency':
        console.log('🚨 [ChatComponent] Emergency recommendation triggered');
        this.chatState.addAssistantMessage(
          'If you are experiencing severe symptoms, please seek immediate medical attention or call emergency services at 112.',
          'diagnosis'
        );
        break;

      default:
        console.log(
          '🤷 [ChatComponent] Unknown diagnosis status:',
          analysis.diagnosis.status
        );
        break;
    }
  }

  /**
   * Handles pharmacy recommendations
   */
  private async handlePharmacyRecommendation(
    analysis: AIAnalysis
  ): Promise<void> {
    console.log('💊 [ChatComponent] Starting pharmacy recommendation...');
    try {
      // For now, use mock pharmacy data
      console.log(
        '🏦 [ChatComponent] Fetching pharmacies from PharmacyService...'
      );
      const pharmacies = await firstValueFrom(this.pharmacy.getAllPharmacies());

      if (pharmacies && pharmacies.length > 0) {
        console.log('✅ [ChatComponent] Pharmacies found:', pharmacies.length);
        // Show nearest pharmacy recommendation
        const nearest = pharmacies[0];
        console.log(
          '📍 [ChatComponent] Nearest pharmacy:',
          nearest.name,
          'at',
          nearest.address
        );
        setTimeout(() => {
          this.chatState.addAssistantMessage(
            `I found a nearby pharmacy: ${nearest.name} at ${nearest.address}. A pharmacist can help you with appropriate medications for your symptoms.`,
            'pharmacy_suggestion'
          );
          console.log('💬 [ChatComponent] Pharmacy suggestion added to chat');
        }, 1500);
      } else {
        console.log('❌ [ChatComponent] No pharmacies found');
      }
    } catch (error) {
      console.error('❌ [ChatComponent] Error fetching pharmacies:', error);
    }
  }

  /**
   * Adds welcome message when chat opens
   */
  private addWelcomeMessage(): void {
    setTimeout(() => {
      this.chatState.addAssistantMessage(
        "👋 Hello! I'm your health assistant. What's bothering you today? Please describe your symptoms and I'll help you understand what might be wrong.",
        'text'
      );
    }, 500);
  }

  /**
   * Clears chat history
   */
  clearChat(): void {
    this.chatState.clearChat();
    this.addWelcomeMessage();
  }
}
