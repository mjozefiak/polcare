import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AIAnalysis,
  GeminiRequest,
  GeminiResponse,
  DiagnosisResult,
} from '../models';

@Injectable()
export class GeminiAIService {
  private readonly apiKey = environment.geminiApiKey;
  private readonly baseUrl =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent';

  private readonly http = inject(HttpClient);

  /**
   * Analyzes user symptoms and returns AI analysis
   */
  analyzeSymptoms(
    symptoms: string,
    conversationHistory: string[]
  ): Observable<AIAnalysis> {
    console.log('🤖 [GeminiAI] analyzeSymptoms called with:', {
      symptoms,
      conversationHistory,
      hasApiKey: !!this.apiKey,
    });

    if (!this.apiKey) {
      console.log('🔧 [GeminiAI] Gemini API key is not set');
      throw new Error('Gemini API key is not set');
    }

    const request: GeminiRequest = {
      prompt: this.buildPrompt(symptoms, conversationHistory),
      context: {
        conversation_history: conversationHistory,
        current_symptoms: [symptoms],
        user_location: 'Poland', // For pharmacy suggestions
      },
      language: 'en',
    };

    console.log('📤 [GeminiAI] Making API request to:', this.baseUrl);
    console.log('📤 [GeminiAI] Request payload:', {
      prompt: request.prompt.substring(0, 200) + '...',
      context: request.context,
    });

    return this.http
      .post<GeminiResponse>(
        this.baseUrl,
        {
          contents: [
            {
              parts: [{ text: request.prompt }],
            },
          ],
        },
        {
          headers: {
            'x-goog-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      )
      .pipe(
        // Transform API response to our AIAnalysis interface
        this.mapToAIAnalysis()
      );
  }

  /**
   * Maps Gemini API response to AIAnalysis
   */
  private mapToAIAnalysis() {
    return map((response: any): AIAnalysis => {
      console.log('📥 [GeminiAI] Received API response:', response);

      // Handle real Gemini API response structure
      const candidate = response.candidates?.[0];
      const content = candidate?.content?.parts?.[0]?.text;

      if (!content) {
        throw new Error('No content found in Gemini API response');
      }

      console.log('📝 [GeminiAI] Extracted content:', content);

      // Parse the AI response to determine recommendations
      const analysis = this.parseAIResponse(content);

      console.log('📝 [GeminiAI] Mapped to AIAnalysis:', {
        intent: analysis.intent,
        urgency: analysis.urgency,
        diagnosisStatus: analysis.diagnosis.status,
        responseLength: analysis.responseText.length,
        hasFollowUp: !!analysis.followUpQuestions?.length,
      });

      return analysis;
    });
  }

  /**
   * Parses AI response content to determine recommendations
   */
  private parseAIResponse(content: string): AIAnalysis {
    console.log(
      '🔍 [GeminiAI] Parsing AI response content:',
      content.substring(0, 200) + '...'
    );

    // Try to extract clean response text from JSON
    let cleanResponseText = content;
    let urgency: AIAnalysis['urgency'] = 'low';
    let status: DiagnosisResult['status'] = 'follow_up_needed';
    let followUpQuestions: string[] = [];

    // Check if response contains JSON
    if (content.trim().includes('{') && content.trim().includes('}')) {
      try {
        // Try to parse JSON-like structure
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[0];
          const analysisData = JSON.parse(jsonStr);

          console.log('📊 [GeminiAI] Parsed JSON structure:', analysisData);

          // Extract clean response text with better fallback
          cleanResponseText =
            analysisData.response_text ||
            analysisData.responseText ||
            analysisData.analysis?.response_text ||
            analysisData.response;

          // If no clean text found in JSON, provide a default friendly message
          if (!cleanResponseText || cleanResponseText === content) {
            cleanResponseText =
              "I've analyzed your symptoms and I'm here to help you understand your condition better.";
          }

          // Extract urgency
          if (analysisData.analysis?.urgency_level) {
            urgency = analysisData.analysis.urgency_level;
          }

          // Extract recommended action
          if (analysisData.analysis?.recommended_action) {
            const action = analysisData.analysis.recommended_action;
            switch (action) {
              case 'emergency':
                status = 'emergency';
                break;
              case 'pharmacy_drugs':
                status = 'pharmacy_recommended';
                break;
              case 'see_doctor':
                status = 'doctor_advised';
                break;
              default:
                status = 'follow_up_needed';
            }
          }

          // Extract follow-up questions
          if (
            analysisData.follow_up_questions &&
            Array.isArray(analysisData.follow_up_questions)
          ) {
            followUpQuestions = analysisData.follow_up_questions;
          }

          console.log('✅ [GeminiAI] Successfully parsed JSON:', {
            cleanText: cleanResponseText.substring(0, 100) + '...',
            urgency,
            status,
            questionCount: followUpQuestions.length,
          });
        }
      } catch (error) {
        console.error(
          '❌ [GeminiAI] Failed to parse JSON, using fallback:',
          error
        );
        // Don't show raw JSON content to users - provide a friendly message
        cleanResponseText =
          "I've analyzed your symptoms. Let me help you understand your condition better.";

        // Use text-based analysis
        const contentLower = content.toLowerCase();

        if (
          contentLower.includes('emergency') ||
          contentLower.includes('urgent') ||
          contentLower.includes('immediately')
        ) {
          urgency = 'high';
        } else if (
          contentLower.includes('soon') ||
          contentLower.includes('recommend') ||
          contentLower.includes('consult')
        ) {
          urgency = 'medium';
        }

        if (
          contentLower.includes('emergency') ||
          contentLower.includes('112') ||
          contentLower.includes('call')
        ) {
          status = 'emergency';
        } else if (
          contentLower.includes('pharmacy') ||
          contentLower.includes('over-the-counter') ||
          contentLower.includes('medication')
        ) {
          status = 'pharmacy_recommended';
        } else if (
          contentLower.includes('doctor') ||
          contentLower.includes('physician') ||
          contentLower.includes('medical')
        ) {
          status = 'doctor_advised';
        }
      }
    }

    // Generate follow-up questions if none found in JSON
    if (followUpQuestions.length === 0) {
      followUpQuestions = this.generateFollowUpQuestions(content);
    }

    return {
      intent: this.getIntentFromStatus(status),
      urgency,
      diagnosis: {
        status,
        confidence: 0.8,
        followUpQuestions,
      },
      responseText: cleanResponseText,
      followUpQuestions,
      metadata: {
        processingTime: 0,
        confidence: 0.8,
        timestamp: new Date(),
        apiVersion: 'v1beta',
        languageProcessed: 'en',
      },
    };
  }

  /**
   * Get intent from diagnosis status
   */
  private getIntentFromStatus(
    status: DiagnosisResult['status']
  ): AIAnalysis['intent'] {
    switch (status) {
      case 'emergency':
        return 'emergency';
      case 'pharmacy_recommended':
        return 'symptom_diagnosis';
      case 'doctor_advised':
        return 'general_health';
      default:
        return 'follow_up';
    }
  }

  /**
   * Generate follow-up questions from content
   */
  private generateFollowUpQuestions(content: string): string[] {
    const questions: string[] = [];

    if (content.toLowerCase().includes('pain')) {
      questions.push('On a scale of 1-10, how would you rate your pain level?');
    }
    if (content.toLowerCase().includes('duration')) {
      questions.push('How long have you been experiencing these symptoms?');
    }
    if (questions.length === 0) {
      questions.push('Are you experiencing any other symptoms?');
      questions.push('Have you tried any treatments already?');
    }

    return questions;
  }

  /**
   * Builds prompt for Gemini API
   */
  private buildPrompt(symptoms: string, conversationHistory: string[]): string {
    const history =
      conversationHistory.length > 0
        ? `Previous conversation: ${conversationHistory.slice(-3).join('\n')}\n`
        : '';

    return `You are a medical AI assistant helping travelers in Poland with initial health assessments. 

CONTEXT:
- User is currently experiencing: ${symptoms}
- ${history}
- Language: English
- Location: Poland

TASK:
Analyze the symptoms and provide:
1. Urgency level (low/medium/high)
2. Recommended action (ask_follow_up/pharmacy_drugs/see_doctor/emergency)
3. Follow-up questions if needed
4. Pharmacy recommendations if appropriate
5. Clear, reassuring response text

RESPONSE FORMAT:
Return analysis with intent, urgency, diagnosis details, response text, and follow-up questions.`;
  }
}
