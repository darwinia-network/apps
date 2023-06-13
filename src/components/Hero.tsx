import hero from "../assets/hero.png";

export const Hero = () => {
  return (
    <div className="container mx-auto mt-[0.625rem] flex flex-col items-center justify-between gap-5 py-5 lg:mt-[1.875rem] lg:flex-row lg:gap-[1.875rem]">
      <img alt="..." src={hero} />
      <p className="text-bold text-lg text-white lg:text-5xl">
        Explore Dapps building on {"{"}
        <span className="text-primary">Darwinia</span>
        {"}"} ecosystem_
      </p>
    </div>
  );
};
