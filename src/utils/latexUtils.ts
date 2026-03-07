/**
 * Utility functions for rendering LaTeX in the SAT test-taking system
 */

/**
 * Processes a text string and formats LaTeX expressions 
 * properly for MathJax rendering
 * 
 * @param text The text to process for LaTeX expressions
 * @returns Text with properly formatted LaTeX
 */
export const processLatexInText = (text: string): string => {
  if (!text) return '';
  
  // Pattern to match LaTeX expressions inside backticks
  // For example: `7/2` should be converted to \(\frac{7}{2}\)
  const latexPattern = /`([^`]+)`/g;
  
  // Replace backtick-enclosed expressions with proper LaTeX delimiters
  return text.replace(latexPattern, (match, latexContent) => {
    // Check if the content already has LaTeX commands
    if (latexContent.includes('\\')) {
      // Already has LaTeX commands, just wrap in delimiters
      return `\\(${latexContent}\\)`;
    }
    
    // Convert simple fraction expressions (e.g. 7/2) to LaTeX fractions
    if (latexContent.includes('/')) {
      const [numerator, denominator] = latexContent.split('/');
      if (numerator && denominator) {
        return `\\(\\frac{${numerator.trim()}}{${denominator.trim()}}\\)`;
      }
    }
    
    // For other expressions, just wrap in delimiters
    return `\\(${latexContent}\\)`;
  });
};

/**
 * Refreshes MathJax rendering for a specific DOM element
 * 
 * @param element The DOM element to refresh MathJax rendering for
 */
export const refreshMathJax = (element: HTMLElement | null): void => {
  if (window?.MathJax && window.MathJax.typesetPromise && element) {
    window.MathJax.typesetPromise([element]).catch(err => {
      console.error('MathJax typesetting failed:', err);
    });
  }
};
