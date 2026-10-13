export const OPEN_JM_BRAND = {
  copy: {
    name: "OpenJM",
    poweredBy: "Powered by CrimsontideAI",
  },
  alt: {
    logoWord: "OpenJM logo",
    logoIcon: "OpenJM hummingbird logo",
  },
  logos: {
    icon: "/images/logos/SVG/hummingbird.svg",
    word: "/images/logos/SVG/negative/N5.svg",
    wordDescriptive: "/images/logos/SVG/negative/N4.svg",
    fullVerticalNegative: "/images/logos/SVG/negative/N1.svg",
    fullVerticalPositive: "/images/logos/SVG/positive/P1.svg",
    fullHorizontalNegative: "/images/logos/SVG/negative/N2.svg",
    fullHorizontalPositive: "/images/logos/SVG/positive/P2.svg",
  },
  backgrounds: {
    authBannerClean: "/images/mountainsBackgroundEmpty.png", // used in not found
    publicChat: {
      desktop: "/images/backgrounds/desktop/desktop-public-chat.png",
      mobile: "/images/backgrounds/mobile/mobile-public-chat.png",
    },
    privateChat: {
      desktop: "/images/backgrounds/desktop/desktop-private-chat.png",
      mobile: "/images/backgrounds/mobile/mobile-private-chat.png",
    },
    profile: {
      desktop: "/images/backgrounds/desktop/desktop-profile.png",
      mobile: "/images/backgrounds/mobile/mobile-profile.png",
    },
  },
} as const;

export const OPEN_JM_AUTH_ARTWORK = {
  login: {
    desktop: "/images/backgrounds/desktop/desktop-login.png",
    mobile: "/images/backgrounds/mobile/mobile-login.png",
  },
  register: {
    desktop: "/images/backgrounds/desktop/desktop-register.png",
    mobile: "/images/backgrounds/mobile/mobile-register.png",
  },
  passwordRecovery: {
    desktop: "/images/backgrounds/desktop/desktop-forgot-password.png",
    mobile: "/images/backgrounds/mobile/mobile-forgot-password.png",
  },
  accountCreated: {
    success: {
      desktop: "/images/backgrounds/desktop/desktop-register-success.png",
      mobile: "/images/backgrounds/mobile/mobile-register-success.png",
    },
    error: {
      desktop: "/images/backgrounds/desktop/desktop-register-error.png",
      mobile: "/images/backgrounds/mobile/mobile-register-error.png",
    },
  },
} as const;
