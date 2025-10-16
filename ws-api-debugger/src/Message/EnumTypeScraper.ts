export interface EnumTypeInfo {
  href: string;
  values: Array<{ name: string; value: string; description: string }>;
}

export class EnumTypeScraper {
  static DOXYGEN_URL =
    "https://composer.video/scriptengine/namespace_vindral_engine_base_types_1_1_data_types_1_1_enums.html";

  static async fetchEnumInfo(enumName: string): Promise<EnumTypeInfo | null> {
    try {
      const res = await fetch(EnumTypeScraper.DOXYGEN_URL);
      const html = await res.text();
      // Find the anchor for the enum
      const anchorRegex = new RegExp(
        `<a[^>]+href=["'](#.*?)['"][^>]*>(?:\\s*)${enumName}(?:\\s*)<\\/a>`,
        "i"
      );
      const anchorMatch = html.match(anchorRegex);
      if (!anchorMatch) return null;
      const href = anchorMatch[1].startsWith("http")
        ? anchorMatch[1]
        : `${EnumTypeScraper.DOXYGEN_URL}${anchorMatch[1]}`;

      // Use DOMParser to extract the enum table
      let values: Array<{ name: string; value: string; description: string }> = [];
      if (typeof window !== "undefined" && "DOMParser" in window) {
        // Browser environment
        const parser = new window.DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        // Find the anchor by ID (from href, strip leading #)
        const anchorId = anchorMatch[1].replace(/^#/, "");
        const anchor = doc.getElementById(anchorId);
        console.log("[EnumTypeScraper] anchor by id:", anchor);
        let memitem = null;
        if (anchor) {
          // Doxygen structure: anchor is followed by h2, then .memitem
          let el = anchor;
          for (let i = 0; i < 10 && el; i++) {
            if (el.classList && el.classList.contains('memitem')) {
              memitem = el;
              break;
            }
            el = el.nextElementSibling;
          }
        }
        console.log("[EnumTypeScraper] memitem (walked):", memitem);
        if (memitem) {
          const fieldTable = memitem.querySelector('.memdoc .fieldtable');
          console.log("[EnumTypeScraper] fieldTable:", fieldTable);
          if (fieldTable) {
            values = Array.from(fieldTable.querySelectorAll('tr'))
              .slice(1) // skip header row
              .map(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 3) {
                  return {
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
        console.log("[EnumTypeScraper] values:", values);
        return { href, values };
      }
      // fallback: no values or not in browser
      return {
        href,
        values: [],
      };
    } catch {
      return null;
    }
  }
}