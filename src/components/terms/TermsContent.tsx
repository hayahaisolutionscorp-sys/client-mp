import { ContentItem } from "@/app/terms/terms.data"

interface TermsContentProps {
  content: string | ContentItem[]
}

export function TermsContent({ content }: TermsContentProps) {
  const renderContent = (content: string | ContentItem[]) => {
    if (typeof content === 'string') {
      return <div className="leading-relaxed whitespace-pre-line">{content}</div>
    }

    return content.map((item, index) => {
      switch (item.type) {
        case 'heading':
          return <h3 key={index} className="font-semibold mt-4 mb-1">{item.text}</h3>
        case 'paragraph':
          return <p key={index} className="leading-relaxed mb-4">{item.text}</p>
        default:
          return null
      }
    })
  }

  return (
    <div className="text-gray-600 leading-relaxed whitespace-pre-line">
      {renderContent(content)}
    </div>
  )
}
