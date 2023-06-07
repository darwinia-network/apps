import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <div className="relative min-h-screen bg-bg-primary">
      <div className="fixed left-0 top-0 z-10 flex h-[3.125rem] w-full items-center justify-center bg-primary lg:h-[3.75rem] lg:bg-bg-primary">
        <Header />
      </div>

      <div className="pb-0 pt-[3.125rem] lg:pb-[4.375rem] lg:pt-[3.75rem]">
        <Outlet />
      </div>

      <div className="absolute bottom-0 left-0 hidden h-[4.375rem] w-full items-center justify-center lg:flex">
        <Footer />
      </div>
    </div>
  );
}

export default App;
