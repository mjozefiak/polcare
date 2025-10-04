import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, UntypedFormGroup, Validators} from '@angular/forms';
import {InsuranceTypes} from './enums/insurance-types.enum';

@Component({
  selector: 'app-insurance',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './insurance.component.html',
  styleUrls: ['./insurance.component.scss'],
})
export class InsuranceComponent implements OnInit {
  insuranceForm!: UntypedFormGroup;
  insuranceTypes = InsuranceTypes;
  confirming = false;
  private readonly _fb = inject(FormBuilder);

  ngOnInit() {
    this.insuranceForm = this._fb.group({
      fullName: ['', Validators.required],
      dob: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      insuranceType: [null, Validators.required],
      coverageAmount: [null, [Validators.required, Validators.min(1)]],
      startDate: ['', Validators.required],
    });
  }

  selectInsuranceType(type: InsuranceTypes) {
    this.insuranceForm.get('insuranceType')?.setValue(type);
  }

  onSubmit() {
    if (this.insuranceForm.valid) {
      this.confirming = true;
    } else {
      this.insuranceForm.markAllAsTouched();
    }
  }

  cancelConfirm() {
    this.confirming = false;
  }

  confirmSubmit() {
    console.log('Form submitted:', this.insuranceForm.value);
  }
}
