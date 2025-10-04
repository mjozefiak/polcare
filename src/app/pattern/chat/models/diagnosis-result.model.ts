export interface DiagnosisResult {
  status:
    | 'follow_up_needed'
    | 'pharmacy_recommended'
    | 'doctor_advised'
    | 'emergency';
  confidence: number;
  followUpQuestions?: string[];
  pharmacyRecommendations?: PharmacyRecommendation[];
  doctorAdvice?: DoctorAdvice;
  emergencyAdvice?: EmergencyAdvice;
}

export interface PharmacyRecommendation {
  pharmacyId: string;
  name: string;
  address: string;
  distance: number;
  recommendedDrugs: DrugRecommendation[];
}

export interface DrugRecommendation {
  drugName: string;
  description: string;
  dosage?: string;
  warnings?: string[];
  alternatives?: string[];
}

export interface DoctorAdvice {
  urgency: 'low' | 'medium' | 'high';
  reason: string;
  recommendations: string[];
  nextSteps: string[];
}

export interface EmergencyAdvice {
  urgentSymptoms: string[];
  immediateActions: string[];
  emergencyNumbers: string[];
  whenToSeekHelp: string;
}
