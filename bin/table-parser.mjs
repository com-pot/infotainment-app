import path from "node:path";
import fsp from "node:fs/promises";
import jsdom from "jsdom";

const sources = [
  { lang: "cs", src: "https://www.kraz.eu/cs/program/" },
  { lang: "en", src: "https://www.kraz.eu/en/program/" },
];

async function fetchHtml(src, cacheKey) {
  const cachePath = cacheKey
    ? path.join(import.meta.dirname, "_cache", cacheKey + ".html")
    : null;

  if (cachePath) {
    try {
      const content = await fsp.readFile(cachePath);
      return content;
    } catch (e) {
      // it's ok if file is missing
    }
  }
  const res = await fetch(src);
  const text = await res.text();

  if (cachePath) {
    await fsp.writeFile(cachePath, text);
  }

  return text;
}

function elGetText(element) {
  // Find inner-most element of heading because jsdom does not support .innerText
  let el = element;
  while (el.children[0]) el = el.children[0];

  return el.innerHTML.replace(/\&nbsp;/g, " ").trim();
}

const schedParse = {
  time: (str) => {
    const result = /(\d+\:\d+)(\s*[-–]\s*(\d+\:\d+))?/.exec(str);
    if (!result) return [str];
    return [result[1], result[3]].filter(Boolean);
  },
  item: (str) => {
    console.log(str);

    return {
      title: "",
      description: "",
    };
  },
};

async function loadData(src, locale) {
  const dom = new jsdom.JSDOM(await fetchHtml(src, locale));

  const headings = dom.window.document.querySelectorAll("h3");

  const groups = [];

  for (let heading of headings) {
    const scheduleGroup = elGetText(heading).split(" ", 2)[0];
    const table = heading.nextElementSibling;
    if (!table || table.nodeName !== "TABLE") {
      console.warn("heading is not for table", scheduleGroup, table.nodeName);
      continue;
    }

    let group = groups.find((group) => group.scheduleGroup === scheduleGroup);

    const rows = group?.rows || [];
    table.querySelectorAll("tr").forEach((tr, i) => {
      const [tdTime, tdDescriptiion, tdLocation] = tr.querySelectorAll("td");

      const row = {
        time: schedParse.time(elGetText(tdTime)),
        location: elGetText(tdLocation),

        ...schedParse.item(elGetText(tdDescriptiion)),
      };

      if (row.description === "Co" || row.description === "What") return;

      rows.push(row);
    });

    !group &&
      groups.push({
        scheduleGroup,
        rows,
      });
  }

  return groups;
}

const data = {
  items: [],
  locations: [],
  occurrencesRaw: [],
};

function findOrCreateProgramItem(title, lang, occurrenceKey) {
  let item = data.items.find(
    (location) =>
      location.title[lang] === title ||
      location._occurred.includes(occurrenceKey)
  );

  if (!item) {
    item = {
      id: "sch-i:" + occurrenceKey,
      title: {},
      _occurred: [],
    };
    data.items.push(item);
  }

  item.title[lang] = title;
  item._occurred.push(occurrenceKey);

  return item;
}

function findOrCreateLocation(title, lang, occurrenceKey) {
  let location = data.locations.find(
    (location) =>
      location.title[lang] === title ||
      location._occurred.includes(occurrenceKey)
  );

  if (!location) {
    location = {
      id: "loc:" + occurrenceKey,
      title: {},
      _occurred: [],
    };
    data.locations.push(location);
  }

  location.title[lang] = title;
  location._occurred.push(occurrenceKey);

  return location;
}
for (let source of sources) {
  const { lang, src } = source;
  const sourceDataGroups = await loadData(src, lang);

  sourceDataGroups.forEach((group, iGroup) => {
    const occurrences = group.rows.map((row, iItem) => {
      const occurrenceKey = `${iGroup}-${iItem}`;
      const location = findOrCreateLocation(row.location, lang, occurrenceKey);
      const item = findOrCreateProgramItem(
        row.description,
        lang,
        occurrenceKey
      );

      return {
        item: item.id,
        location: location.id,
        time: row.time,
      };
    });
    data["occurrencesRaw"].push(occurrences);
  });
}

data.locations.forEach((location) => delete location._occurred);
data.items.forEach((programItem) => delete programItem._occurred);

await fsp.writeFile(
  path.join(import.meta.dirname, "schedule.json"),
  JSON.stringify(data, null, 2)
);
