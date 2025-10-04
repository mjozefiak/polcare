import { DiagnosisResult } from './diagnosis-result.model';

export interface AIAnalysis {
  intent: 'symptom_diagnosis' | 'emergency' | 'general_health' | 'follow_up';
  urgency: 'low' | 'medium' | 'high';
  diagnosis: DiagnosisResult;
  responseText: string;
  followUpQuestions?: string[];
  metadata: AnalysisMetadata;
}

export interface AnalysisMetadata {
  processingTime: number;
  confidence: number;
  timestamp: Date;
  apiVersion: string;
  languageProcessed: 'en' | 'pl';
}

export interface GeminiRequest {
  prompt: string;
  context: {
    conversation_history: string[];
    current_symptoms: string[];
    user_location?: string;
  };
  language: 'en' | 'pl';
}

export interface GeminiResponse {
  analysis: {
    probable_diagnosis: string[];
    urgency_level: 'low' | 'medium' | 'high';
    recommended_action:
      | 'ask_follow_up'
      | 'pharmacy_drugs'
      | 'see_doctor'
      | 'emergency';
    confidence_score: number;
  };
  response_text: string;
  follow_up_questions?: string[];
  pharmacy_suggestions?: {
    pharmacy_names: string[];
    drug_suggestions: string[];
  };
}
