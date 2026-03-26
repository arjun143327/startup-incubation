import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Cohorts from './pages/Cohorts';
import Applications from './pages/Applications';
import Resources from './pages/Resources';
import Milestones from './pages/Milestones';
import Mentoring from './pages/Mentoring';
import InvestorPipeline from './pages/InvestorPipeline';
import Reports from './pages/Reports';
import Funding from './pages/Funding';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="cohorts" element={<Cohorts />} />
            <Route path="applications" element={<Applications />} />
            <Route path="resources" element={<Resources />} />
            <Route path="milestones" element={<Milestones />} />
            <Route path="mentoring" element={<Mentoring />} />
            <Route path="investors" element={<InvestorPipeline />} />
            <Route path="reports" element={<Reports />} />
            <Route path="funding" element={<Funding />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
