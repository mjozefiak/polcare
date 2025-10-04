import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppointmentService, Doctor, AppointmentForm, Language } from './appointment.service';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appointment.html',
  styleUrl: './appointment.scss',
  providers: [AppointmentService]
})
export class Appointment implements OnInit {
  currentStep = 1;
  totalSteps = 3;
  appointmentForm: FormGroup;
  doctors: Doctor[] = [];
  selectedDoctor: Doctor | null = null;
  availableDates: Date[] = [];
  availableLanguages: Language[] = [];
  insuranceTypes: string[] = [];
  isNonPolish = false;
  loading = false; // Set to false by default
  loadingLanguages = false;
  loadingInsurance = false;
  submitting = false;
  success = false;
  error: string | null = null;

  // List of common nationalities in Europe and the region
  nationalities = [
    'Ukrainian', 'German', 'British', 'French', 'Spanish',
    'Italian', 'Russian', 'Belarusian', 'Lithuanian', 'Czech',
    'Slovak', 'Romanian', 'Bulgarian', 'Hungarian', 'Swedish',
    'Norwegian', 'Danish', 'Finnish', 'Dutch', 'Belgian',
    'American', 'Canadian', 'Other'
  ];

  get formattedDate(): string {
    if (!this.appointmentForm.get('date')?.value) return '';
    const date = new Date(this.appointmentForm.get('date')?.value);
    return date.toLocaleString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private router: Router
  ) {
    this.appointmentForm = this.fb.group({
      doctorId: [null, Validators.required],
      date: [null, Validators.required],
      patientName: ['', [Validators.required, Validators.minLength(3)]],
      patientEmail: ['', [Validators.required, Validators.email]],
      patientPhone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{9,12}$/)]],
      isNonPolish: [false],
      foreignerId: [''],
      nationality: [''],
      preferredLanguage: [''],
      interpreter: [false],
      insuranceType: ['', Validators.required],
      notes: ['']
    });

    // Reaction to changes in the isNonPolish field
    this.appointmentForm.get('isNonPolish')?.valueChanges.subscribe(value => {
      this.isNonPolish = value;
      if (value) {
        // Add validators for foreigner fields
        this.appointmentForm.get('foreignerId')?.setValidators([Validators.required]);
        this.appointmentForm.get('nationality')?.setValidators([Validators.required]);
        this.appointmentForm.get('preferredLanguage')?.setValidators([Validators.required]);
      } else {
        // Remove validators for foreigner fields
        this.appointmentForm.get('foreignerId')?.clearValidators();
        this.appointmentForm.get('nationality')?.clearValidators();
        this.appointmentForm.get('preferredLanguage')?.clearValidators();
        // Reset fields
        this.appointmentForm.patchValue({
          foreignerId: '',
          nationality: '',
          preferredLanguage: '',
          interpreter: false
        });
      }

      // Update validation status
      this.appointmentForm.get('foreignerId')?.updateValueAndValidity();
      this.appointmentForm.get('nationality')?.updateValueAndValidity();
      this.appointmentForm.get('preferredLanguage')?.updateValueAndValidity();
    });

    // Immediately set the mock data instead of loading it from the service
    this.doctors = this.appointmentService.getDoctorsSync();
    this.availableLanguages = [{ code: 'en', name: 'English' }];
    this.insuranceTypes = this.appointmentService.getInsuranceTypesSync();
  }

  ngOnInit(): void {
    // No loading needed - data is already set in the constructor
  }

  selectDoctor(doctorId: number): void {
    this.selectedDoctor = this.doctors.find(d => d.id === doctorId) || null;
    if (this.selectedDoctor) {
      this.appointmentForm.patchValue({ doctorId: this.selectedDoctor.id });
      this.availableDates = [...this.selectedDoctor.availableDates];
      this.goToNextStep();
    }
  }

  selectDate(date: Date): void {
    this.appointmentForm.patchValue({ date });
    this.goToNextStep();
  }

  goToNextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      window.scrollTo(0, 0);
    }
  }

  goToPreviousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo(0, 0);
    }
  }

  submitForm(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formData: AppointmentForm = this.appointmentForm.value;

    this.appointmentService.createAppointment(formData)
      .pipe(finalize(() => this.submitting = false))
      .subscribe({
        next: (appointment) => {
          this.success = true;
          setTimeout(() => {
            this.router.navigate(['/pharmacies']);
          }, 5000);
        },
        error: (err) => {
          this.error = 'Failed to book an appointment. Please try again later.';
          console.error('Error booking appointment:', err);
        }
      });
  }

  // Helper to check if doctor speaks specific language
  doctorSpeaks(doctor: Doctor, langCode: string): boolean {
    return doctor.languages.some(lang => lang.code === langCode);
  }
}
