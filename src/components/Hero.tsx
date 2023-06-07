import { useEffect, useRef } from "react";
import hero from "../assets/hero.png";
import Typewriter from "typewriter-effect/dist/core";

export const Hero = () => {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const typewriter = new Typewriter(ref.current, { loop: true, cursor: "_" });
    typewriter
      .pasteString("E")
      .pauseFor(2500)
      .typeString("xplore Dapps building")
      .pauseFor(300)
      .typeString(' on {<span style="color: #FF0083;">Darwinia2</span>} ecosystem')
      .pauseFor(1000)
      .start();
  }, []);

  return (
    <div className="container mx-auto mt-[0.625rem] flex flex-col items-center justify-between gap-5 py-5 lg:mt-[1.875rem] lg:flex-row lg:gap-[1.875rem]">
      <img alt="..." src={hero} />
      <p className="text-bold block text-lg text-white lg:hidden lg:text-5xl">
        Explore Dapps building on {"{"}
        <span className="text-primary">Darwinia2</span>
        {"}"} ecosystem_
      </p>
      <div className="hidden w-full lg:block">
        <p className="text-bold text-lg text-white lg:text-5xl" ref={ref} />
      </div>
    </div>
  );
};
