export interface BusinessData {
  name: string;
  offer: string;
  customer: string;
  price: string;
  goals: string[];
}

export interface Persona {
  id: string;
  name: string;
  demographics: string;
  painPoints: string;
  behaviors: string;
  buyingTriggers: string;
}

export interface JourneyItem {
  id: string;
  content: string;
  type: 'touchpoint' | 'emotion' | 'automation' | 'content' | 'risk';
}

export interface JourneyStage {
  id: string; // e.g., 'awareness'
  title: string;
  items: JourneyItem[];
}

export interface JourneyMap {
  stages: { [key: string]: JourneyStage };
  stageOrder: string[];
}

export interface OptimizationResult {
  bottlenecks: string[];
  quickWins: string[];
  automations: string[];
  agents: string[];
  contentGaps: string[];
}

export interface AIResponseJourneyStage {
  stage: string;
  goals: string[];
  customer_thoughts: string[];
  touchpoints: string[];
  automations: string[];
  content: string[];
  risks: string[];
  fixes: string[];
}

export interface AIResponseOptimization {
  bottlenecks: string[];
  quick_wins: string[];
  automation_opportunities: string[];
  ai_agents_to_build: string[];
  content_gaps: string[];
  funnel_ideas: string[];
}
