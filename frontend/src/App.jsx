import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import {
  AuthProvider,
} from "./context/AuthContext";

import ProtectedRoute
  from "./components/ProtectedRoute";

import Login
  from "./pages/Login";

import Register
  from "./pages/Register";

import CustomerDashboard
  from "./pages/CustomerDashboard";

import CreateClaim
  from "./pages/CreateClaim";

import ClaimDetails
  from "./pages/ClaimDetails";

import AgentDashboard
  from "./pages/AgentDashboard";


function AppRoutes() {

  return (
    <Routes>

      {/* PUBLIC */}

      <Route
        path="/login"
        element={
          <Login />
        }
      />


      <Route
        path="/register"
        element={
          <Register />
        }
      />


      {/* CUSTOMER */}

      <Route
        path="/customer"
        element={
          <ProtectedRoute
            allowedRoles={[
              "Customer",
            ]}
          >
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />


      <Route
        path="/customer/new-claim"
        element={
          <ProtectedRoute
            allowedRoles={[
              "Customer",
            ]}
          >
            <CreateClaim />
          </ProtectedRoute>
        }
      />


      <Route
        path="/customer/claims/:id"
        element={
          <ProtectedRoute
            allowedRoles={[
              "Customer",
            ]}
          >
            <ClaimDetails />
          </ProtectedRoute>
        }
      />


      {/* AGENT */}

      <Route
        path="/agent"
        element={
          <ProtectedRoute
            allowedRoles={[
              "Agent",
              "SeniorAgent",
            ]}
          >
            <AgentDashboard />
          </ProtectedRoute>
        }
      />


      {/* DEFAULT */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />


      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );

}


export default function App() {

  return (
    <BrowserRouter>

      <AuthProvider>

        <AppRoutes />

      </AuthProvider>

    </BrowserRouter>
  );

}
