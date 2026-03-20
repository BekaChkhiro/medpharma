import type { HTMLAttributes } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface VisuallyHiddenProps extends HTMLAttributes<HTMLSpanElement> {}

export function VisuallyHidden({ children, ...props }: VisuallyHiddenProps) {
  return (
    <span
      {...props}
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        borderWidth: 0,
        ...props.style,
      }}
    >
      {children}
    </span>
  );
}
