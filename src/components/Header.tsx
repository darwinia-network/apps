import logo from "../assets/app-logo.svg";
import darwiniabtnlogo from "../assets/darwiniabtnlogo.svg";
import headerbtnlogo from "../assets/headerbtnlogo.svg";
import mobileMenuIcon from "../assets/mobileMenuIcon.svg";
import DownArrow from "../assets/DownArrow.svg";
import { Link, useMatch } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useWallet } from "../hooks/wallet";

export const Header = () => {
  const { t } = useTranslation();
  const { isConnected, connect } = useWallet();

  const isHome = useMatch("/");
  const isLocalSubkeyMigration = useMatch("/local_subkey_migration");

  return (
    <div className="container flex items-center justify-between">
      <div className="flex items-center gap-[0.625rem]">
        <Link to="/">
          <img alt="..." src={logo} />
        </Link>
        {isLocalSubkeyMigration ? (
          <span className="text-bold bg-bg-component p-1 text-xs text-white lg:bg-primary">Local Subkey Migration</span>
        ) : null}
      </div>
      {isHome ? (
        <>
          <div className="flex items-center gap-[0.625rem] lg:hidden">
            <a
              className="text-light min-h-[2.25rem] bg-[#242A2E] px-[15px] py-[7px] text-sm text-white transition hover:opacity-80 active:scale-95 lg:border lg:border-primary"
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/darwinia-network/apps/blob/master/README.md#how-to-add-your-portal"
            >
              {t("Submit")}
            </a>
            <button className="h-[2.25rem] w-[2.25rem] bg-[#242A2E] p-[0.625rem] lg:border lg:border-primary">
              <img src={mobileMenuIcon} alt="mobileMenuIcon" className="" />
              <img src={mobileMenuIcon} alt="mobileMenuIcon" className="" />
            </button>
          </div>
          <div className=" hidden items-center gap-[0.625rem] lg:flex">
            <div className="flex cursor-pointer items-center gap-[0.313rem] rounded-[0.313rem] bg-[#242A2E] px-[0.625rem] py-[0.5rem]">
              <img src={darwiniabtnlogo} alt="darwiniabtnlogo" />
              <span className="text-[0.875rem] font-[400] leading-[1.5rem] text-white">Darwinia</span>
              <button
                className="h-[1rem] w-[1rem] bg-cover bg-center"
                style={{ backgroundImage: `url(${DownArrow})` }}
              ></button>
            </div>
            <div className="flex cursor-pointer items-center gap-[0.313rem] rounded-[0.313rem] bg-[#242A2E] px-[0.625rem] py-[0.5rem]">
              <img src={headerbtnlogo} alt="darwiniabtnlogo" />
              <span className="text-[0.875rem] font-[400] leading-[1.5rem] text-white">0x0E5...f204</span>
            </div>
          </div>
        </>
      ) : null}
      {isLocalSubkeyMigration ? (
        <button
          onClick={connect}
          disabled={isConnected}
          className={`text-normal hidden border border-primary px-[15px] py-[7px] text-sm text-white lg:inline ${
            isConnected ? "opacity-80 hover:cursor-not-allowed" : "hover:opacity-80 active:scale-95"
          }`}
        >
          {t("Connect Wallet")}
        </button>
      ) : null}
    </div>
  );
};
