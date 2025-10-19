export interface EnumTypeInfo {
  href: string;
  values: Array<{ name: string; value: string; description: string }>;
}

/**
 * Scrapes the Vindral Composer doxygen documentation to find enum details.
 * Since the Composer TYPE has a corresponding ENUM with values; we need to find the type info,
 * combine into a full link (to be able to anchor link to the corresponding ID, not name), then 
 * scrape the enum values from the documentation to populate the select options.
 */
export class EnumTypeScraper {
  static DOXYGEN_URL =
    "https://composer.video/scriptengine/namespace_vindral_engine_base_types_1_1_data_types_1_1_enums.html";

  static async fetchEnumInfo(enumName: string): Promise<EnumTypeInfo | null> {
    try {
      const res = await fetch(EnumTypeScraper.DOXYGEN_URL);
      const html = await res.text();

      // Find the anchor for the enum
      // Credits to CoPilot for the regex help here :)
      const anchorRegex = new RegExp(
        `<a[^>]+href=["'](#.*?)['"][^>]*>(?:\\s*)${enumName}(?:\\s*)<\\/a>`,
        "i"
      );
      const anchorMatch = html.match(anchorRegex);
      if (!anchorMatch) return null;
      const href = anchorMatch[1].startsWith("http")
        ? anchorMatch[1]
        : `${EnumTypeScraper.DOXYGEN_URL}${anchorMatch[1]}`;

      let values: Array<{ name: string; value: string; description: string }> = [];
      if (typeof window !== "undefined" && "DOMParser" in window) {
        
        // Browser environment
        const parser = new window.DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        
        // Find the anchor by ID (from href, strip leading #)
        const anchorId = anchorMatch[1].replace(/^#/, "");
        const anchor = doc.getElementById(anchorId);
        let memitem = null;
        if (anchor) {

          let el = anchor as HTMLElement | null;
          for (let i = 0; i < 10 && el; i++) {
            if (el.classList && el.classList.contains('memitem')) {
              memitem = el;
              break;
            }
            el = el.nextElementSibling as HTMLElement | null;
          }
        }

        // Found it!
        if (memitem) {
          const fieldTable = memitem.querySelector('.memdoc .fieldtable');
          if (fieldTable) {
            values = Array.from(fieldTable.querySelectorAll('tr'))
              .slice(1) // skip header row
              .map(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 3) {
                  return {
                    // Remove &nbsp; and trim
                    name: cells[0].textContent?.replace(/\u00a0/g, '').trim() || "",
                    value: cells[1].textContent?.replace(/\u00a0/g, '').trim() || "",
                    description: cells[2].textContent?.replace(/\u00a0/g, '').trim() || "",
                  };
                }
                return null;
              })
              .filter(Boolean) as Array<{ name: string; value: string; description: string }>;
          }
        }
        return { href, values };
      }
      // fallback: no values
      return {
        href,
        values: [],
      };
    } catch {
      // Yeah this is crazy town, since we're regex:ing HTML. 
      // https://stackoverflow.com/questions/1732348/regex-match-open-tags-except-xhtml-self-contained-tags/1732454#1732454
      return null;
    }
  }
}