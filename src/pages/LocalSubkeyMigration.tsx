import { Fragment } from "react";
import { Trans, useTranslation } from "react-i18next";
import Identicon from "@polkadot/react-identicon";
import FileSaver from "file-saver";
import { useWallet } from "../hooks/wallet";

export default function LocalSubkeyMigration() {
  const { t } = useTranslation();
  const { isConnected, accounts, connect } = useWallet();

  return (
    <div data-aos="fade-up" data-aos-duration={700}>
      <div className="container m-auto flex flex-col gap-[0.625rem] py-5 lg:gap-5">
        <div className="text-light lg:text-bold lg:p5 rounded-[0.625rem] bg-bg-component p-[0.9375rem] text-xs text-white">
          <Trans>
            {`Here are the accounts you generated on the Darwinia Apps of the old version. You can restore them in the Polkadot{.js} by importing the JSON files. `}
            <a
              href="https://darwinianetwork.medium.com/using-darwinia-tools-3-8-darwinia-apps-lite-guide-part-%E2%85%B0-account-ae9b3347b3c7"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary transition hover:underline hover:opacity-80"
            >
              Tutorial refers here.
            </a>
          </Trans>
        </div>

        <div className="flex flex-col gap-[0.625rem] rounded-[0.625rem] bg-bg-component p-[0.625rem] lg:gap-5 lg:p-5">
          <span className="text-normal lg:text-bold text-xs text-white">{t("Local Accounts")}</span>
          <div className="h-[1px] bg-white/20" />
          {isConnected ? (
            accounts.length ? (
              <div className="flex flex-col gap-[0.625rem]">
                {accounts.map((account, index) => (
                  <Fragment key={index}>
                    <div className="flex gap-[0.625rem]">
                      <Identicon size={40} value={account.address} />
                      <div className="flex flex-col items-start gap-[0.625rem]">
                        <button
                          className="text-thin lg:text-light rounded bg-primary px-2 py-1 text-xs text-white transition hover:opacity-80 active:scale-95"
                          onClick={() => {
                            const blob = new Blob([JSON.stringify(account.json)], {
                              type: "application/json; charset=utf-8",
                            });
                            FileSaver.saveAs(blob, `${account.address}.json`);
                          }}
                        >
                          {t("Export JSON")}
                        </button>
                        <span className="text-thin lg:text-light w-4/5 truncate text-xs text-white/50 lg:w-full">
                          {account.address}
                        </span>
                      </div>
                    </div>
                    {index + 1 !== accounts.length ? <div className="h-[1px] bg-white/20" /> : null}
                  </Fragment>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-[0.625rem]">
                <NoData />
              </div>
            )
          ) : (
            <div className="flex items-center justify-center py-[0.625rem]">
              <NoData className="lg:hidden" />
              <button
                onClick={connect}
                className="text-bold hidden bg-primary px-2 py-1 text-sm text-white transition hover:opacity-80 active:scale-95 lg:inline"
              >
                {t("Connect Wallet")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const NoData = ({ className }: { className?: string }) => {
  const { t } = useTranslation();
  return <span className={`text-light text-xs text-white/50 ${className}`}>{t("No Date")}</span>;
};
