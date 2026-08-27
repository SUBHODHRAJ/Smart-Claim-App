import mongoose from 'mongoose';
import { connectDB } from './config/db';
import { User } from './models/User';
import { DocumentModel } from './models/Document';
import { Question } from './models/Question';
import { Quiz } from './models/Quiz';
import { Flashcard } from './models/Flashcard';
import { Performance } from './models/Performance';
import { Achievement } from './models/Achievement';

const seed = async () => {
  await connectDB();
  console.log('Clearing existing test data...');

  await Promise.all([
    User.deleteMany({}),
    DocumentModel.deleteMany({}),
    Question.deleteMany({}),
    Quiz.deleteMany({}),
    Flashcard.deleteMany({}),
    Performance.deleteMany({}),
    Achievement.deleteMany({}),
  ]);

  console.log('Creating demo users...');
  const teacher = new User({
    name: 'Prof. Alan Turing',
    email: 'teacher@test.com',
    password: 'password123',
    role: 'TEACHER',
    classGroup: 'Class 101',
    points: 850,
  });
  await teacher.save();

  const studentA = new User({
    name: 'Alex Johnson',
    email: 'studentA@test.com',
    password: 'password123',
    role: 'STUDENT',
    classGroup: 'Class 101',
    currentStreak: 4,
    longestStreak: 6,
    lastActivityDate: new Date(),
    points: 420,
  });
  await studentA.save();

  const studentB = new User({
    name: 'Sarah Connor',
    email: 'studentB@test.com',
    password: 'password123',
    role: 'STUDENT',
    classGroup: 'Class 101',
    currentStreak: 1,
    longestStreak: 2,
    lastActivityDate: new Date(),
    points: 180,
  });
  await studentB.save();

  const admin = new User({
    name: 'System Administrator',
    email: 'admin@test.com',
    password: 'password123',
    role: 'ADMIN',
    points: 999,
  });
  await admin.save();

  console.log('Creating sample Operating Systems document...');
  const sampleText = `Chapter 5: CPU Scheduling and Deadlocks

CPU scheduling is the basis of multiprogrammed operating systems. By switching the CPU among processes, the operating system can make the computer more productive. In a single-processor system, only one process can run at a time; any others must wait until the CPU is free and can be rescheduled.

Preemptive scheduling allows a running process to be interrupted and replaced by a higher-priority process in the ready queue. Nonpreemptive scheduling requires a process to keep the CPU until it releases it, either by terminating or by switching to the waiting state.

Deadlock is defined as a situation where a set of processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process.
The four necessary conditions for deadlock are:
1. Mutual Exclusion: At least one resource must be held in a non-shareable mode.
2. Hold and Wait: A process must be holding at least one resource and waiting to acquire additional resources.
3. No Preemption: Resources cannot be preempted; a resource can be released only voluntarily by the process holding it.
4. Circular Wait: A closed chain of processes exists such that each process holds at least one resource needed by the next process in the chain.

The Banker's Algorithm is a deadlock avoidance algorithm developed by Edsger Dijkstra. It tests for safety by simulating the allocation for predetermined maximum possible amounts of all resources, before deciding whether allocation should be allowed to continue.`;

  const sampleDoc = new DocumentModel({
    owner: teacher._id,
    title: 'Operating Systems Principles & Scheduling',
    originalFilename: 'Operating_Systems_Principles.pdf',
    fileType: 'application/pdf',
    fileSize: 1048576,
    extractedText: sampleText,
    totalPages: 5,
    topics: ['CPU Scheduling', 'Deadlocks', 'Mutual Exclusion', "Banker's Algorithm"],
    chunks: [
      {
        chunkIndex: 0,
        text: sampleText.slice(0, 500),
        page: 1,
        wordCount: 80,
        topicKeywords: ['CPU Scheduling', 'Preemptive scheduling'],
      },
      {
        chunkIndex: 1,
        text: sampleText.slice(500),
        page: 2,
        wordCount: 95,
        topicKeywords: ['Deadlocks', 'Mutual Exclusion', "Banker's Algorithm"],
      },
    ],
    isPublic: true,
  });
  await sampleDoc.save();

  console.log('Creating sample questions & quiz...');
  const q1 = new Question({
    documentId: sampleDoc._id,
    question: 'What is the primary role of CPU scheduling in a multiprogrammed operating system?',
    options: [
      'To switch the CPU among processes to maximize productivity and resource utilization',
      'To strictly format the primary hard drive during system reboot',
      'To prevent multiple threads from allocating virtual address blocks',
      'To disable hardware interrupts during I/O transactions',
    ],
    correctAnswer: 'To switch the CPU among processes to maximize productivity and resource utilization',
    explanation: 'As stated on Page 1, CPU scheduling enables the OS to switch the CPU among processes, making the computer more productive.',
    topic: 'CPU Scheduling',
    difficulty: 'EASY',
    sourceReference: {
      documentId: (sampleDoc._id as any).toString(),
      documentTitle: sampleDoc.title,
      page: 1,
      snippet: 'CPU scheduling is the basis of multiprogrammed operating systems...',
    },
    aiQualityScore: 98,
    validationStatus: 'APPROVED',
    createdBy: teacher._id,
  });
  await q1.save();

  const q2 = new Question({
    documentId: sampleDoc._id,
    question: 'Which of the following is NOT one of the four necessary conditions for a deadlock?',
    options: [
      'Resource Over-Allocation without Paging',
      'Mutual Exclusion',
      'Hold and Wait',
      'Circular Wait',
    ],
    correctAnswer: 'Resource Over-Allocation without Paging',
    explanation: 'The four necessary conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait (Page 2).',
    topic: 'Deadlocks',
    difficulty: 'MEDIUM',
    sourceReference: {
      documentId: (sampleDoc._id as any).toString(),
      documentTitle: sampleDoc.title,
      page: 2,
      snippet: 'The four necessary conditions for deadlock are: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.',
    },
    aiQualityScore: 96,
    validationStatus: 'APPROVED',
    createdBy: teacher._id,
  });
  await q2.save();

  const q3 = new Question({
    documentId: sampleDoc._id,
    question: "What is the primary purpose of Dijkstra's Banker's Algorithm?",
    options: [
      'Deadlock avoidance through simulated safety test before resource allocation',
      'Fast memory defragmentation for dynamic page tables',
      'Network encryption for inter-process socket communication',
      'Kernel stack recovery during hardware faults',
    ],
    correctAnswer: "Deadlock avoidance through simulated safety test before resource allocation",
    explanation: "Banker's Algorithm tests for safety by simulating allocation of maximum possible resources before granting requests (Page 2).",
    topic: "Banker's Algorithm",
    difficulty: 'HARD',
    sourceReference: {
      documentId: (sampleDoc._id as any).toString(),
      documentTitle: sampleDoc.title,
      page: 2,
      snippet: "The Banker's Algorithm is a deadlock avoidance algorithm developed by Edsger Dijkstra.",
    },
    aiQualityScore: 95,
    validationStatus: 'APPROVED',
    createdBy: teacher._id,
  });
  await q3.save();

  const quiz = new Quiz({
    title: 'OS Fundamentals: CPU Scheduling & Deadlocks',
    description: 'Comprehensive assessment on multiprogramming, scheduling paradigms, and deadlock avoidance.',
    documentId: sampleDoc._id,
    questionIds: [q1._id, q2._id, q3._id],
    createdBy: teacher._id,
    difficulty: 'MEDIUM',
    timeLimitMinutes: 10,
    isPublished: true,
    topic: 'Operating Systems',
  });
  await quiz.save();

  q1.quizId = quiz._id;
  q2.quizId = quiz._id;
  q3.quizId = quiz._id;
  await Promise.all([q1.save(), q2.save(), q3.save()]);

  console.log('Creating initial flashcards...');
  await Flashcard.create([
    {
      userId: studentA._id,
      documentId: sampleDoc._id,
      topic: 'Deadlocks',
      front: 'What is Mutual Exclusion in the context of Deadlocks?',
      back: 'At least one resource must be held in a non-shareable mode by a process.',
      status: 'LEARNING',
      sourceReference: {
        documentId: (sampleDoc._id as any).toString(),
        documentTitle: sampleDoc.title,
        page: 2,
      },
    },
    {
      userId: studentA._id,
      documentId: sampleDoc._id,
      topic: "Banker's Algorithm",
      front: "What is Banker's Algorithm used for?",
      back: 'Deadlock avoidance through safety state simulation prior to resource allocation.',
      status: 'KNOWN',
      sourceReference: {
        documentId: (sampleDoc._id as any).toString(),
        documentTitle: sampleDoc.title,
        page: 2,
      },
    },
  ]);

  console.log('Seed completed successfully!');
  console.log('Demo Credentials:');
  console.log('Teacher: teacher@test.com / password123');
  console.log('Student A: studentA@test.com / password123');
  console.log('Student B: studentB@test.com / password123');
  console.log('Admin: admin@test.com / password123');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
