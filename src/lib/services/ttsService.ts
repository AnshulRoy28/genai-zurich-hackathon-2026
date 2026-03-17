// AWS Polly TTS service for patient briefings
// Following coding standards: explicit types, error handling

import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import type { Patient } from '@/types';

/**
 * Generate patient briefing text from patient data
 */
export function generateBriefingText(patient: Patient): string {
  const parts: string[] = [];

  // Basic info
  parts.push(`Emergency briefing. Patient is ${patient.age} years old, ${patient.gender}.`);
  parts.push(`Blood type: ${patient.bloodType}.`);

  // Location
  parts.push(`Location: ${patient.location.street}, ${patient.location.city}.`);
  if (patient.location.floor) {
    parts.push(`Floor ${patient.location.floor}.`);
  }
  if (patient.location.apartment) {
    parts.push(`Apartment ${patient.location.apartment}.`);
  }

  // Critical allergies
  if (patient.allergies.length > 0) {
    parts.push(`Critical allergies: ${patient.allergies.join(', ')}.`);
  } else {
    parts.push('No known allergies.');
  }

  // Current medications
  if (patient.medications.length > 0) {
    parts.push(`Current medications: ${patient.medications.join('. ')}.`);
  }

  // Medical history
  if (patient.conditions.length > 0) {
    parts.push(`Medical history: ${patient.conditions.join('. ')}.`);
  }

  // Emergency contacts
  if (patient.emergencyContacts.length > 0) {
    const primaryContact = patient.emergencyContacts[0];
    parts.push(`Emergency contact: ${primaryContact.name}, ${primaryContact.relationship}.`);
  }

  parts.push('Proceed with caution. Good luck.');

  return parts.join(' ');
}

/**
 * Generate audio briefing using AWS Polly
 */
export async function generateAudioBriefing(patient: Patient): Promise<string> {
  const region = import.meta.env.VITE_AWS_REGION || 'us-east-1';
  const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
  const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
  const voiceId = import.meta.env.VITE_AWS_POLLY_VOICE_ID || 'Joanna';
  const engine = import.meta.env.VITE_AWS_POLLY_ENGINE || 'neural';

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('AWS credentials not configured. Check .env file for VITE_AWS_ACCESS_KEY_ID and VITE_AWS_SECRET_ACCESS_KEY');
  }

  try {
    const client = new PollyClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const text = generateBriefingText(patient);

    const command = new SynthesizeSpeechCommand({
      Text: text,
      OutputFormat: 'mp3',
      VoiceId: voiceId,
      Engine: engine,
    });

    const response = await client.send(command);

    if (!response.AudioStream) {
      throw new Error('No audio stream received from Polly');
    }

    // Convert stream to blob URL
    const audioBlob = await streamToBlob(response.AudioStream);
    const audioUrl = URL.createObjectURL(audioBlob);

    return audioUrl;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`AWS Polly error: ${error.message}`);
    }
    throw new Error('Failed to generate audio briefing');
  }
}

/**
 * Convert ReadableStream to Blob
 */
async function streamToBlob(stream: ReadableStream<Uint8Array> | Blob): Promise<Blob> {
  if (stream instanceof Blob) {
    return stream;
  }

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  return new Blob(chunks, { type: 'audio/mpeg' });
}

/**
 * Play audio briefing
 */
export function playAudioBriefing(audioUrl: string): HTMLAudioElement {
  const audio = new Audio(audioUrl);
  audio.play().catch((error: unknown) => {
    if (error instanceof Error) {
      throw new Error(`Failed to play audio: ${error.message}`);
    }
  });
  return audio;
}
