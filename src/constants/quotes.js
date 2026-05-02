export const POIGNANT_QUOTES = [
  "\"When you are sorrowful look again in your heart, and you shall see that in truth you are weeping for that which has been your delight.\" — Kahlil Gibran",
  "\"The deeper that sorrow carves into your being, the more joy you can contain.\" — Kahlil Gibran",
  "\"Nothing is more precious than independence and freedom.\" — Ho Chi Minh",
  "\"We must accept finite disappointment, but never lose infinite hope.\" — Martin Luther King Jr.",
  "\"Making peace, I have found, is much harder than making war.\" — Gerry Adams",
  "\"Our revenge will be the laughter of our children.\" — Gerry Adams",
  "\"Hope is the thing with feathers that perches in the soul and sings the tune without the words and never stops at all.\" — Emily Dickinson",
  "\"The wound is the place where the light enters you.\" — Rumi",
  "\"All changes, even the most longed for, have their melancholy; for what we leave behind us is a part of ourselves.\" — Anatole France",
  "\"There is a crack in everything. That's how the light gets in.\" — Leonard Cohen",
  "\"Out of suffering have emerged the strongest souls; the most massive characters are seared with scars.\" — Kahlil Gibran",
  "\"I have decided to stick with love. Hate is too great a burden to bear.\" — Martin Luther King Jr.",
  "\"This too shall pass.\" — Persian Proverb",
  "\"Your joy is your sorrow unmasked.\" — Kahlil Gibran",
  "\"Darkness cannot drive out darkness; only light can do that.\" — Martin Luther King Jr.",
  "\"Remember, the storm is a good opportunity for the pine and the cypress to show their strength.\" — Ho Chi Minh",
  "\"We shall overcome because the arc of the moral universe is long, but it bends toward justice.\" — Martin Luther King Jr.",
  "\"I took a deep breath and listened to the old bray of my heart. I am, I am, I am.\" — Sylvia Plath",
  "\"The world breaks everyone and afterward many are strong at the broken places.\" — Ernest Hemingway",
  "\"What is hell? I maintain that it is the suffering of being unable to love.\" — Fyodor Dostoevsky",
  "\"Even the darkest night will end and the sun will rise.\" — Victor Hugo",
  "\"There are no military solutions - dialogue and diplomacy are the only guarantee of lasting peace.\" — Martin McGuinness",
  "\"Sorrow is the joy of the soul in its veiled form.\" — Rabindranath Tagore",
  "\"The only way out is through.\" — Robert Frost",
  "\"In the midst of winter, I found there was, within me, an invincible summer.\" — Albert Camus"
];

export function getRandomQuote() {
  return POIGNANT_QUOTES[Math.floor(Math.random() * POIGNANT_QUOTES.length)];
}
