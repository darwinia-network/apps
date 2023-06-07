import { web3Accounts, web3Enable } from "@polkadot/extension-dapp";
import { accounts as accountsObs } from "@polkadot/ui-keyring/observable/accounts";
import type { SingleAddress } from "@polkadot/ui-keyring/observable/types";
import { Fragment, useEffect, useState } from "react";
import { from, switchMap, forkJoin } from "rxjs";
import { Trans, useTranslation } from "react-i18next";
import Identicon from "@polkadot/react-identicon";
import FileSaver from "file-saver";

interface Account {
  address: string;
  singleAddress?: SingleAddress;
}

const DAPP_NAME = "darwinia/apps";

export default function LocalSubkeyMigration() {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    const sub$$ = from(web3Enable(DAPP_NAME))
      .pipe(switchMap(() => forkJoin([web3Accounts(), accountsObs.subject.asObservable()])))
      .subscribe({
        next: ([accs, subjectInfo]) => {
          const addresses = Object.keys(subjectInfo);
          const extensionAddresses = accs.map((item) => item.address);
          const localAddresses = addresses.filter((address) => !extensionAddresses.includes(address));

          setAccounts(localAddresses.map((address) => ({ address, singleAddress: subjectInfo[address] })));
        },
        error: (err) => {
          console.error(err);
          setAccounts([]);
        },
      });

    return () => sub$$.unsubscribe();
  }, []);

  // useEffect(() => {
  //   const sub$$ = from(web3Enable(DAPP_NAME))
  //     .pipe(switchMap(() => from(web3Accounts())))
  //     .subscribe({
  //       next(accs) {
  //         setAccounts(accs.map(({ address }) => ({ address })));
  //       },
  //       error(err) {
  //         console.error(err);
  //         setAccounts([]);
  //       },
  //     });

  //   return () => sub$$.unsubscribe();
  // }, []);

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
          {accounts.length ? (
            <div className="flex flex-col gap-[0.625rem]">
              {accounts.map((account, index) => (
                <Fragment key={index}>
                  <div className="flex gap-[0.625rem]">
                    <Identicon size={40} value={account.address} />
                    <div className="flex flex-col items-start gap-[0.625rem]">
                      <button
                        className="text-thin lg:text-light rounded bg-primary px-2 py-1 text-xs text-white transition hover:opacity-80 active:scale-95"
                        onClick={() => {
                          if (account.singleAddress?.json) {
                            const blob = new Blob([JSON.stringify(account.singleAddress.json)], {
                              type: "application/json; charset=utf-8",
                            });
                            FileSaver.saveAs(blob, `${account.address}.json`);
                          }
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
              <span className="text-light text-xs text-white/50">{t("No Date")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
