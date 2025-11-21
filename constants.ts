import { JourneyMap } from './types';

export const INITIAL_STAGES = [
  'Awareness',
  'Interest',
  'Consideration',
  'Conversion',
  'Purchase',
  'Delivery',
  'Retention',
  'Referral'
];

export const DEFAULT_BUSINESS_DATA = {
  name: '',
  offer: '',
  customer: '',
  price: '',
  goals: []
};

export const EMPTY_JOURNEY: JourneyMap = {
  stages: INITIAL_STAGES.reduce((acc, stage) => {
    const id = stage.toLowerCase();
    acc[id] = {
      id,
      title: stage,
      items: []
    };
    return acc;
  }, {} as { [key: string]: any }),
  stageOrder: INITIAL_STAGES.map(s => s.toLowerCase())
};

export const ITEM_TYPE_COLORS = {
  touchpoint: 'bg-blue-500/20 border-blue-500/50 text-blue-200',
  emotion: 'bg-purple-500/20 border-purple-500/50 text-purple-200',
  automation: 'bg-amber-500/20 border-amber-500/50 text-amber-200',
  content: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200',
  risk: 'bg-red-500/20 border-red-500/50 text-red-200'
};

export const ITEM_TYPE_LABELS = {
  touchpoint: 'Touchpoint',
  emotion: 'Emotion',
  automation: 'Automation',
  content: 'Content',
  risk: 'Risk'
};
