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
  startTime: string;
  endTime: string;
  status: 'available' | 'booked';
  bookedBy?: string; // e.g. buyer's email or ID
};
