export type Social = {
  label: string;
  placeholder: string;
  getLink: (value: string) => string | null;
  weight: number;
  validator?: string;
};

export type UserSocials = {
  socialTelegram?: string;
  socialTwitter?: string;
  socialGithub?: string;
  socialInstagram?: string;
  socialDiscord?: string;
  socialEmail?: string;
};

export const socials: { [key: string]: Social } = {
  socialTelegram: {
    label: "Telegram",
    placeholder: "Your Telegram handle without the @",
    getLink: (value: string) => `https://telegram.me/${value}`,
    weight: 0,
  },
  socialTwitter: {
    label: "Twitter",
    placeholder: "Your Twitter username without the @",
    getLink: (value: string) => `https://twitter.com/${value}`,
    weight: 1,
  },
  socialDiscord: {
    label: "Discord",
    placeholder: "Your Discord username#id",
    getLink: (value: string) => `https://discord.com/users/${value}`,
    weight: 2,
    validator: "discord",
  },
  socialGithub: {
    label: "GitHub",
    placeholder: "Your GitHub username",
    getLink: (value: string) => `https://github.com/${value}`,
    weight: 3,
  },
  socialEmail: {
    label: "E-mail",
    placeholder: "Your e-mail address",
    getLink: (value: string) => `mailto:${value}`,
    weight: 4,
    validator: "email",
  },
  socialInstagram: {
    label: "Instagram",
    placeholder: "Your Instagram handle without the @",
    getLink: (value: string) => `https://instagram.com/${value}`,
    weight: 5,
  },
};
