import { useRef, useState } from "react";
import { CSSTransition } from "react-transition-group";

const STORE_KEY = "disclaimer";

const getStoreValue = () => {
  const value = localStorage.getItem(STORE_KEY);
  return value === "true" ? true : value === "false" ? false : true;
};

const setStoreValue = (value: boolean) => localStorage.setItem(STORE_KEY, value ? "true" : "false");

export const Disclaimer = () => {
  const [isVisible, setIsVisible] = useState(getStoreValue());
  const nodeRef = useRef<HTMLDivElement | null>(null);

  return (
    <CSSTransition appear timeout={300} in={isVisible} unmountOnExit classNames="fade-disclaimer" nodeRef={nodeRef}>
      <div className="fixed bottom-[10px] right-0 z-10 mx-[0.625rem] lg:bottom-5 lg:right-5 lg:mx-0">
        <div className="flex max-w-[400px] flex-col gap-[10px] border border-primary bg-bg-component p-5" ref={nodeRef}>
          <p className="text-light text-xs text-white">
            The Dapps in the Darwinia Ecosystem are developed independently by third parties and are linked on{" "}
            <a href="https://apps.darwinia.network/" target="_blank" className="text-[#0094FF] hover:underline">
              https://apps.darwinia.network/
            </a>{" "}
            for convenience only. Darwinia does not endorse, or control any of the third-party Dapps in the Darwinia
            Ecosystem, and is not responsible for any damages or losses resulting from the use of, or inability to use,
            these Dapps.
          </p>
          <button
            className="border border-primary py-2 text-center transition-opacity hover:opacity-80 active:opacity-60"
            onClick={() => {
              setIsVisible(false);
              setStoreValue(false);
            }}
          >
            <span className="text-light text-sm text-white">Got it</span>
          </button>
        </div>
      </div>
    </CSSTransition>
  );
};
