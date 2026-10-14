export interface Colors { bg: string; card: string; digit: string; muted: string; accent: string }
export interface Theme { id: string; zh: string; en: string; style: string; font: string; effect: string; day: Colors; night: Colors }
export const themes: Theme[] = [
  {
    "id": "pure",
    "zh": "纯粹",
    "en": "Pure",
    "style": "minimal",
    "font": "dseg",
    "effect": "none",
    "day": {
      "bg": "#F2F2F7",
      "card": "#FFFFFF",
      "digit": "#1C1C1E",
      "muted": "#6C6C70",
      "accent": "#1C1C1E"
    },
    "night": {
      "bg": "#1C1C1E",
      "card": "#000000",
      "digit": "#FFFFFF",
      "muted": "#8E8E93",
      "accent": "#FFFFFF"
    }
  },
  {
    "id": "bauhaus",
    "zh": "包豪斯",
    "en": "Bauhaus",
    "style": "minimal",
    "font": "jost",
    "effect": "none",
    "day": {
      "bg": "#F1EDE4",
      "card": "#FAF8F3",
      "digit": "#1A1A1A",
      "muted": "#6B6660",
      "accent": "#D7332A"
    },
    "night": {
      "bg": "#141414",
      "card": "#1F1F1F",
      "digit": "#F1EDE4",
      "muted": "#8A857E",
      "accent": "#E0473C"
    }
  },
  {
    "id": "nixie",
    "zh": "辉光管",
    "en": "Nixie",
    "style": "retro",
    "font": "big-shoulders-display",
    "effect": "glow",
    "day": {
      "bg": "#EDE3D6",
      "card": "#2A211C",
      "digit": "#FF7A3D",
      "muted": "#7A5C48",
      "accent": "#C24A17"
    },
    "night": {
      "bg": "#0B0806",
      "card": "#000000",
      "digit": "#FF6A2B",
      "muted": "#9A6A4C",
      "accent": "#FF6A2B"
    }
  },
  {
    "id": "split-flap",
    "zh": "机场翻牌",
    "en": "Split-flap",
    "style": "retro",
    "font": "bebas-neue",
    "effect": "none",
    "day": {
      "bg": "#E9E4DA",
      "card": "#1C1C1C",
      "digit": "#F2F0EA",
      "muted": "#5E5A54",
      "accent": "#C99A00"
    },
    "night": {
      "bg": "#0F0F0F",
      "card": "#1C1C1C",
      "digit": "#EDEAE3",
      "muted": "#77736C",
      "accent": "#E8B90F"
    }
  },
  {
    "id": "polar",
    "zh": "极地",
    "en": "Polar",
    "style": "tech",
    "font": "orbitron",
    "effect": "none",
    "day": {
      "bg": "#ECEFF4",
      "card": "#E5E9F0",
      "digit": "#5E81AC",
      "muted": "#4C566A",
      "accent": "#BF616A"
    },
    "night": {
      "bg": "#2E3440",
      "card": "#3B4252",
      "digit": "#88C0D0",
      "muted": "#A3ADBF",
      "accent": "#EBCB8B"
    }
  },
  {
    "id": "phosphor",
    "zh": "终端绿",
    "en": "Phosphor",
    "style": "tech",
    "font": "vt323",
    "effect": "scan",
    "day": {
      "bg": "#E4ECE4",
      "card": "#F2F6F1",
      "digit": "#1F6B3A",
      "muted": "#4F6B57",
      "accent": "#1F6B3A"
    },
    "night": {
      "bg": "#050A06",
      "card": "#000000",
      "digit": "#7EE29A",
      "muted": "#4F8A60",
      "accent": "#7EE29A"
    }
  },
  {
    "id": "synthwave",
    "zh": "合成波",
    "en": "Synthwave",
    "style": "cyber",
    "font": "monoton",
    "effect": "glow",
    "day": {
      "bg": "#F3E9F5",
      "card": "#FFFFFF",
      "digit": "#C42A8E",
      "muted": "#6B5E8A",
      "accent": "#0A8790"
    },
    "night": {
      "bg": "#262335",
      "card": "#1A1726",
      "digit": "#FF7EDB",
      "muted": "#848BBD",
      "accent": "#36F9F6"
    }
  },
  {
    "id": "neon-city",
    "zh": "霓虹夜城",
    "en": "Neon City",
    "style": "cyber",
    "font": "chakra-petch",
    "effect": "glow",
    "day": {
      "bg": "#EDF3F7",
      "card": "#FFFFFF",
      "digit": "#0A7799",
      "muted": "#5A6A80",
      "accent": "#D6166F"
    },
    "night": {
      "bg": "#0D0B1A",
      "card": "#17122B",
      "digit": "#00F0FF",
      "muted": "#8A7FB0",
      "accent": "#FF2E97"
    }
  },
  {
    "id": "forest",
    "zh": "森林",
    "en": "Forest",
    "style": "nature",
    "font": "jost",
    "effect": "none",
    "day": {
      "bg": "#FDF6E3",
      "card": "#F4F0D9",
      "digit": "#5A7A1E",
      "muted": "#6F7E6E",
      "accent": "#B07D00"
    },
    "night": {
      "bg": "#2D353B",
      "card": "#232A2E",
      "digit": "#A7C080",
      "muted": "#859289",
      "accent": "#DBBC7F"
    }
  },
  {
    "id": "solar",
    "zh": "日光",
    "en": "Solar",
    "style": "nature",
    "font": "share-tech-mono",
    "effect": "none",
    "day": {
      "bg": "#FDF6E3",
      "card": "#EEE8D5",
      "digit": "#1F74B0",
      "muted": "#657B83",
      "accent": "#CB4B16"
    },
    "night": {
      "bg": "#002B36",
      "card": "#073642",
      "digit": "#2AA198",
      "muted": "#839496",
      "accent": "#B58900"
    }
  },
  {
    "id": "latte",
    "zh": "拿铁与摩卡",
    "en": "Latte & Mocha",
    "style": "soft",
    "font": "jost",
    "effect": "none",
    "day": {
      "bg": "#EFF1F5",
      "card": "#E6E9EF",
      "digit": "#8839EF",
      "muted": "#6C6F85",
      "accent": "#EA76CB"
    },
    "night": {
      "bg": "#1E1E2E",
      "card": "#181825",
      "digit": "#CBA6F7",
      "muted": "#A6ADC8",
      "accent": "#F5C2E7"
    }
  },
  {
    "id": "morandi",
    "zh": "莫兰迪",
    "en": "Morandi",
    "style": "soft",
    "font": "bebas-neue",
    "effect": "paper",
    "day": {
      "bg": "#E3DDD5",
      "card": "#EEE9E3",
      "digit": "#5E5257",
      "muted": "#776C66",
      "accent": "#A88F84"
    },
    "night": {
      "bg": "#2B2829",
      "card": "#343031",
      "digit": "#C9B8B0",
      "muted": "#8F8480",
      "accent": "#9FB0A6"
    }
  },
  {
    "id": "ink",
    "zh": "水墨",
    "en": "Ink Wash",
    "style": "eastern",
    "font": "dm-serif-display",
    "effect": "paper",
    "day": {
      "bg": "#EFE9DC",
      "card": "#FFFBF0",
      "digit": "#3D3B4F",
      "muted": "#50616D",
      "accent": "#9D2933"
    },
    "night": {
      "bg": "#16161A",
      "card": "#1E1E24",
      "digit": "#D6ECF0",
      "muted": "#758A99",
      "accent": "#C8505A"
    }
  },
  {
    "id": "ukiyo-e",
    "zh": "浮世绘",
    "en": "Ukiyo-e",
    "style": "eastern",
    "font": "big-shoulders-display",
    "effect": "none",
    "day": {
      "bg": "#F2ECBC",
      "card": "#E5DDB0",
      "digit": "#43436C",
      "muted": "#6A695F",
      "accent": "#C84053"
    },
    "night": {
      "bg": "#1F1F28",
      "card": "#16161D",
      "digit": "#DCD7BA",
      "muted": "#7E7D74",
      "accent": "#7E9CD8"
    }
  },
  {
    "id": "eink",
    "zh": "墨水屏",
    "en": "E-ink",
    "style": "art",
    "font": "dm-serif-display",
    "effect": "paper",
    "day": {
      "bg": "#F4ECD8",
      "card": "#FBF6EA",
      "digit": "#3B3226",
      "muted": "#76695A",
      "accent": "#3B3226"
    },
    "night": {
      "bg": "#1A1814",
      "card": "#221F1A",
      "digit": "#CFC3AA",
      "muted": "#8A7F6C",
      "accent": "#CFC3AA"
    }
  },
  {
    "id": "rose",
    "zh": "晨曦玫瑰",
    "en": "Rosé",
    "style": "art",
    "font": "dm-serif-display",
    "effect": "none",
    "day": {
      "bg": "#FAF4ED",
      "card": "#FFFAF3",
      "digit": "#B4637A",
      "muted": "#797593",
      "accent": "#907AA9"
    },
    "night": {
      "bg": "#191724",
      "card": "#1F1D2E",
      "digit": "#EBBCBA",
      "muted": "#908CAA",
      "accent": "#C4A7E7"
    }
  }
];
export const nightVision: Colors = {bg:"#000000",card:"#050000",digit:"#8B1A1A",muted:"#4A1010",accent:"#8B1A1A"};
