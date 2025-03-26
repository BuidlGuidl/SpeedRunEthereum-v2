"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { useAccount } from "wagmi";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
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
      {
        label: "Activity",
        href: "/activity",
        availableForRoles: [UserRole.ADMIN],
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
                isActive ? "bg-base-200 shadow-md" : ""
              } hover:bg-base-200 hover:shadow-md focus:!bg-base-200 active:!text-neutral py-1.5 lg:py-2 px-3 lg:px-4 text-sm rounded-full gap-2 grid grid-flow-col`}
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  const { address: connectedAddress } = useAccount();
  const { data: user } = useUser(connectedAddress);

  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  return (
    <div className="sticky lg:static top-0 navbar bg-base-300 min-h-0 flex-shrink-0 justify-between z-20 px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        <div className="lg:hidden dropdown" ref={burgerMenuRef}>
          <label
            tabIndex={0}
            className={`ml-1 btn btn-ghost ${isDrawerOpen ? "hover:bg-base-200" : "hover:bg-transparent"}`}
            onClick={() => {
              setIsDrawerOpen(prevIsOpenState => !prevIsOpenState);
            }}
          >
            <Bars3Icon className="h-1/2" />
          </label>
          {isDrawerOpen && (
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-300 rounded-box w-52"
              onClick={() => {
                setIsDrawerOpen(false);
              }}
            >
              <HeaderMenuLinks user={user} />
            </ul>
          )}
        </div>
        <div className="hidden lg:flex items-center">
          {!isHomepage && (
            <Link href="/" passHref className="ml-6 mr-4 my-2">
              <Logo width={200} height={100} className="h-10" />
            </Link>
          )}
          <ul className="flex flex-nowrap menu menu-horizontal px-1 gap-2">
            <HeaderMenuLinks hideItemsByLabel={["Home"]} user={user} />
          </ul>
        </div>
      </div>
      <div className="navbar-end flex-grow mr-4">
        <RainbowKitCustomConnectButton />
      </div>
    </div>
  );
};
