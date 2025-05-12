Interview Prep App
A Next.js application designed to help users prepare for job interviews through AI-powered mock interviews. Users can record self-introductions and answers to mock questions using webcam and speech-to-text, receive feedback and ratings from Gemini AI, and store data using Drizzle ORM with a PostgreSQL database.
Features

Self-Introduction Recording: Record a 2-minute self-introduction with webcam and microphone.
Mock Interview Questions: Answer AI-generated questions with Previous/Next navigation and speech-to-text recording.
AI-Powered Feedback: Receive ratings (out of 10) and improvement feedback from Gemini AI for self-introductions and answers.
Interview Management: Create, view, and start mock interviews via a dashboard.
Persistent Storage: Store interview data and responses using Drizzle ORM and PostgreSQL.
Authentication: Secure user authentication with Clerk.

Prerequisites
Before setting up the project, ensure you have the following installed:

Node.js (version 18 or higher)득
PostgreSQL (version 13 or higher)
Git
A Gemini AI API key for AI feedback
A Clerk account for authentication

Installation
Follow these steps to set up the project locally:

Clone the Repository:
git clone https://github.com/your-username/interview-prep-app.git
cd interview-prep-app


Install Dependencies:Install the required Node.js packages using npm:
npm install


Set Up PostgreSQL Database:

Create a PostgreSQL database (e.g., interview_prep_db).
Ensure the database is running and accessible.
Note: The project uses Drizzle ORM, which will handle schema migrations.


Configure Environment Variables:Create a .env.local file in the project root and add the following variables:
# Database connection (PostgreSQL)
DATABASE_URL=postgres://username:password@localhost:5432/interview_prep_db

# Gemini AI API key
GEMINI_API_KEY=your-gemini-api-key

# Clerk authentication keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

# App configuration
NEXT_PUBLIC_INTERVIEW_COUNT=5
NEXT_PUBLIC_QUESTION_NOTE="Record your answer clearly and concisely."


Replace username, password, and interview_prep_db with your PostgreSQL credentials and database name.
Obtain GEMINI_API_KEY from Google AI Studio.
Get Clerk keys from your Clerk dashboard.


Run Database Migrations:Apply the database schema using Drizzle ORM:
npx drizzle-kit push

Ensure utils/schema.js defines the ai_interview and user_answer tables correctly.


Running the Application
To start the development server:

Start the Server:
npm run dev

This starts the Next.js app at http://localhost:3000.

Access the App:Open your browser and navigate to http://localhost:3000.Sign in using Clerk authentication to access the dashboard.


Usage

Create a New Interview:

From the dashboard, click "Add New Interview" to create a mock interview.
Provide job position, experience, and other details.


Record Self-Introduction:

After creating an interview, record a 2-minute self-introduction using the webcam and microphone.
Submit to proceed to mock questions.


Answer Mock Questions:

Answer AI-generated questions using speech-to-text.
Navigate between questions using Previous and Next buttons.
Click End Interview to view feedback.


View Feedback:

On the feedback page, review your self-introduction and question answers, including AI-generated ratings and feedback.



Directory Structure
Key directories and files in the project:
interview-prep-app/
├── app/
│   ├── dashboard/
│   │   ├── interview/
│   │   │   ├── [interviewId]/
│   │   │   │   ├── start/
│   │   │   │   │   ├── page.jsx (Questions & Answers)
│   │   │   │   │   ├── _components/
│   │   │   │   │   │   ├── QuestionsSection.jsx
│   │   │   │   │   │   ├── RecordAnswerSection.jsx
│   │   │   │   ├── self-intro/
│   │   │   │   │   ├── page.jsx (SelfIntroduction.jsx)
│   │   │   │   ├── feedback/
│   │   │   │   │   ├── page.jsx (FeedbackPage.jsx)
│   │   ├── InterviewList.jsx
│   │   ├── InterviewItemCard.jsx
├── utils/
│   ├── db.js (Database configuration)
│   ├── GeminiAI.js (Gemini AI integration)
│   ├── schema.js (Drizzle ORM schema)
├── components/
│   ├── ui/
│   │   ├── button.jsx (Shadcn UI component)
├── .gitignore
├── package.json
├── README.md

Troubleshooting

"No interview record found" on Feedback Page:

Ensure user_answer records are inserted in SelfIntroduction.jsx and RecordAnswerSection.jsx.
Check the database:SELECT * FROM user_answer WHERE mockIdRef = 'your-mockId';


Verify params.interviewId matches ai_interview.mockId.


Cannot record answers for multiple questions:

Ensure RecordAnswerSection.jsx uses the updated version (artifact_id: 66a14e56-e9b3-46da-8340-0dbf9b81aa2b).
Check console logs for errors in UpdateUserAnswer.


Database Connection Issues:

Verify DATABASE_URL in .env.local.
Ensure PostgreSQL is running and the database exists.


Gemini AI Errors:

Confirm GEMINI_API_KEY is valid.
Check network connectivity to Google AI services.



Contributing
Contributions are welcome! To contribute:

Fork the repository.
Create a feature branch (git checkout -b feature/your-feature).
Commit changes (git commit -m "Add your feature").
Push to the branch (git push origin feature/your-feature).
Open a pull request.

License
This project is licensed under the MIT License.
Contact
For questions or support, contact [your-email@example.com] or open an issue on GitHub.
