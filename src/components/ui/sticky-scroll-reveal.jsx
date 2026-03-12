"use client";
import React, { useMemo, useRef } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { cn } from "@/lib/utils";

const MotionDiv = motion.div;
const MotionH2 = motion.h2;
const MotionP = motion.p;

export const StickyScroll = ({
  content,
  contentClassName,
  heading
}) => {
  const [activeCard, setActiveCard] = React.useState(0);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    // uncomment line 22 and comment line 23 if you DONT want the overflow container and want to have it change on the entire page scroll
    // target: ref
    container: ref,
    offset: ["start start", "end start"],
  });
  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce((acc, breakpoint, index) => {
      const distance = Math.abs(latest - breakpoint);
      if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
        return index;
      }
      return acc;
    }, 0);
    setActiveCard(closestBreakpointIndex);
  });

  const backgroundColors = [
    "#0f172a", // slate-900
    "#000000", // black
    "#171717", // neutral-900
  ];
  const backgroundGradient = useMemo(
    () => {
      const linearGradients = [
        "linear-gradient(to bottom right, #06b6d4, #10b981)",
        "linear-gradient(to bottom right, #ec4899, #6366f1)",
        "linear-gradient(to bottom right, #f97316, #eab308)",
      ];

      return linearGradients[activeCard % linearGradients.length];
    },
    [activeCard]
  );

  return (
    <MotionDiv
      animate={{
        backgroundColor: backgroundColors[activeCard % backgroundColors.length],
      }}
      className="relative flex flex-col h-[35rem] w-full overflow-hidden px-10 pb-10 pt-6 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
      {heading && (
        <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 text-center mb-8 tracking-tight">{heading}</h2>
      )}
      <div className="flex justify-center space-x-10 flex-1 overflow-y-auto overflow-x-hidden scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]" ref={ref}>
        <div className="div relative flex items-start px-4">
          <div className="max-w-2xl">
            {content.map((item, index) => (
              <div key={item.title + index} className="my-20">
                <MotionH2
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: activeCard === index ? 1 : 0.3,
                  }}
                  className="text-2xl font-bold text-slate-100">
                  {item.title}
                </MotionH2>
                <MotionP
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: activeCard === index ? 1 : 0.3,
                  }}
                  className="text-kg mt-10 max-w-sm text-slate-300">
                  {item.description}
                </MotionP>
              </div>
            ))}
            <div className="h-40" />
          </div>
        </div>
        <div
          style={{ background: backgroundGradient }}
          className={cn(
            "sticky top-10 hidden h-60 w-80 overflow-hidden rounded-md bg-white lg:block",
            contentClassName
          )}>
          {content[activeCard].content ?? null}
        </div>
      </div>
    </MotionDiv>
  );
};
