import TermsSidebar from '@/components/terms/TermsSidebar'
import { terms } from './terms.data'
import { TermsContent } from '@/components/terms/TermsContent'
import { getPageMetadata } from '@/services/content/seo.service';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageMetadata('terms');
  return {
    title: seo.title as any,
    description: seo.description,
  };
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br sm:px-4 md:px-8 lg:px-10 lg:pb-64">
      <div className="flex flex-col md:flex-row sm:pt-2 md:pt-4 lg:pt-6">
        {/* Sidebar */}
        <TermsSidebar />

        {/* Main Content */}
        <main className="flex-1 px-8">
          <h1 className="mb-8 text-3xl font-bold">Terms and Conditions</h1>
          {terms.map((section) => (
            <div
              key={section.id}
              id={section.id}
              className="mb-8"
            >
              <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
              <TermsContent content={section.content} />
            </div>
          ))}
        </main>
      </div>
    </div>
  )
}

