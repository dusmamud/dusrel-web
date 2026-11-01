"use client";
import { t, type Locale } from "@dusrel/locales";

export type MailboxRailItem = "mail" | "placeholder1" | "placeholder2";

export function MailboxRail({
  locale,
  activeItem,
  onMail,
}: {
  locale: Locale;
  activeItem: MailboxRailItem;
  onMail?: () => void;
}) {
  const comingSoon = t(locale, "shellComingSoon");
  const soonLabel = t(locale, "shellSoon");

  return (
    <nav
      aria-label={t(locale, "shellMail")}
      className="flex h-full w-14 shrink-0 flex-col items-center gap-6 border-r border-slate-200/80 bg-slate-50 py-3.5 dark:border-white/10 dark:bg-[#121212]"
    >
      {/* 1. Mail App */}
      <button
        type="button"
        onClick={onMail}
        aria-label={t(locale, "shellMail")}
        aria-current={activeItem === "mail" ? "page" : undefined}
        className={`group relative flex h-11 w-11 flex-col items-center justify-center rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d90fe]/50 ${
          activeItem === "mail"
            ? "bg-slate-200/70 text-slate-900 dark:bg-white/10 dark:text-white"
            : "text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200"
        }`}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="shrink-0 transition-transform group-hover:scale-105"
        >
          <path
            d="M2.84469 10.9086C2.44479 10.6229 2.24483 10.4801 2.07051 10.4616C1.8098 10.4338 1.54852 10.5683 1.41956 10.7966C1.33332 10.9492 1.33333 11.1922 1.33333 11.6782V20.3217C1.33332 21.395 1.3333 22.2808 1.39226 23.0024C1.45349 23.7519 1.58491 24.4408 1.91463 25.088C2.42596 26.0915 3.24185 26.9074 4.24539 27.4187C4.8925 27.7484 5.58144 27.8798 6.3309 27.9411C7.05249 28 7.93829 28 9.01157 28H22.9884C24.0617 28 24.9475 28 25.6691 27.9411C26.4186 27.8798 27.1075 27.7484 27.7546 27.4187C28.7581 26.9074 29.574 26.0915 30.0854 25.088C30.4151 24.4408 30.5465 23.7519 30.6077 23.0024C30.6667 22.2808 30.6667 21.395 30.6667 20.3218V11.6782C30.6667 11.44 30.6667 11.3209 30.6448 11.2377C30.5462 10.8617 30.1374 10.6475 29.7721 10.7804C29.6912 10.8098 29.5921 10.8785 29.3937 11.0158L19.0709 18.1626C18.339 18.6709 17.6963 19.1172 16.9663 19.2941C16.3277 19.4489 15.6608 19.444 15.0246 19.2799C14.2972 19.0922 13.6612 18.6365 12.9369 18.1175L2.84469 10.9086Z"
            fill="currentColor"
          />
          <path
            d="M29.5104 7.69163C29.7565 7.52123 29.8796 7.43603 29.9552 7.29899C30.0139 7.19257 30.0475 7.02406 30.034 6.90327C30.0167 6.74772 29.9506 6.64503 29.8184 6.43964C29.3119 5.65286 28.5831 5.00341 27.7546 4.5813C27.1075 4.25158 26.4186 4.12016 25.6691 4.05893C24.9475 3.99997 24.0617 3.99998 22.9884 4H9.0116C7.93832 3.99998 7.05249 3.99997 6.3309 4.05893C5.58144 4.12016 4.8925 4.25158 4.24539 4.5813C3.50001 4.96109 2.85573 5.51014 2.36582 6.1778C2.21169 6.38785 2.13462 6.49288 2.10923 6.65227C2.08938 6.77693 2.1171 6.95009 2.17488 7.06232C2.24877 7.20582 2.37692 7.29736 2.63323 7.48044L14.3334 15.8377C15.303 16.5303 15.5088 16.6508 15.6909 16.6978C15.9029 16.7525 16.1252 16.7541 16.3381 16.7025C16.5208 16.6582 16.7283 16.5408 17.708 15.8625L29.5104 7.69163Z"
            fill="currentColor"
          />
        </svg>
        <span className="mt-1 text-[10px] font-medium leading-none">
          {t(locale, "shellMail")}
        </span>
      </button>

      {/* 2. AI Chat (Connected Product) */}
      <button
        type="button"
        disabled
        title={comingSoon}
        aria-label="AI Chat"
        className="group relative flex h-11 w-11 cursor-not-allowed flex-col items-center justify-center rounded-xl text-slate-400 opacity-60 transition-all hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-white/5 dark:hover:text-slate-300"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="shrink-0"
        >
          <path
            d="M20.1667 11.7883C20.1667 13.8875 19.085 15.7483 17.4167 16.9217L16.1883 19.6258C15.9042 20.24 15.0792 20.3592 14.6483 19.8367L13.2917 18.205C11.5867 18.205 10.0192 17.6275 8.8275 16.665L9.3775 16.0142C13.6125 15.6933 16.9583 12.3383 16.9583 8.25C16.9583 7.55333 16.8575 6.86583 16.6742 6.20583C18.755 7.30583 20.1667 9.39583 20.1667 11.7883Z"
            fill="currentColor"
          />
          <path
            d="M14.9417 5.56417C13.8692 3.36417 11.4767 1.83333 8.70833 1.83333C4.91333 1.83333 1.83333 4.7025 1.83333 8.25C1.83333 10.3492 2.915 12.21 4.58333 13.3833L5.81167 16.0875C6.09583 16.7017 6.92083 16.8117 7.35167 16.2983L7.85583 15.6933L8.70833 14.6667C12.5033 14.6667 15.5833 11.7975 15.5833 8.25C15.5833 7.2875 15.3542 6.38 14.9417 5.56417ZM11 8.9375H6.41667C6.04083 8.9375 5.72917 8.62583 5.72917 8.25C5.72917 7.87417 6.04083 7.5625 6.41667 7.5625H11C11.3758 7.5625 11.6875 7.87417 11.6875 8.25C11.6875 8.62583 11.3758 8.9375 11 8.9375Z"
            fill="currentColor"
          />
        </svg>
        <span className="mt-1 text-[10px] font-medium leading-none">AI Chat</span>
      </button>

      {/* 3. VPN (With Status Dot) */}
      <button
        type="button"
        disabled
        title={comingSoon}
        aria-label="VPN"
        className="group relative flex h-11 w-11 cursor-not-allowed flex-col items-center justify-center rounded-xl text-slate-400 opacity-60 transition-all hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-white/5 dark:hover:text-slate-300"
      >
        <div className="relative">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="shrink-0"
          >
            <path
              d="M10.2384 0.907025C10.0803 0.884182 9.91974 0.884182 9.76166 0.907025C9.57947 0.933352 9.40993 0.997398 9.27532 1.04825L9.23925 1.06185L4.66222 2.77811C4.14739 2.97032 3.69528 3.13912 3.34709 3.44597C3.0425 3.71441 2.80786 4.05298 2.66347 4.43244C2.49841 4.8662 2.49911 5.3488 2.49991 5.89833L2.50002 9.99989C2.50002 12.3554 3.78109 14.3192 5.1659 15.7619C6.55998 17.2142 8.15501 18.24 8.99843 18.7321L9.03258 18.7521C9.18649 18.8425 9.38627 18.9598 9.65055 19.0165C9.86676 19.0628 10.1333 19.0628 10.3495 19.0165C10.6138 18.9598 10.8135 18.8425 10.9674 18.7521L11.0016 18.7321C11.845 18.24 13.4401 17.2142 14.8341 15.7619C16.2189 14.3192 17.5 12.3554 17.5 9.99989L17.5001 5.89833C17.5009 5.34879 17.5016 4.8662 17.3366 4.43244C17.1922 4.05298 16.9575 3.71441 16.6529 3.44597C16.3048 3.13912 15.8526 2.97032 15.3378 2.77811L10.7608 1.06185L10.7247 1.04825C10.5901 0.997397 10.4206 0.933352 10.2384 0.907025Z"
              fill="currentColor"
            />
          </svg>
          <span
            className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-slate-50 dark:ring-[#121212]"
            aria-hidden="true"
          />
        </div>
        <span className="mt-1 text-[10px] font-medium leading-none">VPN</span>
      </button>
    </nav>
  );
}
