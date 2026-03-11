import React from 'react';
import photo1 from '../../assets/20250824_1647_Formal Attire Enhancement_remix_01k3dwkwyfenjbxsbqv9jwwszn (2) (1).png';
import photo2 from '../../assets/T096YEF814L-U0AHS3A8Y5A-7c72906a102c-512.jpg';
import photo3 from '../../assets/T096YEF814L-U0AJGNXKWAC-85839ce9a135-512.jpg';
/* Custom animations */
const STYLES = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  @keyframes pulse-ring {
    0% { transform: scale(1); opacity: 0.3; }
    50% { transform: scale(1.05); opacity: 0.6; }
    100% { transform: scale(1); opacity: 0.3; }
  }
  @keyframes rotate-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .team-card { animation: fade-in-up 0.8s ease forwards; }
  .team-card:nth-child(1) { animation-delay: 0.1s; }
  .team-card:nth-child(2) { animation-delay: 0.3s; }
  .team-card:nth-child(3) { animation-delay: 0.5s; }
  .float-animation { animation: float 4s ease-in-out infinite; }
  .pulse-ring { animation: pulse-ring 3s ease-in-out infinite; }
  .rotate-ring { animation: rotate-slow 20s linear infinite; }
`;

const teamMembers = [
  {
    name: 'sufyaan ahmed',
    photo: photo1,
  },
  {
    name: 'Insha fatima',
    photo: photo2,
  },
  {
    name: 'Sreeja',
    photo: photo3,
  },
];

const OurTeam = () => {
  return (
    <>
      <style>{STYLES}</style>
      <section
        className="relative z-10 min-h-screen flex flex-col items-center justify-center py-24 px-6 overflow-hidden"
        style={{ backgroundColor: '#ffffff' }}
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gray-100 rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gray-200 rounded-full blur-3xl opacity-50" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gray-100 rounded-full blur-3xl opacity-40" />
        </div>

        {/* Section Title */}
        <div className="relative mb-20 text-center">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-black tracking-tight">
            Our Team
          </h2>
          <p className="mt-4 text-gray-500 text-lg md:text-xl font-light tracking-wide">
            The minds behind the innovation
          </p>
          <div className="mt-6 w-24 h-1 mx-auto bg-black rounded-full" />
        </div>

        {/* Team Members Grid */}
        <div className="relative flex flex-wrap justify-center gap-16 md:gap-20 lg:gap-28 max-w-6xl">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="team-card flex flex-col items-center group opacity-0"
              style={{ animationFillMode: 'forwards' }}
            >
              {/* Photo Container */}
              <div className="relative float-animation" style={{ animationDelay: `${index * 0.5}s` }}>
                {/* Outer rotating ring */}
                <div 
                  className="absolute -inset-4 rounded-full rotate-ring opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `conic-gradient(from 0deg, transparent, rgba(0,0,0,0.3), transparent, rgba(0,0,0,0.3), transparent)`,
                  }}
                />
                
                {/* Pulsing glow ring */}
                <div 
                  className="absolute -inset-3 rounded-full bg-black pulse-ring opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300"
                />
                
                {/* Main photo container */}
                <div className="relative w-52 h-52 md:w-60 md:h-60 lg:w-64 lg:h-64 rounded-full p-1 bg-gray-200 group-hover:bg-black transition-all duration-500 shadow-xl group-hover:shadow-2xl">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  </div>
                </div>

                {/* Decorative dots */}
                <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-black opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110" />
                <div className="absolute -bottom-1 -left-3 w-3 h-3 rounded-full bg-black opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100" />
              </div>

              {/* Name with underline effect */}
              <div className="mt-8 text-center">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-wide group-hover:text-black transition-all duration-300">
                  {member.name}
                </h3>
                <div className="mt-3 h-0.5 w-0 group-hover:w-full bg-black transition-all duration-500 mx-auto rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default OurTeam;
