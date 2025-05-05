import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { exit } from 'process';

// Define the Question interface
interface Question {
  question: string;
  options: string[];
  answer: number;
  topic: string;
  subject: string;
  level: string[];
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// 1. Define the Question Schema
const questionSchema = new mongoose.Schema<Question>({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  answer: { type: Number, required: true },
  topic: { type: String, required: true },
  subject: { type: String, required: true },
  level: { type: [String], required: true },
  image: { type: String, required: false }
}, { timestamps: true });

// 2. Create the Model
const Question = mongoose.model<Question>('Question', questionSchema);

// 3. Read questions from JSON file
const questionsData = JSON.parse(readFileSync('./questions.json', 'utf-8')) as Question[];

// 4. Connect to MongoDB and insert all questions
async function importQuestions() {
  try {
    await mongoose.connect('MONGODB_URI=mongodb://127.0.0.1:27017/SSICLocal');
    console.log('✅ Connected to MongoDB');

    // Insert all questions in one operation
    const result = await Question.insertMany(questionsData);
    console.log(`✔ Successfully inserted ${result.length} questions`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error:', err);
    exit(1);
  }
}

// 5. Run the import
importQuestions();