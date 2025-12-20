export interface MemoryLabel {
  id: string;
  name: string;
  category: string;
}

export const memoryLabels: MemoryLabel[] = [
  // Personal Background
  { id: "Personal_Background/Identity", name: "Identity", category: "Personal Background" },
  { id: "Personal_Background/Education", name: "Education", category: "Personal Background" },
  { id: "Personal_Background/Occupation", name: "Occupation", category: "Personal Background" },
  { id: "Personal_Background/Location", name: "Location", category: "Personal Background" },
  
  // States & Experiences
  { id: "States_Experiences/Physical_State", name: "Physical State", category: "States & Experiences" },
  { id: "States_Experiences/Mental_State", name: "Mental State", category: "States & Experiences" },
  { id: "States_Experiences/Past_Experience", name: "Past Experience", category: "States & Experiences" },
  
  // Possessions
  { id: "Possessions/Important_Items", name: "Important Items", category: "Possessions" },
  { id: "Possessions/Pet", name: "Pet", category: "Possessions" },
  { id: "Possessions/House", name: "House", category: "Possessions" },
  { id: "Possessions/Car", name: "Car", category: "Possessions" },
  
  // Preferences
  { id: "Preferences/Food", name: "Food", category: "Preferences" },
  { id: "Preferences/Entertainment", name: "Entertainment", category: "Preferences" },
  { id: "Preferences/Sports", name: "Sports", category: "Preferences" },
  { id: "Preferences/Reading", name: "Reading", category: "Preferences" },
  { id: "Preferences/Music", name: "Music", category: "Preferences" },
  { id: "Preferences/Travel_Mode", name: "Travel Mode", category: "Preferences" },
  { id: "Preferences/Shopping", name: "Shopping", category: "Preferences" },
  
  // Thoughts
  { id: "Thoughts/Opinions/Positive", name: "Positive Opinion", category: "Thoughts" },
  { id: "Thoughts/Opinions/Negative", name: "Negative Opinion", category: "Thoughts" },
  { id: "Thoughts/Curiosity", name: "Curiosity", category: "Thoughts" },
  { id: "Thoughts/Goals/Short_Term", name: "Short-term Goal", category: "Thoughts" },
  { id: "Thoughts/Goals/Long_Term", name: "Long-term Goal", category: "Thoughts" },
  
  // Plans
  { id: "Plans/Schedule", name: "Schedule", category: "Plans" },
  { id: "Plans/Commitments", name: "Commitments", category: "Plans" },
];

export const memoryCategories = Array.from(
  new Set(memoryLabels.map(label => label.category))
);

export const getLabelsByCategory = (category: string): MemoryLabel[] => {
  return memoryLabels.filter(label => label.category === category);
};
