const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

const DateTime = {
  fromISO(iso, opts = {}) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const day = d.getDate();
    const month = MONTHS[d.getMonth()];
    const year = d.getFullYear();
    if (opts.short) return `${day} ${month.slice(0, 3)}. ${year}`;
    return `${day} ${month} ${year}`;
  },
};

module.exports = { DateTime };
