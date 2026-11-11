import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Pages
import { Home } from './pages/Home';
import { About } from './pages/About';
import { HowItWorks } from './pages/HowItWorks';
import { Departments } from './pages/Departments';
import { Contact } from './pages/Contact';
import { FAQ } from './pages/FAQ';
import { Track } from './pages/Track';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { SubmitGrievance } from './pages/SubmitGrievance';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { CMODashboard } from './pages/CMODashboard';
import { OfficerDashboard } from './pages/OfficerDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/track" element={<Track />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/submit" element={<SubmitGrievance />} />
              <Route path="/citizen" element={<CitizenDashboard />} />
              <Route path="/cmo" element={<CMODashboard />} />
              <Route path="/officer" element={<OfficerDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
