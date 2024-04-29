import hero from "../assets/herobg.png";

export const Hero = () => {
  return (
    <div className="mt-[4rem] flex flex-col items-center justify-center gap-5 px-[0.625rem] py-5 lg:relative lg:mt-[1.875rem] lg:gap-[1.875rem] lg:px-0 lg:py-[4.063rem] ">
      {/* <img alt="..." src={hero} /> */}
      <div
        className="inset-0 h-[189px] w-full bg-cover bg-center lg:absolute  lg:h-auto lg:opacity-[30%]"
        style={{
          backgroundImage: `url(${hero})`,
        }}
      ></div>
      <p className="relative z-10 text-[1.5rem] font-[700] text-white ">
        Explore Dapps building on {"{"}
        <span className="text-primary">Darwinia2</span>
        {"}"} ecosystem_
      </p>
    </div>
  );
};
