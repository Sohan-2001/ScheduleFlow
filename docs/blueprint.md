# **App Name**: ScheduleFlow

## Core Features:

- Role Selection: Allow users to select 'Buyer' or 'Seller' role upon initial login, stored in local storage.
- Role-Based Redirection: Automatically redirect users to /dashboard/seller or /dashboard/buyer based on the stored role in local storage on subsequent logins.
- Availability Exposure: Sellers expose their availability via a simple form to specify time slots; the form's configuration is loaded and saved from local storage.
- Seller Browsing: Buyers can browse available Sellers, displaying key profile information loaded from local storage (seller list is pre-populated).
- Availability Viewing: Buyers view Sellers' availability based on data read from local storage, using a calendar-style UI to display slots.
- Slot Booking: Buyers can book available slots; all updates saved locally to simulate booking functionality.
- Smart Recommendations: Leverage a generative AI "tool" to make smart suggestions to buyers in terms of sellers most qualified for their query.

## Style Guidelines:

- Primary color: Deep Indigo (#663399), lending an air of professionalism and trustworthiness suitable for a scheduling application.
- Background color: Light Gray (#F0F0F5), provides a clean, neutral backdrop that doesn't distract from the scheduling information.
- Accent color: Electric Purple (#BF5FFF), will guide the user attention, indicating possible areas to interact with the application.
- Body and headline font: 'Inter' sans-serif for clear and modern readability.
- Use clean, outline-style icons from a set like Remix Icon or Feather for a consistent and modern look.
- Maintain a clean, card-based layout to separate sellers and time slots. Focus on readability with generous whitespace.
- Subtle transitions and micro-interactions on button hovers and when transitioning between sections to provide feedback to the user.