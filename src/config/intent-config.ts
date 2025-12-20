export interface IntentSubtype {
  id: string;
  name: string;
}

export interface IntentCategory {
  id: string;
  name: string;
  color: string;
  textColor: string;
  subtypes: IntentSubtype[];
}

const intentTaxonomy: IntentCategory[] = [
  {
    id: "informational",
    name: "Informational Intent",
    color: "rgba(219, 234, 254, 0.5)",
    textColor: "rgb(29, 78, 216)",
    subtypes: [
      { id: "factual_queries", name: "Factual Queries" },
      { id: "explanatory_inquiries", name: "Explanatory Inquiries" },
      { id: "tutorial_requests", name: "Tutorial Requests" },
    ],
  },
  {
    id: "problem_solving",
    name: "Problem-Solving Intent",
    color: "rgba(254, 243, 199, 0.5)",
    textColor: "rgb(180, 83, 9)",
    subtypes: [
      { id: "troubleshooting", name: "Troubleshooting Assistance" },
      { id: "decision_support", name: "Decision Support" },
      { id: "planning_organization", name: "Planning and Organization" },
    ],
  },
  {
    id: "creative",
    name: "Creative Intent",
    color: "rgba(252, 231, 243, 0.5)",
    textColor: "rgb(190, 24, 93)",
    subtypes: [
      { id: "idea_generation", name: "Idea Generation" },
      { id: "content_creation", name: "Content Creation" },
      { id: "artistic_exploration", name: "Artistic Exploration" },
    ],
  },
  {
    id: "educational",
    name: "Educational Intent",
    color: "rgba(220, 252, 231, 0.5)",
    textColor: "rgb(22, 101, 52)",
    subtypes: [
      { id: "learning_support", name: "Learning Support" },
      { id: "skill_development", name: "Skill Development" },
      { id: "curricular_planning", name: "Curricular Planning" },
    ],
  },
  {
    id: "personal_interaction",
    name: "Personal Interaction Intent",
    color: "rgba(238, 232, 213, 0.5)",
    textColor: "rgb(120, 53, 15)",
    subtypes: [
      { id: "conversational_engagement", name: "Conversational Engagement" },
      { id: "personal_advice", name: "Personal Advice" },
      { id: "reflection_insight", name: "Reflection and Insight" },
    ],
  },
  {
    id: "technical_professional",
    name: "Technical and Professional Intent",
    color: "rgba(224, 231, 255, 0.5)",
    textColor: "rgb(67, 56, 202)",
    subtypes: [
      { id: "technical_guidance", name: "Technical Guidance" },
      { id: "business_career", name: "Business and Career Advice" },
      { id: "industry_specific", name: "Industry-Specific Inquiries" },
    ],
  },
  {
    id: "transactional",
    name: "Transactional Intent",
    color: "rgba(243, 232, 255, 0.5)",
    textColor: "rgb(107, 33, 168)",
    subtypes: [
      { id: "service_utilization", name: "Service Utilization" },
      { id: "data_processing", name: "Data Processing" },
      { id: "task_automation", name: "Task Automation" },
    ],
  },
  {
    id: "ethical_philosophical",
    name: "Ethical and Philosophical Intent",
    color: "rgba(254, 226, 226, 0.5)",
    textColor: "rgb(153, 27, 27)",
    subtypes: [
      { id: "moral_ethical", name: "Moral and Ethical Queries" },
      { id: "societal_cultural", name: "Societal and Cultural Inquiry" },
      { id: "existential", name: "Existential Questions" },
    ],
  },
];

export default intentTaxonomy;
