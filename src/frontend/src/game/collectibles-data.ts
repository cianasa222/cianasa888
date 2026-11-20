// Rare collectibles: catalog, values and bottle-letter lore. Pure data – no
// three.js import, so the store (state.ts) and the menu UI can use it without
// pulling the 3D world in. The 3D builders live in collectibles-models.ts,
// spawning/pickup in collectibles.ts, the display case in MenuCollection.tsx.
//
// Uniqueness rule: every entry is a singular piece. A variant the player owns
// (state.ts `collection`) never spawns again; only if it ever left the
// collection (no mechanic does that today) may exactly this piece turn up
// again. Values are fictional in-game dollars (appraisal only, whole cents) –
// they are never paid out anywhere.
//
// The ids are SAVE KEYS: once a build has shipped they must never change.

export type CollectibleKind = "fossil" | "coin" | "bottle" | "jewellery";

export interface CollectibleDef {
  id: string;
  kind: CollectibleKind;
  name: string;
  /** One-line display-case description (era, material, where it turns up). */
  desc: string;
  /** Appraised value in whole cents – display only, never paid out. */
  valueCents: number;
  /** The letter inside (message bottles only) – readable in the display case. */
  letter?: string;
}

export const KIND_NAMES: Record<CollectibleKind, string> = {
  fossil: "化石",
  coin: "古钱币",
  bottle: "漂流瓶信件",
  jewellery: "珠宝",
};

export const COLLECTIBLE_KINDS: readonly CollectibleKind[] = [
  "fossil",
  "coin",
  "bottle",
  "jewellery",
];

export const COLLECTIBLES: CollectibleDef[] = [
  // -------------------------------------------------------------- fossils --
  {
    id: "fossil_ammonite",
    kind: "fossil",
    name: "肋纹菊石",
    desc: "侏罗纪海螺的螺旋壳，约 1.8 亿年历史；冬季风暴把它们从东崖下的黏土中冲出来。",
    valueCents: 12000,
  },
  {
    id: "fossil_trilobite",
    kind: "fossil",
    name: "板岩三叶虫",
    desc: "奥陶纪海底爬行者，压进板岩之中——比鱼古老，比树古老，比昆虫古老。",
    valueCents: 9500,
  },
  {
    id: "fossil_shark_tooth",
    kind: "fossil",
    name: "巨齿鲨牙齿",
    desc: "中新世巨鲨的锯齿状牙齿；历经两千万年埋沙，牙釉质依然锋利。",
    valueCents: 34000,
  },
  {
    id: "fossil_urchin",
    kind: "fossil",
    name: "牧羊人王冠",
    desc: "白垩层中的燧石心形海胆；丘陵地带的人们把它放在窗台上驱雷。",
    valueCents: 4500,
  },
  {
    id: "fossil_fern",
    kind: "fossil",
    name: "蕨类页岩",
    desc: "石炭纪蕨叶，藏于裂开的页岩中——这片叶子最后一次见到阳光，是在青草出现三亿年前。",
    valueCents: 6800,
  },
  {
    id: "fossil_amber",
    kind: "fossil",
    name: "波罗的海琥珀",
    desc: "一块化石树脂，里面困着一只小飞虫；它漂过整个北海，最终来到这片海滩。",
    valueCents: 39500,
  },

  // ---------------------------------------------------------------- coins --
  {
    id: "coin_real",
    kind: "coin",
    name: "八里亚尔银币",
    desc: "锤打而成的八里亚尔银币，铸于波托西，随某艘倒霉的船沉没；盐分已把十字熏黑。",
    valueCents: 9500,
  },
  {
    id: "coin_denarius",
    kind: "coin",
    name: "罗马第纳里乌斯银币",
    desc: "一名军团士兵一天的工钱，磨损的银币；两千年拇指的摩挲几乎把皇帝的头像吻没了。",
    valueCents: 18500,
  },
  {
    id: "coin_doubloon",
    kind: "coin",
    name: "金达布隆",
    desc: "西班牙双埃斯库多金币。黄金不会锈蚀——它闪耀如初，一如被大海夺走的那天。",
    valueCents: 58500,
  },
  {
    id: "coin_penny",
    kind: "coin",
    name: "锤打便士",
    desc: "中世纪银便士，边缘被某个手冷又没良心的人剪过。",
    valueCents: 7500,
  },
  {
    id: "coin_sovereign",
    kind: "coin",
    name: "维多利亚金镑",
    desc: "1887 年的金镑——一个帝国的零花钱，在某个早已被遗忘的周日散步中掉进了沙丘之间。",
    valueCents: 42000,
  },
  {
    id: "coin_cash",
    kind: "coin",
    name: "中国古钱",
    desc: "方孔铸铜钱，百年铜绿；很可能是茶船压舱物中漏出来的。",
    valueCents: 2800,
  },

  // -------------------------------------------------------------- bottles --
  {
    id: "bottle_castaway",
    kind: "bottle",
    name: "守塔人的日志",
    desc: "维多利亚时代的深色酒瓶，覆满藤壶；里面灯塔日志的最后一篇依然干燥。",
    valueCents: 900,
    letter:
      "最后一篇，彭加罗角灯塔，1893 年 3 月 14 日。\n" +
      "委员会决定让灯塔和守塔人一同退役，所以今晚我最后一次登上楼梯，为没有船只的海面点亮了她——只为我自己，或许也为海鸥。\n" +
      "三十一年来，我守着这盏灯。我数过九起沉船，从水里救起过四个活人，他们每个人的脸，我记得比自己的脸还清楚。\n" +
      "无论谁找到它：让某样东西一直燃烧着。不一定非得是灯。\n" +
      "——E·特雷加森，守塔人",
  },
  {
    id: "bottle_wish",
    kind: "bottle",
    name: "波比的愿望",
    desc: "一个小汽水瓶，塞着比手艺更多的希望；里面的愿望是用橙色蜡笔写的。",
    valueCents: 350,
    letter:
      "亲爱的大海：\n" +
      "我叫波比，今年七岁零九个月。爸爸说，如果把愿望寄进大海，它实现得会比生日愿望慢，但更大。\n" +
      "我的愿望是，我们的猫饼干能回家。如果它现在住在另一户人家，那就希望他们对它好一点，给它脆脆的猫粮，不要给湿粮——它只是出于礼貌才假装喜欢湿粮。\n" +
      "如果是海盗捡到了这封信，愿望照样算数。这是规矩。\n" +
      "爱你的，波比（七岁零九个月）",
  },
  {
    id: "bottle_capsule",
    kind: "bottle",
    name: "四年 B 班的时间胶囊",
    desc: "1980 年代的柠檬水瓶，用胶带封着；一封写给 2000 年的信，送达得有点晚。",
    valueCents: 420,
    letter:
      "时间胶囊——2000 年之前请勿打开！\n" +
      "我们是圣梅罗小学四年 B 班，今天是 1985 年 7 月 12 日。留给未来的事实：薯片 10 便士一包。达伦能翘头骑行整整一分钟。我们的老师帕斯科夫人说，到 2000 年汽车都会飞。\n" +
      "所以如果你正开着飞车读这封信，请慢慢开过达伦家门口。那时他大概四十岁，这绝对会让他气坏。\n" +
      "以最工整的字迹签名，\n" +
      "四年 B 班（还有苏珊，她想要自己的一行）",
  },
  {
    id: "bottle_apology",
    kind: "bottle",
    name: "未寄出的道歉",
    desc: "棕色药瓶，滴满烛蜡；它把一句道歉带得比作者本人走得更远。",
    valueCents: 500,
    letter:
      "弗兰克：\n" +
      "这封信我写过无数次开头，每次都烧掉了，所以这次我要把它写完，让潮水替我决定我做不到的事。\n" +
      "关于那条船，你是对的。我卖掉她是因为生气，而我生气是因为父亲把她留给了你而不是我，可这一切都不值得我们之间二十年的沉默。她不过是木板和油漆，弗兰克。你是我的兄弟。\n" +
      "如果它能抵达任何一片海岸，但愿是你的。\n" +
      "——威尔夫",
  },
  {
    id: "bottle_forecast",
    kind: "bottle",
    name: "船长的气压表",
    desc: "淡绿色细颈瓶，系着绳圈；渔民的天气智慧，至今依然可靠。",
    valueCents: 380,
    letter:
      "留给后来在这片水域打鱼的人。\n" +
      "气压表飞速下降、海鸥飞往内陆，意味着到早晨西南风会大作，不管收音机怎么说。别相信岬角外的平静——它先奉承你，然后夺走你的渔具。\n" +
      "今年鲭鱼来得早。每周二都有一只海豹跟着船，像交租一样准时，它已经挣到了它的鱼，所以给它。\n" +
      "如果气压下降时猫正背对着火炉坐着：就待在家里。\n" +
      "——D·H，快乐爱丽丝号船长",
  },
  {
    id: "bottle_coordinates",
    kind: "bottle",
    name: "恒久的约定",
    desc: "钴蓝色瓶子，红蜡封口；两个坐标和一个没有期限的承诺。",
    valueCents: 750,
    letter:
      "如果你不是 R.，请把它放回水里。如果你是 R.：\n" +
      "北纬 49°30′，西经 7°10′。海岸警卫队小屋下面的小湾，那里的岩石像一把椅子，供两个依偎而坐的人坐，你曾笑话我糟糕的划船技术。六月九日，晚上七点，一九六二年。\n" +
      "只要我的腿还能爬下去，每年六月九日我都会在那里。\n" +
      "你说过，大海不会弄丢任何值得留住的东西。证明它，来吧。\n" +
      "——T.",
  },

  // ------------------------------------------------------------ jewellery --
  {
    id: "jewel_ring",
    kind: "jewellery",
    name: "金婚戒",
    desc: "素面 22K 金戒，内侧刻着“A · E · 1911”；从一只冰冷的手指上滑落到潮水线。",
    valueCents: 24000,
  },
  {
    id: "jewel_signet",
    kind: "jewellery",
    name: "缟玛瑙印章戒指",
    desc: "绅士的金印章戒，镶着缟玛瑙台面，家徽经三代人的握手磨得几乎看不见了。",
    valueCents: 31000,
  },
  {
    id: "jewel_pearls",
    kind: "jewellery",
    name: "珍珠项链",
    desc: "一串渐变海水珍珠，丝线金扣；据说从一艘游船上掉进了海里。",
    valueCents: 78000,
  },
  {
    id: "jewel_bracelet",
    kind: "jewellery",
    name: "银链手镯",
    desc: "维多利亚时代的扁链手镯，锈成了风暴灰；扣子合上时仍发出清脆的一声。",
    valueCents: 15500,
  },
  {
    id: "jewel_brooch",
    kind: "jewellery",
    name: "帆船胸针",
    desc: "镀金胸针，是一艘全装帆船的形状，石榴石嵌在货舱的位置；水手送给心上人的礼物。",
    valueCents: 12000,
  },
  {
    id: "jewel_watch",
    kind: "jewellery",
    name: "沉没的怀表",
    desc: "腐蚀的银怀表，停在 7:38；大海收走时间，从不归还。",
    valueCents: 145000,
  },
];

export const COLLECTIBLE_BY_ID: Record<string, CollectibleDef> =
  Object.fromEntries(COLLECTIBLES.map((c) => [c.id, c]));
