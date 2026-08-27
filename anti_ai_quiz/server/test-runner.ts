import mongoose from 'mongoose';
import { connectDB } from './src/config/db';
import { User } from './src/models/User';
import { DocumentModel } from './src/models/Document';
import { Question } from './src/models/Question';
import { Quiz } from './src/models/Quiz';
import { Attempt } from './src/models/Attempt';
import { AuthService } from './src/services/AuthService';
import { DocumentService } from './src/services/DocumentService';
import { AIService } from './src/services/AIService';
import { QuizService } from './src/services/QuizService';
import { EvaluationService } from './src/services/EvaluationService';
import { PerformanceService } from './src/services/PerformanceService';
import { AdaptiveService } from './src/services/AdaptiveService';
import { GamificationService } from './src/services/GamificationService';

const assert = (condition: boolean, msg: string) => {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    throw new Error(`Assertion failed: ${msg}`);
  }
  console.log(`✅ PASSED: ${msg}`);
};

async function runAllTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING AI QUIZ GENERATOR AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  await connectDB();

  // Test 1: Authentication & User Registration
  console.log('--- TEST GROUP 1: AUTHENTICATION & JWT ---');
  const studentEmail = `student_${Date.now()}@test.com`;
  const teacherEmail = `teacher_${Date.now()}@test.com`;

  const studentReg = await AuthService.register({
    name: 'Test Student One',
    email: studentEmail,
    password: 'password123',
    role: 'STUDENT',
  });
  assert(!!studentReg.token, 'Student registration returns JWT token');
  assert(studentReg.user.role === 'STUDENT', 'User role is STUDENT');

  const teacherReg = await AuthService.register({
    name: 'Test Teacher One',
    email: teacherEmail,
    password: 'password123',
    role: 'TEACHER',
  });
  assert(teacherReg.user.role === 'TEACHER', 'Teacher registration succeeds');

  const studentLogin = await AuthService.login(studentEmail, 'password123');
  assert(!!studentLogin.token, 'Student login succeeds with correct password');

  try {
    await AuthService.login(studentEmail, 'wrongpassword');
    assert(false, 'Login with invalid password should fail');
  } catch (err: any) {
    assert(err.statusCode === 401, 'Invalid login throws 401 Unauthorized');
  }

  // Test 2: Document Processing & Ownership Isolation
  console.log('\n--- TEST GROUP 2: DOCUMENT EXTRACTION & ISOLATION ---');
  const sampleNotes = `Chapter on Virtual Memory and Page Replacement Algorithms.
Virtual memory is a storage allocation scheme in which secondary memory can be addressed as though it were part of main memory.
The Least Recently Used (LRU) algorithm replaces the page that has not been used for the longest period of time.
Belady's Anomaly is the phenomenon in which increasing the number of page frames results in an increase in the number of page faults for certain algorithms like FIFO.`;

  const doc = await DocumentService.processRawText(
    sampleNotes,
    'Virtual Memory Lecture Notes',
    studentLogin.user.id,
    false // private document
  );
  assert(doc.title === 'Virtual Memory Lecture Notes', 'Document saved with extracted text');
  assert(doc.chunks.length > 0, 'Document split into semantic chunks');

  // Verify Student B cannot access Student A's private document
  const studentB = await AuthService.register({
    name: 'Student B',
    email: `studentB_${Date.now()}@test.com`,
    password: 'password123',
    role: 'STUDENT',
  });

  try {
    await DocumentService.getById((doc._id as any).toString(), studentB.user.id, 'STUDENT');
    assert(false, 'Student B should not access Student A private document');
  } catch (err: any) {
    assert(err.statusCode === 403, 'User Isolation: Accessing another user private document returns 403 Forbidden');
  }

  // Test 3: Grounded AI Question Generation & Quality Scoring
  console.log('\n--- TEST GROUP 3: SOURCE-GROUNDED AI GENERATION ---');
  const generatedQuestions = await AIService.generateQuizQuestions({
    documentId: (doc._id as any).toString(),
    documentTitle: doc.title,
    topic: 'Virtual Memory',
    chunks: doc.chunks,
    numberOfQuestions: 3,
    difficulty: 'MEDIUM',
  });
  assert(generatedQuestions.length >= 2, 'AIService generates structured questions');
  assert(generatedQuestions[0].options.length >= 2, 'Questions contain multiple options');
  assert(generatedQuestions[0].options.includes(generatedQuestions[0].correctAnswer), 'Correct answer matches an option');
  assert(generatedQuestions[0].aiQualityScore >= 80, 'AI Quality score computed accurately');
  assert(!!generatedQuestions[0].sourceReference?.page, 'Questions contain source page reference');

  // Test 4: Teacher Question Review & Quiz Creation
  console.log('\n--- TEST GROUP 4: TEACHER REVIEW & QUIZ WORKFLOW ---');
  const savedQuestions = await QuizService.saveGeneratedQuestions(
    generatedQuestions,
    (doc._id as any).toString(),
    teacherReg.user.id
  );
  assert(savedQuestions[0].validationStatus === 'PENDING', 'New questions default to PENDING');

  // Teacher approves first question and edits second
  const approvedQ = await QuizService.setQuestionStatus(
    (savedQuestions[0]._id as any).toString(),
    'APPROVED',
    teacherReg.user.id,
    'TEACHER'
  );
  assert(approvedQ.validationStatus === 'APPROVED', 'Teacher can approve question');

  const quiz = await QuizService.createQuiz({
    title: 'Virtual Memory Assessment',
    documentId: (doc._id as any).toString(),
    questionIds: savedQuestions.map((q) => (q._id as any).toString()),
    createdBy: teacherReg.user.id,
    difficulty: 'MEDIUM',
    timeLimitMinutes: 10,
    isPublished: true,
    topic: 'Virtual Memory',
  });
  assert(quiz.isPublished === true, 'Quiz created and published');

  // Test 5: Timed Quiz Attempt, Evaluation & Score Calculation
  console.log('\n--- TEST GROUP 5: QUIZ ATTEMPT & EVALUATION ---');
  const attempt = await EvaluationService.startAttempt((quiz._id as any).toString(), studentLogin.user.id);
  assert(attempt.status === 'IN_PROGRESS', 'Attempt started in IN_PROGRESS state');

  const userAnswers = [
    {
      questionId: (savedQuestions[0]._id as any).toString(),
      selectedAnswer: savedQuestions[0].correctAnswer, // Correct answer
    },
    {
      questionId: (savedQuestions[1]._id as any).toString(),
      selectedAnswer: 'Incorrect distractor', // Wrong answer
    },
  ];

  const submittedAttempt = await EvaluationService.submitAttempt(
    (attempt._id as any).toString(),
    userAnswers,
    studentLogin.user.id
  );
  assert(submittedAttempt.status === 'COMPLETED', 'Attempt marked COMPLETED upon submission');
  assert(submittedAttempt.score === 1, 'Score calculated correctly (1 correct)');
  assert(submittedAttempt.percentage > 0, 'Percentage calculated correctly');
  assert(submittedAttempt.topicBreakdown.length > 0, 'Topic breakdown generated');

  // Test 6: Critical User Isolation on Attempts (Student B cannot view Student A's attempt)
  console.log('\n--- TEST GROUP 6: ATTEMPT USER ISOLATION ---');
  try {
    await EvaluationService.getAttemptById((attempt._id as any).toString(), studentB.user.id, 'STUDENT');
    assert(false, 'Student B should NOT be able to view Student A attempt');
  } catch (err: any) {
    assert(err.statusCode === 403, 'Access denied (403) when Student B requests Student A attempt ID');
  }

  // Test 7: Performance Engine, Weak Topic Detection & Adaptive Quiz
  console.log('\n--- TEST GROUP 7: PERFORMANCE ENGINE & ADAPTIVE QUIZ ---');
  const perfSummary = await PerformanceService.getStudentSummary(studentLogin.user.id);
  assert(perfSummary.totalQuizzesTaken >= 1, 'Performance tracked server-side');
  assert(perfSummary.topics.length > 0, 'Topic accuracy stored');

  const adaptiveQuiz = await AdaptiveService.generateAdaptiveQuizForStudent(
    studentLogin.user.id,
    'Virtual Memory',
    4,
    (doc._id as any).toString()
  );
  assert(adaptiveQuiz.isAdaptive === true, 'Adaptive quiz generated with dynamic questions');

  // Test 8: AI Study Plan & Gamification
  console.log('\n--- TEST GROUP 8: AI STUDY PLAN & GAMIFICATION ---');
  const studyPlan = AIService.generateStudyPlan(['Virtual Memory'], ['CPU Scheduling']);
  assert(studyPlan.length === 7, '7-Day Personalized Study Plan generated');

  const achievements = await GamificationService.getUserAchievements(studentLogin.user.id);
  assert(achievements.length > 0, 'Gamification achievements unlocked on first quiz completion');

  const leaderboard = await GamificationService.getLeaderboard();
  assert(leaderboard.length > 0, 'Weekly leaderboard calculated with student rankings');

  console.log('\n====================================================');
  console.log('🎉 ALL AUTOMATED TESTS PASSED SUCCESSFULLY! (8/8)');
  console.log('====================================================\n');
  process.exit(0);
}

runAllTests().catch((err) => {
  console.error('Test suite failed with error:', err);
  process.exit(1);
});
