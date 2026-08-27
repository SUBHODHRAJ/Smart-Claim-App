import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentQuizzes } from './pages/student/StudentQuizzes';
import { QuizPlayer } from './pages/student/QuizPlayer';
import { QuizResultPage } from './pages/student/QuizResultPage';
import { StudentPerformance } from './pages/student/StudentPerformance';
import { StudyPlanPage } from './pages/student/StudyPlanPage';
import { FlashcardsPage } from './pages/student/FlashcardsPage';
import { NotesPage } from './pages/student/NotesPage';
import { LeaderboardPage } from './pages/student/LeaderboardPage';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherDocuments } from './pages/teacher/TeacherDocuments';
import { AIQuizGeneratorStudio } from './pages/teacher/AIQuizGeneratorStudio';
import { TeacherQuizzes } from './pages/teacher/TeacherQuizzes';
import { TeacherAssignments } from './pages/teacher/TeacherAssignments';
import { TeacherAnalytics } from './pages/teacher/TeacherAnalytics';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Student Protected Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="quizzes" element={<StudentQuizzes />} />
              <Route path="attempt/:id" element={<QuizPlayer />} />
              <Route path="results/:id" element={<QuizResultPage />} />
              <Route path="performance" element={<StudentPerformance />} />
              <Route path="study-plan" element={<StudyPlanPage />} />
              <Route path="flashcards" element={<FlashcardsPage />} />
              <Route path="notes" element={<NotesPage />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
            </Route>

            {/* Teacher Protected Routes */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/teacher/dashboard" replace />} />
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="documents" element={<TeacherDocuments />} />
              <Route path="quizzes/create" element={<AIQuizGeneratorStudio />} />
              <Route path="quizzes" element={<TeacherQuizzes />} />
              <Route path="assignments" element={<TeacherAssignments />} />
              <Route path="analytics" element={<TeacherAnalytics />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminDashboard />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
