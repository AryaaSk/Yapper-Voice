export interface AgentConfig {
  assistantId: string;
  name: string;
  description: string;
  costPerMinutePence: number; // pence, e.g. 15 = £0.15/min
}

// Add your Vapi assistants here
export const agents: AgentConfig[] = [
  {
    assistantId: "2dc4c851-ed75-476c-ad8b-3ba86b759d26",
    name: "Smart Friend",
    description: "Your always-available friend for brainstorming and chatting",
    costPerMinutePence: 15, // £0.15/min
  },
  {
    assistantId: "b2f75d48-8fd2-4cc5-ab02-76f2146af369",
    name: "Supportive Friend Therapist",
    description: "Your always-available friend for therapy and support",
    costPerMinutePence: 15, // £0.15/min
  },
];

// Minimum balance (in pence) to start a call
export const MIN_BALANCE_TO_CALL = 50; // £0.50

export function getAgent(assistantId: string): AgentConfig | undefined {
  return agents.find((a) => a.assistantId === assistantId);
}
