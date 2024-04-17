import { PortalMeta } from "../types";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const PortalItem = ({
  meta,
  flipped,
  onClick,
}: {
  meta: PortalMeta;
  flipped: string;
  onClick: (name: string) => void;
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* mobile */}
      <div className="flex gap-[0.625rem] rounded-[0.625rem] bg-bg-component p-[0.9375rem] lg:hidden">
        <img alt="..." src={meta.logo} className="h-[3.125rem] w-[3.125rem] rounded-full" />

        <div className="flex w-fit flex-col gap-[0.625rem]">
          {meta.link.startsWith("//") ? (
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={meta.link}
              className="text-sm font-bold text-white transition hover:opacity-80 active:scale-95"
            >
              {meta.name}
            </a>
          ) : (
            <Link to={meta.link} className="text-light text-sm text-white transition hover:opacity-80 active:scale-95">
              {meta.name}
            </Link>
          )}
          <div className="flex items-center gap-[0.3125rem]">
            {meta.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-[0.313rem] bg-[#FFFFFF1A] px-[0.313rem] py-[0.469rem] text-[0.75rem] text-xs font-light text-white"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="h-[1px] bg-white/20" />
          <span className="text-xs font-light text-white/50">{meta.description}</span>
        </div>
      </div>

      {/* pc */}
      <div className="hidden lg:block" style={{ perspective: 800 }}>
        <div className="card-filp" style={{ ...(flipped === meta.name ? { transform: "rotateY(-180deg)" } : {}) }}>
          <div
            className={`back flex flex-col items-center justify-between bg-bg-component/70 p-5 transition-opacity duration-700 ${
              flipped === meta.name ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="text-bold text-xs text-white">{meta.description}</span>
            {meta.link.startsWith("//") ? (
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={meta.link}
                className="text-bold flex h-[2.3125rem] w-full items-center justify-center bg-primary text-xs text-white transition hover:opacity-80 active:scale-95"
              >
                {t("Explore")}
              </a>
            ) : (
              <Link
                to={meta.link}
                className="text-bold flex h-[2.3125rem] w-full items-center justify-center bg-primary text-xs text-white transition hover:opacity-80 active:scale-95"
              >
                {t("Explore")}
              </Link>
            )}
          </div>
          <div
            className="front flex flex-col items-center justify-center gap-[1.25rem] rounded-[1.25rem] border border-transparent bg-bg-component py-[2.5rem] transition hover:cursor-pointer hover:border-primary active:scale-95 "
            style={{ ...(flipped === meta.name ? { zIndex: -1, opacity: 0.2 } : { opacity: 1 }) }}
            onClick={() => onClick(meta.name)}
          >
            <img alt="..." src={meta.logo} className="h-[3.75rem] w-[3.75rem] rounded-full" />
            <h5 className="text-bold text-center text-lg text-white">{meta.name}</h5>
            <div className="flex items-center gap-[0.625rem]">
              {meta.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-[0.313rem] bg-[#FFFFFF1A] px-[0.313rem] py-[0.469rem] text-xs font-light  text-white"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
