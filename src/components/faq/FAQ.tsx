'use client';

import { useEffect, useState } from 'react';
import ContactSupportSection from './ContactSupportSection';
import FAQContent from './FAQContent';
import LoadingSpinner from './LoadingSpinner';
import { getFaqsByShippingLineId } from '@/services';
import { categories, faqData, FAQItem } from '@/app/faq/faq.data';

interface FAQProps {
  shippingLineId: string;
  themeColor: string;
}

export default function FAQ({ shippingLineId, themeColor }: FAQProps) {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [faqCategories, setFaqCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      setIsLoading(true);
      const parsedId = parseInt(shippingLineId, 10);
      if (isNaN(parsedId)) {
        console.error('Invalid shippingLineId:', shippingLineId);
        // Fallback to local data
        setFaqs(faqData);
        setFaqCategories(categories);
        setIsLoading(false);
        return;
      }

      try {
        const resFaqs = await getFaqsByShippingLineId(parsedId);

        if (resFaqs && resFaqs.length > 0) {
          const resCategories = Array.from(new Set(resFaqs.map((item) => item.category)));
          setFaqs(resFaqs);
          setFaqCategories(resCategories);
        } else {
          setFaqs(faqData);
          setFaqCategories(categories);
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error);
        // Fallback to local data on error
        setFaqs(faqData);
        setFaqCategories(categories);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFaqs();
  }, [shippingLineId]);

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
