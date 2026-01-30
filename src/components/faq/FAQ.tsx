'use client';

import { useEffect, useState } from 'react';
import ContactSupportSection from './ContactSupportSection';
import FAQContent from './FAQContent';
import LoadingSpinner from './LoadingSpinner';
import { getFaqs } from '@/services';
import { categories, faqData } from '@/app/faq/faq.data';
import { IFaq } from '@/models';

interface FAQProps {
  themeColor: string;
}

export default function FAQ({ themeColor }: FAQProps) {
  const [faqs, setFaqs] = useState<IFaq[]>([]);
  const [faqCategories, setFaqCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      setIsLoading(true);

      try {
        const resFaqs = await getFaqs();

        if (resFaqs && resFaqs.length > 0) {
          const resCategories = Array.from(new Set(resFaqs.map((item) => item.category)));
          setFaqs(resFaqs);
          setFaqCategories(resCategories);
        } else {
          setFaqs([]);
          setFaqCategories([]);
        }
      } catch (error) {
        if (typeof window === 'undefined') {
          console.error('Error fetching FAQs:', error);
        }
        setFaqs([]);
        setFaqCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <FAQContent faqs={faqs} categories={faqCategories} themeColor={themeColor} />
      <ContactSupportSection />
    </>
  );
}
