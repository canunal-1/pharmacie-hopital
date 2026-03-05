import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Conseils from "./pages/Catalog";
import ConseilDetail from "./pages/ConseilDetail";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Register from "./pages/Register";
import UserLogin from "./pages/UserLogin";
import Pricing from "./pages/Pricing";
import PaymentSuccess from "./pages/PaymentSuccess";
import { AuthProvider } from "./contexts/AuthContext";
import Chatbot from "./components/Chatbot";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Admin routes (no navbar/footer) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Public routes */}
          <Route path="/*" element={
            <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/conseils" element={<Conseils />} />
                  <Route path="/conseil/:id" element={<ConseilDetail />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/inscription" element={<Register />} />
                  <Route path="/connexion" element={<UserLogin />} />
                  <Route path="/tarifs" element={<Pricing />} />
                  <Route path="/paiement-succes" element={<PaymentSuccess />} />
                </Routes>
              </main>
              <Footer />
              <Chatbot />
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
