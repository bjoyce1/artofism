// Normalize display labels only; manuscript paragraphs remain untouched.
export const codeTitle = (title: string) => title.toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase());