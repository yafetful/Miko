import ReactMarkdown from 'react-markdown';

interface MarkdownMessageProps {
  content: string;
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <ReactMarkdown
      components={{
        // 自定义图片渲染
        img: ({ node, ...props }) => (
          <img
            {...props}
            className="max-w-full h-auto rounded-lg my-2"
            loading="lazy"
          />
        ),
        // 自定义链接渲染
        a: ({ node, ...props }) => (
          <a
            {...props}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
