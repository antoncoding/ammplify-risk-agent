// Structured Agent Response System
// This defines the architecture for AI agents to return structured data with UI components

import { PoolData } from './ai';

// Base structure for all agent responses
export type AgentResponse = {
  text: string; // Main text response that's always shown
  uiComponents?: UIComponent[]; // Optional UI components for interaction
}

// Different types of UI components the agent can return
export type UIComponent = 
  | PoolRecommendationComponent 
  | ButtonListComponent 
  | GenericCardComponent;

// Pool recommendation specific component
export type PoolRecommendationComponent = {
  type: 'poolRecommendations';
  title?: string;
  description?: string;
  pools: {
    id: string; // Pool address
    rank: number; // 1 = most recommended
    reasoning: string; // Why this pool is recommended
    confidence: number; // 0-100 confidence score
    isRecommended?: boolean; // Explicit recommendation flag
  }[];
}

// Button list for quick actions
export type ButtonListComponent = {
  type: 'buttonList';
  title?: string;
  description?: string;
  buttons: {
    id: string;
    label: string;
    action: string; // The message to send when clicked
    variant?: 'primary' | 'secondary';
  }[];
}


// Generic card component for other use cases
export type GenericCardComponent = {
  type: 'cards';
  title?: string;
  description?: string;
  cards: {
    id: string;
    title: string;
    description?: string;
    action?: string; // Optional action message
    metadata?: Record<string, unknown>; // Flexible metadata
    variant?: 'primary' | 'secondary' | 'warning' | 'success';
  }[];
}

// Extended message type that includes structured responses
export type StructuredMessage = {
  id: string;
  content: string; // This will be the AgentResponse.text
  role: 'user' | 'assistant';
  timestamp: Date;
  structuredResponse?: AgentResponse; // The full structured response
  // Legacy support
  poolRanking?: PoolData[];
  toolResults?: unknown;
}

// Agent context for different types of interactions
export type AgentContext = 'pool-selection' | 'range-analysis' | 'general';

// Response from agent API endpoints
export type AgentAPIResponse = {
  response: string; // Text response
  structuredData?: AgentResponse; // New structured format
  // Legacy fields for backward compatibility
  toolCalls?: unknown[];
  role?: string;
}