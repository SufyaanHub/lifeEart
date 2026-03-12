import React from 'react';
import { TeamCard } from '../cardolve';
import photo1 from '../../assets/20250824_1647_Formal Attire Enhancement_remix_01k3dwkwyfenjbxsbqv9jwwszn (2) (1).png';
import photo2 from '../../assets/T096YEF814L-U0AHS3A8Y5A-7c72906a102c-512.jpg';
import photo3 from '../../assets/T096YEF814L-U0AJGNXKWAC-85839ce9a135-512.jpg';
import hoverPhoto1 from '../../assets/WhatsApp Image 2026-03-12 at 6.45.29 PM.jpeg';
import hoverPhoto2 from '../../assets/WhatsApp Image 2026-03-12 at 6.45.28 PM.jpeg';
import hoverPhoto3 from '../../assets/WhatsApp Image 2026-03-12 at 6.45.27 PM.jpeg';
const teamMembers = [
  {
    name: 'Sufyaan Ahmed',
    photo: photo1,
    hoverPhoto: hoverPhoto1,
    role: 'Lead Systems Developer & UI/UX Engineer',
    email: 'sufyaanahmadx9x@gmail.com'
  },
  {
    name: 'Insha Fatima',
    photo: photo2,
    hoverPhoto: hoverPhoto2,
    role: 'Principal Investigator & Scientific Architect',
    email: 'Inshafatimag970@gmail.com'
  },
  {
    name: 'Sreeja Bhattacharya',
    photo: photo3,
    hoverPhoto: hoverPhoto3,
    role: 'Operations Lead & Research Associate',
    email: 'sreeja04bhattacharya@gmail.com'
  },
];

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * OurTeam is a component that displays a horizontal scroll of team members.
 * Each team member is represented by a TeamCard component.
 * The component also includes some background decorative elements.
 * @returns {React.Component} A React component that displays a horizontal scroll of team members.
 */
/*******  c6e08ad3-fe81-45e6-a596-41cf6f2ba7a0  *******/
const OurTeam = () => {
  return (
    <>
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;  /* Internet Explorer 10+ */
          scrollbar-width: none;  /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;  /* Safari and Chrome */
        }
      `}</style>
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

      {/* Team Members Horizontal Scroll */}
      <div className="relative w-full max-w-7xl">
        <div className="flex gap-8 justify-center overflow-x-auto scrollbar-hide pb-4 px-4">
          {teamMembers.map((member, index) => (
            <TeamCard 
              key={index}
              name={member.name}
              photo={member.photo}
              hoverPhoto={member.hoverPhoto}
              role={member.role}
              email={member.email}
              className="transform hover:scale-105 transition-transform duration-300"
            />
          ))}
        </div>
      </div>
    </section>
    </>
  );
};

export default OurTeam;
