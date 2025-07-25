export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export const faqData: FAQItem[] = [
  // Booking and Reservation
  {
    category: 'Booking & Reservations',
    question: 'How do I book a trip?',
    answer:
      'Booking a trip is easy! Simply use our search box to enter your desired route, select your dates, and choose the number of passengers. Follow the prompts to complete your booking securely online.'
  },
  {
    category: 'Booking & Reservations',
    question: 'Where can I find my online ticket?',
    answer:
      'Your ticket will be sent to the email address you provided during booking. You can also access it by visiting Ayahay.com and navigating to the "My Bookings" section. Ensure you log in with the account you used for the booking.'
  },
  {
    category: 'Booking & Reservations',
    question: 'What payment methods do you accept?',
    answer:
      'We accept major credit/debit cards, e-wallets (G-CASH), and online bank transfers. All payments are processed securely through our payment gateway.'
  },
  {
    category: 'Booking & Reservations',
    question: 'Can I book vehicles such as cars, motorbikes, vans, or other rolling cargo?',
    answer:
      'Yes, vehicle bookings are available. Follow these steps:\n\n• Visit Ayahay.com, select your preferred date and schedule.\n• Check if vehicle slots are available for your chosen trip.\n• If slots are available, specify the number of vehicles you wish to bring, provide the driver\'s name, and click "Add Vehicle."\n• If no slots are available, contact our customer service via the number provided on our website for assistance.'
  },
  {
    category: 'Booking & Reservations',
    question: 'Can I book tickets for PWDs, seniors, or students?',
    answer:
      'Unfortunately, discounted rates for persons with disabilities (PWDs), senior citizens, and students are not currently available for online bookings through our partner shipping lines. For discounted tickets, please visit the ticketing office of the respective shipping line.'
  },
  {
    category: 'Booking & Reservations',
    question: 'Can I make an advance booking?',
    answer:
      'Yes, advance bookings are allowed for up to 2 months before your desired departure date. This ensures you secure your preferred schedule ahead of time.'
  },
  {
    category: 'Booking & Reservations',
    question: 'Are minors and infants free of charge?',
    answer:
      '• Infants aged 2 years and below are free of charge and do not require a ticket.\n• Children aged 3 to 11 years are eligible for child fares, which are generally lower than adult fares.'
  },
  {
    category: 'Booking & Reservations',
    question: 'Can I send cargo without a driver or passenger (loose cargo)?',
    answer:
      "Yes, loose cargoes can be sent. However, you will need to visit the shipping line's ticketing office at the port to arrange this."
  },
  {
    category: 'Booking & Reservations',
    question: 'How can I check the price of tickets for passengers and cargo?',
    answer:
      'To get a price estimate, visit our website and go through the booking process. You can view a quotation before completing the payment.'
  },

  // Travel Information
  {
    category: 'Travel Information',
    question: 'What is the boarding time cut-off?',
    answer:
      'Passengers are required to check in and board at least 2 hours before the scheduled departure time. Late arrivals may result in denied boarding.'
  },
  {
    category: 'Travel Information',
    question: 'How can I check for trip cancellations due to weather conditions?',
    answer:
      'Updates regarding cancellations will be posted on:\n\n• Ayahay.com under the notifications section.\n• The email address you provided during booking.\n• The official Facebook pages of Ayahay and the respective shipping line.'
  },

  // Safety and Security
  {
    category: 'Safety & Security',
    question: 'Can I travel with pets or animals?',
    answer:
      'Yes, but you will need to secure a shipping permit from the Philippine Bureau of Animal Industry (National Veterinary Quarantine Services Division). Please visit their website NVQSD for more details.'
  },
  {
    category: 'Safety & Security',
    question: 'Can I travel with hazardous materials?',
    answer:
      'No. Hazardous materials are strictly prohibited on board. For more information, refer to the "Guidelines and Policies" section on our website.'
  },

  // Schedule and Routes
  {
    category: 'Schedule & Routes',
    question: 'Where can I find the schedule and available routes?',
    answer:
      'Visit Ayahay.com and navigate to the "Schedules and Routes" section. Select your preferred origin and destination to view available trips.'
  },

  //On-Bard Experience
  {
    category: 'On-board Experience',
    question: 'What amenities are available on board?',
    answer:
      'Our vessels feature comfortable seating, air conditioning, restrooms, and a canteen. Some routes also offer premium class with extra amenities.'
  },

  // Cancellations and Refunds
  {
    category: 'Cancellations & Refunds',
    question: 'What are the rules for refunds and rebooking?',
    answer:
      "Refund and rebooking policies vary by shipping line. Please review the guidelines and policies provided on the respective shipping line's website. You may also contact Ayahay customer service for further assistance."
  },
  {
    category: 'Cancellations & Refunds',
    question: 'How long is my ticket valid?',
    answer:
      'Tickets are valid for 30 days from the date of booking. Make sure to use your ticket within this period to avoid forfeiture.'
  }
];

export const categories = Array.from(new Set(faqData.map((item) => item.category)));