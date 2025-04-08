import DiscordIcon from "~~/app/_assets/icons/DiscordIcon";
import EmailIcon from "~~/app/_assets/icons/EmailIcon";
import GithubIcon from "~~/app/_assets/icons/GithubIcon";
import InstagramIcon from "~~/app/_assets/icons/InstagramIcon";
import TelegramIcon from "~~/app/_assets/icons/TelegramIcon";
import XIcon from "~~/app/_assets/icons/XIcon";
import { UserByAddress, UserSocials } from "~~/services/database/repositories/users";

export type Social = {
  label: string;
  placeholder: string;
  getLink?: (value: string) => string | null;
  weight: number;
  icon: React.ComponentType<{ className: string }>;
};

export const socials: Record<keyof UserSocials, Social> = {
  socialTelegram: {
    label: "Telegram",
    placeholder: "Your Telegram handle without the @",
    getLink: (value: string) => `https://telegram.me/${value}`,
    weight: 0,
    icon: TelegramIcon,
  },
  socialX: {
    label: "X",
    placeholder: "Your X username without the @",
    getLink: (value: string) => `https://x.com/${value}`,
    weight: 1,
    icon: XIcon,
  },
  socialDiscord: {
    label: "Discord",
    placeholder: "Your Discord username#id",
    weight: 2,
    icon: DiscordIcon,
  },
  socialGithub: {
    label: "GitHub",
    placeholder: "Your GitHub username",
    getLink: (value: string) => `https://github.com/${value}`,
    weight: 3,
    icon: GithubIcon,
  },
  socialEmail: {
    label: "E-mail",
    placeholder: "Your e-mail address",
    getLink: (value: string) => `mailto:${value}`,
    weight: 4,
    icon: EmailIcon,
  },
  socialInstagram: {
    label: "Instagram",
    placeholder: "Your Instagram handle without the @",
    getLink: (value: string) => `https://instagram.com/${value}`,
    weight: 5,
    icon: InstagramIcon,
  },
};

// Get the user socials from the database
export const getUserSocials = (user: NonNullable<UserByAddress>): UserSocials => {
  return Object.fromEntries(
    Object.entries(socials)
      .map(([key]) => [key, user[key as keyof UserSocials]])
      .filter(([, value]) => value),
  ) as UserSocials;
};

// Transforms a user's social media data into a sorted, display-ready list
export const getUserSocialsList = (user: NonNullable<UserByAddress>) => {
  const definedSocials = getUserSocials(user);
  return Object.entries(definedSocials)
    .map(([key, value]) => ({
      ...socials[key as keyof UserSocials],
      value,
      key,
    }))
    .sort((a, b) => a.weight - b.weight);
};
