export interface Chapter {
  id: string;
  number: string;
  title: string;
  content: string; // The full text block
  imagePrompt?: string; // Concept for the image placeholder
}

export interface NavItem {
  id: string;
  label: string;
}