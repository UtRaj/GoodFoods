import { Link } from 'react-router-dom';
import { ChefHat, Utensils, Calendar, MessageCircle } from 'lucide-react';
import { Header } from '../components/Header';
import { useEffect, useState } from 'react';

export function LandingPage() {
  const [typedText, setTypedText] = useState("");
  const fullText = "Meet Your AI Food Companion";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 60);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100/40 via-white to-purple-50/60 relative">

      <Header />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden">
        {/* spotlight effect */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.25),transparent_60%)] opacity-0 group-hover:opacity-100 transition-all duration-700"></div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.15),transparent)]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-28 relative group">
          <div className="text-center">

            {/* Tag */}
            <span className="inline-block px-5 py-2 rounded-full backdrop-blur-xl bg-white/40 
              text-purple-700 text-sm font-semibold shadow-sm border border-white/30">
              ✨ AI-Powered Restaurant Discovery
            </span>

            {/* Typewriter Heading */}
            <h1
              className="mt-6 text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 
              leading-tight relative overflow-hidden"
            >
              <span className="relative z-10">{typedText}</span>

              {/* blinking cursor */}
              <span className="inline-block w-[3px] h-10 bg-purple-600 ml-1 animate-pulse"></span>

              <span className="block text-transparent bg-clip-text 
                bg-gradient-to-r from-purple-600 to-indigo-500 mt-1
                spotlight-hover relative"
              >
                GoodFoods Awaits
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto 
              leading-relaxed">
              Smart restaurant discovery meets effortless booking.  
              Find hidden gems and reserve tables instantly — powered by your personal AI host.
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/chat"
                className="px-8 py-4 rounded-xl text-lg font-semibold text-white 
                bg-gradient-to-r from-purple-600 to-indigo-500 
                shadow-lg shadow-purple-300/40 hover:shadow-xl hover:scale-[1.03] 
                transition-all duration-300"
              >
                Find My Perfect Restaurant
              </Link>

              <a
                href="#features"
                className="px-8 py-4 rounded-xl text-lg font-semibold
                bg-white/70 text-purple-700 
                border border-purple-200
                shadow-md hover:shadow-lg hover:scale-[1.03]
                transition-all duration-300 backdrop-blur-xl"
              >
                Why GoodFoods?
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">

            <span className="inline-block px-5 py-2 rounded-full bg-purple-100/60 
              text-purple-700 text-sm font-medium backdrop-blur-sm">
              ⚡ Our Core Features!!
            </span>

            <h2 className="mt-6 text-3xl sm:text-4xl font-extrabold text-gray-900">
              Dining Made Simple and Smart
            </h2>
          </div>
        </div>
      </section>

      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {[
          {
            icon: <Utensils className="h-8 w-8 text-purple-600" />,
            title: "50+ Premium Venues",
            description:
              "50+ premium restaurants with real-time availability and detailed menus.",
          },
          {
            icon: <Calendar className="h-8 w-8 text-purple-600" />,
            title: "Quick Reservations",
            description: "Book your table in seconds with our chatbot.",
          },
          {
            icon: <MessageCircle className="h-8 w-8 text-purple-600" />,
            title: "AI Assistant",
            description:
              "Have a conversation, not a form. Tell us what you want, we'll find it.",
          },
        ].map((feature, index) => (
          <div key={index} className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-purple-400 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative p-8 bg-white rounded-xl shadow-lg transition-all group-hover:scale-[1.02]">
              <div className="bg-purple-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 h-[70px]">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="bg-gradient-to-r from-purple-600 to-purple-400 py-16 sm:py-20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Start Your Culinary Journey
            </h2>
            <p className="mt-4 text-xl text-purple-100">
              Your perfect restaurant is just a conversation away.
            </p>
            <div className="mt-8">
              <Link
                to="/chat"
                className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-xl text-purple-600 bg-white hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl"
              >
                Explore Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-6 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <ChefHat className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <span className="text-xl font-bold text-white block">GoodFoods</span>
                <span className="text-sm text-purple-200">
                  Your AI Restaurant Assistant
                </span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                About
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Contact
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800">
            <p className="text-center text-gray-400">
              © 2025 GoodFoods. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
