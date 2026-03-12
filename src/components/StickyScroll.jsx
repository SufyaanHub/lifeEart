"use client";
import React from "react";
import { StickyScroll } from "./ui/sticky-scroll-reveal";
import originVideo from "../assets/Origin_of_life_on_earth_9d38bd473b.mp4";
import protocellVideo from "../assets/A_hightech_scientific_visualization_showing_a_prot_a93cf722e6.mp4";


const content = [
  {
    title: "Predictive Model",
    description:
      "First, a predictive model that explores the origin of life. The idea is to model the conditions under which early proto-cells could form on mineral surfaces like Olivine, based on proton gradients created by water-rock interactions — essentially asking whether asteroid-delivered water could trigger the chemical conditions needed for life to begin.",
    content: (
      <video
        src={originVideo}
        autoPlay
        loop
        muted
        playsInline
        className="h-full w-full object-cover rounded-md"
      />
    ),
  },
  {
    title: "Energy Analysis",
    description:
      "Second, an analysis focused on the finding that when the proton gradient reaches around 150–200 mV of energy, it becomes sufficient to drive metabolic activities — the basic chemical processes that are considered a hallmark of living systems.",
    content: (
      <video
        src={protocellVideo}
        autoPlay
        loop
        muted
        playsInline
        className="h-full w-full object-cover rounded-md"
      />
    ),
  },
];
export function StickyScrollRevealDemo() {
  return (
    <div className="w-full">
      <StickyScroll content={content} heading="Outcome" />
    </div>
  );
}
