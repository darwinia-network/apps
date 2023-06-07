import logo from "../assets/app-logo.svg";
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
        <a
          className="text-light bg-bg-primary px-[15px] py-[7px] text-sm text-white transition hover:opacity-80 active:scale-95 lg:border lg:border-primary"
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/darwinia-network/apps/blob/master/README.md#how-to-add-your-portal"
        >
          {t("Submit")}
        </a>
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
