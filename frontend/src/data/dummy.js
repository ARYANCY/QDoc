/**
 * dummy.js — Clinical data for patient profile, vitals, scan history, and medications.
 */

export const PATIENT = {
  id: "PAT-2026-8821",
  name: "Alexander Reed",
  age: 48,
  gender: "Male",
  dob: "1978-06-14",
  bloodGroup: "O+",
  height: "182 cm",
  weight: "78 kg",
  bmi: 23.5,
  phone: "+1 (555) 382-9102",
  email: "alexander.reed@healthnet.org",
  address: "San Francisco, CA, USA",
  emergencyContact: { name: "Elena Reed", relation: "Spouse", phone: "+1 (555) 382-9103" },
  doctor: { name: "Dr. Sarah Chen, MD", specialization: "Pulmonology & Dermatology", hospital: "Stanford Health Care" },
};

export const VITALS = [
  { label: "Heart Rate", value: 72, unit: "bpm", trend: "Normal / Stable" },
  { label: "Blood Pressure", value: "120/78", unit: "mmHg", trend: "Optimal" },
  { label: "SpO2 (Oxygen)", value: 98, unit: "%", trend: "Room Air" },
  { label: "Body Temp", value: 98.6, unit: "°F", trend: "Afebrile" },
];

export const RECENT_SCANS = [
  {
    id: "SCN-2026-0819",
    type: "Chest X-Ray (AP View)",
    model: "QuantumPneu (8-Qubit VQC)",
    date: "2026-08-19",
    result: "Normal Lungs",
    confidence: 0.964,
  },
  {
    id: "SCN-2026-0712",
    type: "Dermatoscopy (Left Forearm)",
    model: "QuantumDerma (10-Qubit VQC)",
    date: "2026-07-12",
    result: "Melanocytic Nevus (nv)",
    confidence: 0.892,
  },
  {
    id: "SCN-2026-0504",
    type: "Dermatoscopy (Upper Back)",
    model: "QuantumDerma (10-Qubit VQC)",
    date: "2026-05-04",
    result: "Benign Keratosis (bkl)",
    confidence: 0.915,
  },
];

export const MEDICATIONS = [
  { name: "Amoxicillin", dose: "500 mg", frequency: "Oral • 2x Daily", remainingDays: 4 },
  { name: "Cetirizine", dose: "10 mg", frequency: "Oral • 1x Nightly", remainingDays: 18 },
  { name: "Vitamin D3", dose: "2000 IU", frequency: "Oral • 1x Daily", remainingDays: 45 },
];
