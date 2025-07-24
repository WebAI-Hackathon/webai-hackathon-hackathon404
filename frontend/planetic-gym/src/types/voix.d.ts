declare namespace JSX {
  interface IntrinsicElements {
    'context': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      name?: string;
    }, HTMLElement>;
    
    'tool': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      name: string;
      description?: string;
      return?: boolean;
    }, HTMLElement>;

    'prop': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      name: string;
      type: string;
      required?: boolean;
      description?: string;
    }, HTMLElement>;

    'array': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {}, HTMLElement>;
    'dict': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {}, HTMLElement>;
  }
}
