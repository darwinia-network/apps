import { projects as getProjects } from "../config/projects";
import { useTranslation } from "react-i18next";
import { PortalTag } from "../types";
import { useEffect, useMemo, useRef, useState } from "react";
import { PortalItem } from "./PortalItem";

type FilterTag = PortalTag | "All";

const ALL_TAGS: FilterTag[] = [
  "All",
  "Defi",
  "Wallet",
  "Explorer",
  "Infrastructure",
  "Bridge",
  "Governance",
  "Gaming",
  "NFT",
  "DAO",
  "Tool",
];

export const Projects = () => {
  const { t } = useTranslation();
  const [selectedTag, setSelectedTag] = useState<FilterTag>("All");
  const [flippedPortal, setFlippedPortal] = useState(""); // portal name

  const portalsRef = useRef<HTMLDivElement>(null);

  const projects = useMemo(
    () => getProjects(t).filter(({ tags }) => selectedTag === "All" || tags.includes(selectedTag)),
    [selectedTag, t]
  );

  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (e.target && portalsRef.current && !portalsRef.current.contains(e.target as Node)) {
        setFlippedPortal("");
      }
    };

    document.addEventListener("click", listener);

    return () => {
      document.removeEventListener("click", listener);
    };
  }, []);

  return (
    <div data-aos="fade-up" data-aos-duration={700}>
      <div className="container mx-auto gap-[1.875rem] py-[0.625rem] lg:flex lg:pt-[1.875rem]">
        <div
          className="flex items-start gap-[1.25rem] overflow-auto lg:flex-col"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#FF0083 #FF0083",
          }}
        >
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`text-bold pb-2 text-sm text-white transition hover:opacity-100 active:scale-95 ${
                selectedTag === tag ? "opacity-100" : "opacity-30"
              }`}
            >
              {t(tag)}
            </button>
          ))}
        </div>

        <div
          className={`${
            projects.length
              ? "mt-[0.625rem] grid flex-grow grid-cols-1 gap-[0.625rem] lg:grid-cols-4 lg:gap-5"
              : "mt-10 flex justify-center"
          }`}
          ref={portalsRef}
        >
          {projects.length ? (
            projects.map((meta) => (
              <PortalItem key={meta.name} meta={meta} flipped={flippedPortal} onClick={setFlippedPortal} />
            ))
          ) : (
            <span className="text-bold text-sm text-white/50">No data</span>
          )}
        </div>
      </div>
    </div>
  );
};
