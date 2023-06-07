import logo from "../assets/app-logo.svg";
import { Link, useMatch } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Header = () => {
  const { t } = useTranslation();
  const isHome = useMatch("/");

  return (
    <div className="container flex items-center justify-between">
      <Link to="/">
        <img alt="..." src={logo} />
      </Link>
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
    </div>
  );
};
