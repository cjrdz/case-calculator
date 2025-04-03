// src/types.ts
export interface Case {
    type: 'Follow-ups' | 'Strikes';
    day: string;
    severity: 'B' | 'C';
  }
  
  export interface CasesData {
    'Follow-ups': Record<string, Case>;
    'Strikes': Record<string, Case>;
  }
  
  export type WeekDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';