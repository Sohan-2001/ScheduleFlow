# ScheduleFlow

ScheduleFlow is a modern, AI-enhanced web application that connects professionals (Sellers) with clients (Buyers), allowing them to book appointments seamlessly. It leverages Google Calendar for real-time availability and scheduling, and uses generative AI to provide smart recommendations.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **AI/Generative AI**: [Firebase Genkit](https://firebase.google.com/docs/genkit)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore, Authentication)
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth) (Google Provider)
- **Calendar Integration**: [Google Calendar API](https://developers.google.com/calendar)

---

## Features

- **Dual User Roles**: Separate dashboards and experiences for Buyers and Sellers.
- **Google Sign-In**: Streamlined and secure authentication using Google accounts.
- **Dynamic Availability**: Sellers can set their availability, which is stored in Firestore.
- **Real-time Booking**: Buyers can view available slots and book appointments in real-time.
- **Google Calendar Integration**: Booked appointments are automatically created on both the Buyer's and Seller's Google Calendars, complete with a Google Meet link.
- **AI-Powered Recommendations**: Buyers can describe their needs, and an AI agent recommends the most suitable sellers.
- **Responsive Design**: A clean and modern UI that works across desktops, tablets, and mobile devices.

---

## User Flows

### Seller Flow
1.  **Sign-In**: The seller signs in using their Google account.
2.  **Onboarding**: New sellers are directed to an onboarding page to set up their public profile (name, title, description).
3.  **Calendar Connection**: From the dashboard, the seller is prompted to connect their Google Calendar. This initiates an OAuth flow to grant the necessary permissions.
4.  **Manage Availability**: The seller can add or remove time slots for specific dates, which buyers can then book.

### Buyer Flow
1.  **Sign-In**: The buyer signs in using their Google account.
2.  **Discover Sellers**: The buyer can browse a list of all professionals, use a search bar to filter by name/title, or use the AI recommendation engine to find a match.
3.  **View Availability**: The buyer selects a seller to view their available time slots in a booking modal.
4.  **Book Appointment**: The buyer chooses a slot and confirms the booking. An event is instantly created on both their and the seller's Google Calendars.

---

## Project Setup & Configuration

Follow these steps to get your local development environment set up.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd schedule-flow
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Firebase

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  In your project, go to **Project Settings** > **General**.
3.  Under "Your apps", click the web icon (`</>`) to add a new web app.
4.  Give it a name and click "Register app".
5.  You will be shown a `firebaseConfig` object. You will need these values for your environment variables.

### 4. Configure Environment Variables

Create a `.env` file in the root of the project and add the Firebase configuration values from the previous step.

```env
NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="1:..."
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-..."

# This is required for Genkit AI flows to work
GEMINI_API_KEY="your-google-ai-api-key"
```

**To get a `GEMINI_API_KEY`**:
- Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
- Create and copy a new API key.

### 5. Set up Google Cloud & OAuth

To allow users to connect their Google Calendars, you must configure the OAuth consent screen.

1.  In the [Google Cloud Console](https://console.cloud.google.com/), select the same project as your Firebase project.
2.  Go to **APIs & Services** > **Enabled APIs & services**. Click **+ ENABLE APIS AND SERVICES** and enable the **Google Calendar API**.
3.  Go to **APIs & Services** > **OAuth consent screen**.
    - **User Type**: Select **External**.
    - **App Information**: Fill out your app's name, user support email, and developer contact info.
    - **Authorized domains**: Add the domain where your app will be hosted. For local development, this is not required.
    - **Scopes**: You do not need to add scopes here manually. The app will request them.
4.  **Publish the App**: While in "Testing" mode, only test users can use the app. To allow all users, you must go through Google's verification process by publishing the app from the OAuth consent screen.

---

## Running Locally

To run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.

---

## Deployment

This project is configured for easy deployment with **Firebase App Hosting**.

### 1. Initialize Firebase CLI

If you haven't already, install the Firebase CLI and log in:

```bash
npm install -g firebase-tools
firebase login
```

### 2. Connect to Your Firebase Project

From your project's root directory, connect to your Firebase project:

```bash
firebase init hosting
```

- When prompted, select **Use an existing project** and choose the Firebase project you created earlier.
- Select **App Hosting (preview)** as the hosting service.
- Follow the prompts to configure the backend.

### 3. Deploy

To deploy your application, run the following command:

```bash
firebase deploy --only hosting
```

The CLI will build your Next.js application and deploy it. Once finished, it will provide you with the URL to your live application.
