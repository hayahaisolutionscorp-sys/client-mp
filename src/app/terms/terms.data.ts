export type ContentItem = {
  type: 'paragraph' | 'heading';
  text: string;
};

type Terms = {
  id: string;
  title: string;
  content: string | ContentItem[];
};

export const terms: Terms[] = [
  {
    id: 'introduction',
    title: '1. Introduction',
    content: `Welcome to Ayahay's online booking platform. By using this service, you agree to comply with the following terms and conditions. Please read them carefully before making a booking. Your continued use of this platform constitutes your acceptance of these terms.`
  },
  {
    id: 'booking-eligibility',
    title: '2. Booking Eligibility',
    content: `Passengers must be at least 18 years old to make a booking.
      Passengers under 18 years must be accompanied by a parent or legal guardian during travel.
      Passengers must provide accurate and complete information during the booking process.`
  },
  {
    id: 'booking-conditions',
    title: '3. Ayahay Online Booking Conditions',
    content: [
      {
        type: 'paragraph',
        text: 'Before using this site to book ferry journeys, please read the following booking conditions.'
      },
      { type: 'heading', text: 'Application' },
      {
        type: 'paragraph',
        text: 'These Booking Conditions apply to all passenger bookings for ferry journeys through this site. "You" refers to the person making the booking, and each person for whom the booking is made is a "Customer."'
      },
      { type: 'heading', text: 'Parties' },
      {
        type: 'paragraph',
        text: "These Booking Conditions apply to Ayahay's services. The contract forms with both Ayahay and the ferry operator. In case of conflict, the operator's terms prevail."
      },
      { type: 'heading', text: 'Fares and General Information' },
      {
        type: 'paragraph',
        text: 'Fares are based on vessel type, number of passengers, routes, and travel dates. Special conditions may apply to promotional rates. Vehicle and passenger space are subject to availability. Promotional fares are subject to conditions, including potential additional charges for unused portions.'
      },
      { type: 'heading', text: 'Departure Schedules' },
      {
        type: 'paragraph',
        text: 'Departure/arrival times are estimates. Schedules may be interrupted or altered due to weather, tidal conditions, or other circumstances. Alternative ships or points of departure may be used.'
      },
      { type: 'heading', text: 'Animals' },
      {
        type: 'paragraph',
        text: 'Carriage of animals is permitted with prior notification, complying with legal requirements, and may incur additional charges.'
      },
      { type: 'heading', text: 'Freight and Commercial Passenger Vehicles' },
      {
        type: 'paragraph',
        text: 'Special conditions apply, and rates vary. Definitions are determined by the operator.'
      },
      { type: 'heading', text: 'Hazardous Materials' },
      {
        type: 'paragraph',
        text: 'Dangerous or hazardous materials are not accepted. Permission, if granted, may incur additional charges.'
      }
    ]
  },
  {
    id: 'booking-process',
    title: '4. Booking Process',
    content: `Bookings must be made through Ayahay's official website or mobile application.
      Passengers are responsible for verifying the accuracy of all booking details before confirming their reservations.
      A booking confirmation will be sent via email or SMS upon successful payment.`
  },
  {
    id: 'payment',
    title: '5. Payment and Fees',
    content: `All bookings must be paid in full at the time of reservation.
      Ayahay accepts various payment methods, including credit/debit cards, e-wallets, and bank transfers.
      Additional service fees may apply depending on the selected payment method.
      The convenience fee is non-refundable.`
  },
  {
    id: 'ticket-validity',
    title: '6. Ticket Validity',
    content: `Tickets are non-transferable and valid only for the specified passenger and travel date.
      Passengers must present a valid ID matching the booking details at the time of boarding.`
  },
  {
    id: 'changes',
    title: '7. Changes, Cancellations, and Refunds',
    content: `Change requests (e.g., rescheduling) are subject to the policies of the respective shipping line and may incur additional fees.
      Cancellations and refund requests must be made in accordance with the shipping line's policies.
      Refund processing times may vary depending on the payment method used.
      Cancellation of trips is subject to change without prior notice.`
  },
  {
    id: 'boarding',
    title: '8. Boarding Requirements',
    content: `Passengers must arrive at the boarding point at least 1 hour before departure.
      Passengers must present a valid ticket and identification for verification.
      Ayahay and the shipping line reserve the right to refuse boarding if the passenger fails to meet the boarding requirements.`
  },
  {
    id: 'conduct',
    title: '9. Passenger Conduct',
    content: `Passengers are expected to behave responsibly and comply with the rules set by the shipping line.
      Any disruptive or unlawful behavior may result in denied boarding or removal from the vessel.`
  },
  {
    id: 'liability',
    title: '10. Liability',
    content: `Ayahay acts as a booking platform and is not responsible for the operations of the shipping lines. Passengers are advised to always read the terms and conditions of the respective shipping line.
      Ayahay is not liable for delays, cancellations, or any incidents that occur during the trip.
      Passengers agree to indemnify Ayahay from any claims or damages arising from their use of the platform.`
  },
  {
    id: 'privacy',
    title: '11. Privacy and Data Protection',
    content: `Ayahay is committed to protecting passenger privacy. Personal information collected during the booking process will be handled in accordance with Ayahay's Privacy Policy.`
  },
  {
    id: 'amendments',
    title: '12. Amendments to Terms',
    content: `Ayahay reserves the right to update these terms and conditions at any time.
      Passengers will be notified of any changes, and continued use of the platform constitutes acceptance of the updated terms.`
  },
  {
    id: 'governing-law',
    title: '13. Governing Law',
    content: `These terms and conditions shall be governed by the laws of the Philippines.
      By making a booking through Ayahay's online platform, you confirm that you have read, understood, and agreed to these terms and conditions.`
  }
];
