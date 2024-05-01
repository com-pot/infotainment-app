import path from "node:path";
import fsp from "node:fs/promises";
import jsdom from "jsdom";

async function fetchHtml(src, cachePath) {
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

const titleAliases = {
  "Apples": "Pears",
}

const schedParse = {
  time: (str) => {
    const result = /(\d+\:\d+)(\s*[-–]\s*(\d+\:\d+))?/.exec(str);
    if (!result) {
      console.warn("Time unparseable", str);
      return {start: str}
    };

    return {
      start: result[1],
      end: result[3]
    }
  },
  activity: (str) => {
    return {
      title: titleAliases[str] || str,
      description: "",
    };
  },
};

async function loadData(src, locale, cacheDir) {
  const cachePath = cacheDir
    ? path.join(cacheDir, locale + ".html")
    : null;

  const dom = new jsdom.JSDOM(await fetchHtml(src, cachePath));

  const headings = dom.window.document.querySelectorAll("h3");

  const groups = [];

  for (let heading of headings) {
    const headingStr = elGetText(heading)
    const scheduleGroup = headingStr.split(" ", 2)[0];
    const table = heading.nextElementSibling;
    if (!table || table.nodeName !== "TABLE") {
      console.warn("heading is not for table", scheduleGroup, table.nodeName);
      continue;
    }

    let group = groups.find((group) => group.scheduleGroup === scheduleGroup);

    const rows = group?.rows || [];
    table.querySelectorAll("tr").forEach((tr, i) => {
      const [tdTime, tdDescriptiion, tdLocation] = tr.querySelectorAll("td");
      const timeStr = elGetText(tdTime)

      if (timeStr === "Kdy" || timeStr === "When") return;

      const descriptionStr = elGetText(tdDescriptiion)
      if (!descriptionStr) {
        console.warn("bad description", headingStr, i, descriptionStr);
      }

      const row = {
        location: elGetText(tdLocation),

        ...schedParse.activity(descriptionStr),
      };
      
      if (timeStr) {
        Object.assign(row, schedParse.time(timeStr))
      } else {
        const lastRow = rows.at(-1)
        if (!lastRow) return

        const separator = lastRow.description ? "\n" : ""
        lastRow.description += separator + row.title
        return
      }

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
  activities: [],
  locations: [],
  "occurrences-raw": [],
};

function findOrCreateActivity(title, description, lang, occurrenceKey) {
  let item = data.activities.find(
    (location) =>
      location.title[lang] === title ||
      location._occurred.includes(occurrenceKey)
  );

  if (!item) {
    item = {
      id: "sch-i:" + occurrenceKey,
      title: {},
      description: {},
      _occurred: [],
    };
    data.activities.push(item);
  }

  item.title[lang] = title;
  item.description[lang] = description
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


let sources = [
  { lang: "cs", src: "https://www.example.net/cs/program/" },
  { lang: "en", src: "https://www.example.net/en/program/" },
];

const dir = process.argv[2]
await fsp.readdir(dir)
const cacheDir = path.join(dir, "_cache")
await fsp.mkdir(cacheDir, {recursive: true})

for (let [iSource, source] of Object.entries(sources)) {
  const { lang, src } = source;
  
  const sourceDataGroups = await loadData(src, lang, cacheDir);

  sourceDataGroups.forEach((group, iGroup) => {
    const occurrences = group.rows.map((row, iItem) => {
      const occurrenceKey = `${iGroup}-${iItem}`;
      const location = findOrCreateLocation(row.location, lang, occurrenceKey);
      const activity = findOrCreateActivity(
        row.title,
        row.description,
        lang,
        occurrenceKey
      );

      return {
        activity: activity.id,
        location: location.id,

        day: iGroup - 1, // -1 to compensate for early arrival program
        start: row.start,
        end: row.end,
      };
    });

    if (iSource == 0) {
      data["occurrences-raw"].push(...occurrences);
    }
  });
}

data.locations.forEach((location) => delete location._occurred);
data.activities.forEach((activity) => {
  delete activity._occurred
  if (Object.entries(activity.description).every(([locale, value]) => !value)) {
    delete activity.description
  }
});

for(let [name, dataSection] of Object.entries(data)) {
  await fsp.writeFile(
    path.join(dir, name + ".json"),
    JSON.stringify(dataSection, null, 2)
  );
}


