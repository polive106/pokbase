import { config } from './config.js';
import { mockIngestModel, mockReaderModel } from './lib/mock-model.js';

/** The model for an agent role: the configured router id, or the scripted mock. */
export function modelFor(role: 'ingest' | 'reader'): any {
  if (config.model !== 'mock') return config.model;
  return role === 'ingest' ? mockIngestModel(config.mockStepDelayMs) : mockReaderModel();
}
