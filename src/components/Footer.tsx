// import { useTranslation } from "react-i18next";

import twitter from "../assets/social/twitter.svg";
import telegram from "../assets/social/telegram.svg";
import discord from "../assets/social/discord.svg";
// import element from "../assets/social/element.svg";
import github from "../assets/social/github.svg";
import medium from "../assets/social/medium.svg";
import email from "../assets/social/email.svg";
// import lng from "../assets/lng.svg";

const socialCfg: { icon: string; link: string; isMail?: boolean }[] = [
  {
    icon: twitter,
    link: "https://twitter.com/DarwiniaNetwork",
  },
  {
    icon: telegram,
    link: "https://t.me/DarwiniaNetwork",
  },
  {
    icon: discord,
    link: "https://discord.com/invite/aQdK9H4MZS",
  },
  // {
  //   icon: element,
  //   link: "https://app.element.io/#/room/#darwinia:matrix.org",
  // },
  {
    icon: github,
    link: "https://github.com/darwinia-network",
  },
  {
    icon: medium,
    link: "https://medium.com/darwinianetwork",
  },
  {
    icon: email,
    link: "mailto:hello@darwinia.network",
  },
];

export const Footer = () => {
  // const { i18n } = useTranslation();

  return (
    <div className="container flex items-center justify-between">
      <span className="text-light text-sm text-white/50">© {new Date().getUTCFullYear()} Darwinia Network</span>
      <div className="flex items-center gap-5">
        {socialCfg.map(({ icon, link }, index) => (
          <a
            key={index}
            href={link}
            target="_blank"
            rel="noopener noreferrerF"
            className="transition hover:scale-105 hover:opacity-80"
          >
            <img alt="..." src={icon} />
          </a>
        ))}

        {/* <button
          className="flex items-center gap-[0.3125rem] transition hover:opacity-80 active:scale-95"
          onClick={() => i18n.changeLanguage(i18n.language === "en" ? "zh" : "en")}
        >
          <img alt="..." src={lng} />
          <span className="text-normal text-sm text-white/50">{i18n.language === "en" ? "EN" : "ZH"}</span>
        </button> */}
      </div>
    </div>
  );
};
