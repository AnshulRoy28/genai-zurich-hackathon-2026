// Mock data generation for simulation
// Following coding standards: explicit types, immutable patterns

import type { Responder, Patient, ResponderStatus } from "@/types";

// Zurich city center coordinates
const ZURICH_CENTER = { lat: 47.3769, lng: 8.5417 };

// Swiss first names and last names
const FIRST_NAMES = [
  "Hans",
  "Peter",
  "Anna",
  "Maria",
  "Thomas",
  "Sarah",
  "Michael",
  "Julia",
  "Daniel",
  "Laura",
  "Stefan",
  "Sophie",
  "Martin",
  "Emma",
  "Christian",
  "Lisa",
];

const LAST_NAMES = [
  "Müller",
  "Meier",
  "Schmid",
  "Keller",
  "Weber",
  "Huber",
  "Schneider",
  "Meyer",
  "Steiner",
  "Fischer",
  "Gerber",
  "Brunner",
  "Baumann",
  "Frei",
  "Zimmermann",
  "Moser",
];

/**
 * Generate random coordinate within radius of center point
 */
function generateRandomLocation(
  center: { lat: number; lng: number },
  radiusInMeters: number,
): { lat: number; lng: number } {
  const radiusInDegrees = radiusInMeters / 111320;
  const u = Math.random();
  const v = Math.random();
  const w = radiusInDegrees * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);

  return {
    lat: center.lat + y,
    lng: center.lng + x / Math.cos((center.lat * Math.PI) / 180),
  };
}

/**
 * Generate random Swiss name
 */
function generateName(): string {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${firstName} ${lastName}`;
}

/**
 * Generate mock responders distributed around Zurich
 */
export function generateMockResponders(count: number): Responder[] {
  const responders: Responder[] = [];

  for (let i = 0; i < count; i++) {
    const status: ResponderStatus = Math.random() > 0.2 ? "available" : "busy";

    responders.push({
      id: `responder-${i + 1}`,
      name: generateName(),
      certification: "first_responder",
      location: generateRandomLocation(ZURICH_CENTER, 2000), // 2km radius
      status,
      responseHistory: {
        totalResponses: Math.floor(Math.random() * 50),
        avgResponseTime: 180 + Math.random() * 120, // 3-5 minutes
        successRate: 0.85 + Math.random() * 0.15, // 85-100%
      },
    });
  }

  return responders;
}

/**
 * Mock patient profiles with detailed medical histories
 */
export const mockPatients: Patient[] = [
  {
    id: "patient-001",
    age: 68,
    gender: "male",
    bloodType: "A+",
    allergies: ["Penicillin", "Shellfish"],
    medications: [
      "Aspirin 100mg daily",
      "Metoprolol 50mg twice daily",
      "Atorvastatin 20mg evening",
    ],
    conditions: [
      "Hypertension",
      "Type 2 Diabetes",
      "Previous MI (2019)",
      "Atrial Fibrillation",
    ],
    emergencyContacts: [
      { name: "Maria Schmidt", phone: "+41 79 123 4567", relationship: "Wife" },
      {
        name: "Dr. Hans Weber",
        phone: "+41 44 123 4567",
        relationship: "Cardiologist",
      },
    ],
    location: {
      lat: 47.3769,
      lng: 8.5417,
      street: "Bahnhofstrasse 45",
      city: "Zürich",
      postalCode: "8001",
      floor: "3",
      apartment: "B",
    },
  },
  {
    id: "patient-002",
    age: 34,
    gender: "female",
    bloodType: "O-",
    allergies: ["Latex", "Ibuprofen"],
    medications: ["Levothyroxine 75mcg morning", "Oral contraceptive"],
    conditions: ["Hypothyroidism", "Asthma (mild)"],
    emergencyContacts: [
      {
        name: "Thomas Müller",
        phone: "+41 79 234 5678",
        relationship: "Husband",
      },
      { name: "Anna Müller", phone: "+41 79 345 6789", relationship: "Mother" },
    ],
    location: {
      lat: 47.3655,
      lng: 8.5458,
      street: "Seestrasse 120",
      city: "Zürich",
      postalCode: "8002",
      floor: "2",
    },
  },
  {
    id: "patient-003",
    age: 82,
    gender: "female",
    bloodType: "B+",
    allergies: ["Sulfa drugs"],
    medications: [
      "Warfarin 5mg daily",
      "Furosemide 40mg morning",
      "Digoxin 0.125mg daily",
      "Potassium supplement",
    ],
    conditions: [
      "Congestive Heart Failure",
      "Atrial Fibrillation",
      "Chronic Kidney Disease Stage 3",
      "Osteoporosis",
    ],
    emergencyContacts: [
      {
        name: "Sophie Fischer",
        phone: "+41 79 456 7890",
        relationship: "Daughter",
      },
      {
        name: "Pflegeheim Sonnenhof",
        phone: "+41 44 234 5678",
        relationship: "Care Facility",
      },
    ],
    location: {
      lat: 47.3747,
      lng: 8.5494,
      street: "Universitätstrasse 88",
      city: "Zürich",
      postalCode: "8006",
      floor: "1",
      apartment: "A",
    },
  },
  {
    id: "patient-004",
    age: 45,
    gender: "male",
    bloodType: "AB+",
    allergies: ["None known"],
    medications: [
      "Insulin Glargine 24 units bedtime",
      "Metformin 1000mg twice daily",
    ],
    conditions: ["Type 1 Diabetes", "Diabetic Neuropathy", "Retinopathy"],
    emergencyContacts: [
      {
        name: "Lisa Keller",
        phone: "+41 79 567 8901",
        relationship: "Partner",
      },
      {
        name: "Dr. Stefan Meier",
        phone: "+41 44 345 6789",
        relationship: "Endocrinologist",
      },
    ],
    location: {
      lat: 47.3686,
      lng: 8.5391,
      street: "Limmatquai 34",
      city: "Zürich",
      postalCode: "8001",
      floor: "4",
    },
  },
  {
    id: "patient-005",
    age: 56,
    gender: "male",
    bloodType: "O+",
    allergies: ["Codeine", "Morphine"],
    medications: [
      "Clopidogrel 75mg daily",
      "Ramipril 10mg daily",
      "Rosuvastatin 40mg evening",
      "Nitroglycerin spray PRN",
    ],
    conditions: [
      "Coronary Artery Disease",
      "Previous CABG (2021)",
      "Hyperlipidemia",
      "Obesity (BMI 32)",
    ],
    emergencyContacts: [
      {
        name: "Sandra Zimmermann",
        phone: "+41 79 678 9012",
        relationship: "Wife",
      },
      {
        name: "Dr. Peter Huber",
        phone: "+41 44 456 7890",
        relationship: "Cardiac Surgeon",
      },
    ],
    location: {
      lat: 47.3812,
      lng: 8.545,
      street: "Rämistrasse 71",
      city: "Zürich",
      postalCode: "8001",
      floor: "2",
      apartment: "C",
    },
  },
  {
    id: "patient-006",
    age: 29,
    gender: "female",
    bloodType: "A-",
    allergies: ["Peanuts", "Tree nuts", "Bee stings"],
    medications: ["EpiPen (carries 2)", "Cetirizine 10mg daily"],
    conditions: ["Severe food allergies", "Anaphylaxis history (2023)"],
    emergencyContacts: [
      {
        name: "Michael Berg",
        phone: "+41 79 789 0123",
        relationship: "Boyfriend",
      },
      {
        name: "Dr. Julia Schneider",
        phone: "+41 44 567 8901",
        relationship: "Allergist",
      },
    ],
    location: {
      lat: 47.372,
      lng: 8.538,
      street: "Niederdorfstrasse 15",
      city: "Zürich",
      postalCode: "8001",
      floor: "3",
    },
  },
  {
    id: "patient-007",
    age: 71,
    gender: "male",
    bloodType: "B-",
    allergies: ["Contrast dye"],
    medications: [
      "Levodopa/Carbidopa 25/100mg 4x daily",
      "Pramipexole 1mg three times daily",
      "Rivastigmine patch 9.5mg daily",
    ],
    conditions: [
      "Parkinson's Disease",
      "Mild Cognitive Impairment",
      "Postural Hypotension",
    ],
    emergencyContacts: [
      {
        name: "Claudia Steiner",
        phone: "+41 79 890 1234",
        relationship: "Daughter",
      },
      {
        name: "Spitex Zürich",
        phone: "+41 44 678 9012",
        relationship: "Home Care",
      },
    ],
    location: {
      lat: 47.379,
      lng: 8.537,
      street: "Gloriastrasse 52",
      city: "Zürich",
      postalCode: "8006",
      floor: "1",
    },
  },
  {
    id: "patient-008",
    age: 19,
    gender: "male",
    bloodType: "O+",
    allergies: ["None known"],
    medications: [
      "Levetiracetam 1000mg twice daily",
      "Lamotrigine 200mg twice daily",
    ],
    conditions: [
      "Epilepsy (Generalized Tonic-Clonic)",
      "Last seizure 3 months ago",
    ],
    emergencyContacts: [
      { name: "Petra Vogel", phone: "+41 79 901 2345", relationship: "Mother" },
      {
        name: "Dr. Andreas Bauer",
        phone: "+41 44 789 0123",
        relationship: "Neurologist",
      },
    ],
    location: {
      lat: 47.3665,
      lng: 8.551,
      street: "Bellerivestrasse 201",
      city: "Zürich",
      postalCode: "8008",
      floor: "5",
      apartment: "D",
    },
  },
  {
    id: "patient-009",
    age: 63,
    gender: "female",
    bloodType: "AB-",
    allergies: ["Aspirin", "NSAIDs"],
    medications: [
      "Prednisone 5mg daily",
      "Methotrexate 15mg weekly",
      "Folic acid 5mg daily",
      "Omeprazole 20mg daily",
    ],
    conditions: [
      "Rheumatoid Arthritis",
      "Osteoporosis",
      "GERD",
      "Immunosuppressed",
    ],
    emergencyContacts: [
      {
        name: "Robert Lang",
        phone: "+41 79 012 3456",
        relationship: "Husband",
      },
      {
        name: "Dr. Monika Graf",
        phone: "+41 44 890 1234",
        relationship: "Rheumatologist",
      },
    ],
    location: {
      lat: 47.383,
      lng: 8.548,
      street: "Schaffhauserstrasse 99",
      city: "Zürich",
      postalCode: "8057",
      floor: "2",
    },
  },
  {
    id: "patient-010",
    age: 52,
    gender: "male",
    bloodType: "A+",
    allergies: ["Shellfish", "Iodine"],
    medications: [
      "Albuterol inhaler PRN",
      "Fluticasone/Salmeterol inhaler twice daily",
      "Montelukast 10mg evening",
    ],
    conditions: [
      "Severe Asthma",
      "COPD (early stage)",
      "Previous pneumothorax (2020)",
    ],
    emergencyContacts: [
      { name: "Nina Hofmann", phone: "+41 79 123 4568", relationship: "Wife" },
      {
        name: "Dr. Christian Wyss",
        phone: "+41 44 901 2345",
        relationship: "Pulmonologist",
      },
    ],
    location: {
      lat: 47.37,
      lng: 8.53,
      street: "Langstrasse 145",
      city: "Zürich",
      postalCode: "8004",
      floor: "3",
      apartment: "B",
    },
  },
];

// Export singleton instances
export const mockResponders = generateMockResponders(75);
