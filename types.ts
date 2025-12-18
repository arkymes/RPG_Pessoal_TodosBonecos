
export interface Chapter {
  id: string;
  number: string;
  title: string;
  content: string; // The full text block
  imagePrompt?: string; // Concept for the image placeholder
  // Added meta property to fix errors in constants.ts where STORY_DATA contains scene metadata
  meta?: {
    camera_angle?: string;
    lighting?: string;
    depth_of_field?: string;
    composition_rules?: string[];
  };
}

export interface NavItem {
  id: string;
  label: string;
}
