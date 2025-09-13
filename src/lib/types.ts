export type User = {
  uid: string;
  email: string | null;
  role: 'buyer' | 'seller' | null;
};

export type Seller = {
  id: string;
  name: string;
  title: string;
  description: string;
  image: string;
};

export type TimeSlot = {
  id: string;
  startTime: string; // ISO 8601 format
  endTime: string;   // ISO 8601 format
  status: 'available' | 'booked';
  bookedBy?: string; // Buyer's email
  bookedAt?: string; // ISO 8601 format timestamp of booking
};
