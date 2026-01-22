"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import clsx from "clsx";
import { useAccount } from "wagmi";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useSidebar } from "~~/contexts/SidebarContext";
import { useUser } from "~~/hooks/useUser";
import { UserRole } from "~~/services/database/config/types";
import { UserByAddress } from "~~/services/database/repositories/users";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
  availableForRoles?: UserRole[];
};

export const HeaderMenuLinks = ({ hideItemsByLabel, user }: { hideItemsByLabel?: string[]; user?: UserByAddress }) => {
  const pathname = usePathname();

  const filteredMenuLinks: HeaderMenuLink[] = useMemo(() => {
    const alwaysVisibleMenuLinks: HeaderMenuLink[] = [
      {
        label: "Home",
        href: "/",
      },
    ];

    const userMenuLinks: HeaderMenuLink[] = [
      {
        label: "Portfolio",
        href: user ? `/builders/${user.userAddress}` : "/",
        availableForRoles: [UserRole.USER, UserRole.BUILDER, UserRole.ADMIN],
      },
      {
        label: "Builders",
        href: "/builders",
        availableForRoles: [UserRole.BUILDER, UserRole.ADMIN],
      },
    ];

    let menuLinks = [...alwaysVisibleMenuLinks];

    if (user) {
      menuLinks = [...menuLinks, ...userMenuLinks];
    }

    return menuLinks.filter(({ label, availableForRoles }) => {
      if (hideItemsByLabel?.includes(label)) {
        return false;
      }

      if (availableForRoles && (!user?.role || !availableForRoles.includes(user.role))) {
        return false;
      }

      return true;
    });
  }, [user, hideItemsByLabel]);

  return (
    <>
      {filteredMenuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;

        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "underline" : ""
              } hover:underline py-1.5 lg:py-2 px-3 lg:px-4 text-base font-medium rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const isStartPage = pathname === "/start";

  const { address: connectedAddress } = useAccount();
  const { data: user } = useUser(connectedAddress);
  const sidebar = useSidebar();

  return (
    <div
      className={clsx(
        "sticky lg:static top-0 navbar min-h-0 flex-shrink-0 justify-between z-20 px-0 sm:px-2",
        isStartPage ? "bg-[#F9FEFF] dark:bg-base-200" : "bg-base-300",
      )}
    >
      <div className="navbar-start w-auto lg:w-1/2">
        <div className="flex items-center">
          {!isHomepage && (
            <Link href="/" className={clsx("ml-2 lg:ml-6 lg:mr-4 lg:my-2", isStartPage && "lg:hidden")}>
              <Logo className="w-36 lg:w-48" />
            </Link>
          )}
          {/* Hamburger button - shown only on challenge pages with sidebar */}
          {sidebar?.hasSidebar && !sidebar.isOpen && (
            <button
              onClick={() => sidebar.setIsOpen(true)}
              className="lg:hidden ml-4 btn btn-circle btn-sm btn-primary shadow-lg"
              aria-label="Toggle navigation menu"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>
          )}
          <ul className="hidden lg:flex flex-nowrap px-1 gap-2">
            <HeaderMenuLinks hideItemsByLabel={["Home"]} user={user} />
          </ul>
        </div>
      </div>
      <div className="navbar-end flex-grow mr-2">
        <RainbowKitCustomConnectButton />
      </div>
    </div>
  );
};
