export type Lesson = {
  id: number;
  title: string;
};

export const courseLessons: Record<number, Lesson[]> = {
  1: [
    { id: 1, title: "Introduction to React" },
    { id: 2, title: "Setting Up React" },
    { id: 3, title: "JSX Basics" },
    { id: 4, title: "Components" },
    { id: 5, title: "Props" },
    { id: 6, title: "State" },
    { id: 7, title: "Event Handling" },
    { id: 8, title: "Conditional Rendering" },
    { id: 9, title: "Lists and Keys" },
    { id: 10, title: "Forms in React" },
    { id: 11, title: "React Hooks" },
    { id: 12, title: "Final React Project" },
  ],

  2: [
    { id: 1, title: "Introduction to TypeScript" },
    { id: 2, title: "Basic Types" },
    { id: 3, title: "Arrays and Tuples" },
    { id: 4, title: "Functions" },
    { id: 5, title: "Interfaces" },
    { id: 6, title: "Type Aliases" },
    { id: 7, title: "Generics" },
    { id: 8, title: "Classes" },
    { id: 9, title: "Modules" },
    { id: 10, title: "TypeScript Project" },
  ],

  3: [
    { id: 1, title: "Introduction to Prompt Engineering" },
    { id: 2, title: "Writing Clear Prompts" },
    { id: 3, title: "Prompt Structure" },
    { id: 4, title: "Adding Context" },
    { id: 5, title: "Using Examples" },
    { id: 6, title: "Role-Based Prompting" },
    { id: 7, title: "Advanced Prompting" },
    { id: 8, title: "Prompt Engineering Project" },
  ],

  4: [
    { id: 1, title: "Introduction to Machine Learning" },
    { id: 2, title: "Types of Machine Learning" },
    { id: 3, title: "Data Preprocessing" },
    { id: 4, title: "Training Data" },
    { id: 5, title: "Linear Regression" },
    { id: 6, title: "Classification" },
    { id: 7, title: "Decision Trees" },
    { id: 8, title: "Model Evaluation" },
    { id: 9, title: "Feature Engineering" },
    { id: 10, title: "Clustering" },
    { id: 11, title: "Neural Networks" },
    { id: 12, title: "Model Optimization" },
    { id: 13, title: "Machine Learning Workflow" },
    { id: 14, title: "Practical ML Project" },
    { id: 15, title: "Data Visualization" },
    { id: 16, title: "Model Deployment" },
    { id: 17, title: "ML Best Practices" },
    { id: 18, title: "Advanced Concepts" },
    { id: 19, title: "Final Project Preparation" },
    { id: 20, title: "Final Machine Learning Project" },
  ],
};