---
name: generate-reco-table
description: Generates a strictly formatted JSON file from a user-provided content table to populate the CMB2 application recommendations repeater field.
---

# Generate CMB2 JSON

This skill acts as a strict formatting bridge. It takes raw table data provided by the user and constructs the exact JSON schema required by the `api_sync_product.js` script to populate the `reco_rows` CMB2 meta key.

## When to use this skill

- When the user asks to create a json, based on a Word doc table, image, a .txt file OR if he pastes a freeform text describing a fertilizer product's "Crops and rate of use" / "Application Recommendations" table, treat it as a request to produce a JSON file.
- This is helpful for ensuring the exact JSON formatting rules are followed without manual data entry.

## how to use it

1. Read the input: either `wp-content/themes/eurofert-theme/datasheets/<product-slug>.txt`, or the pasted text in the user's message.
2. Parse it into a JavaScript array of row objects, where each object has exactly the keys `crop`, `fertigation`, `foliar`, `time` (all strings).
3. Serialize that array as valid JSON, pretty-printed with 2-space indentation.
4. Write the serialized JSON string to `wp-content/themes/eurofert-theme/datasheets/<product-slug>.json` (overwrite if it exists).
5. Verify the new file by re-reading it from disk and confirming `JSON.parse()` succeeds AND that the parsed value is an array of objects with the four required keys.
6. ONLY if step 5 succeeds AND the input came from a `.txt` file in `./datasheets/`: delete the original text file from `wp-content/themes/eurofert-theme/datasheets/`.

If `products.xlsx` exists in the project root, verify the slug appears in its `slug` column. Warn (don't block) if the slug is not found in the CSV - it might be a typo or a brand new product not yet added.

### What the `.json` content MUST be

A valid JSON array, like:
\`\`\`json
[
{
"crop": "Vegetables (GH/Open Field)",
"fertigation": "1.5 - 3 L / GH/500 m2",
"foliar": "200 - 300 ml / 100 L Water",
"time": "During vegetative growth stages"
}
]
\`\`\`

## understanding the source table

> **Note - Application Rate Grouping:** The source table might group the "Fertigation" and "Foliar" columns under a single overarching parent header called "Application Rate". Always map the underlying data accurately to the fertigation and foliar JSON keys.

## Extraction rules

1. **Row order**: each row of the source table maps to one object in the JSON array. Preserve the source's row order.

2. **Preserve text exactly**: Do not invent or correct missing words in the row data. Output the cell values exactly as they appear in the source. If the actual cell value for a row is simply the word "crops" or "field crops", keep it exactly as written (e.g., `"crop": "crops"`). Do not discard it assuming it is a header.

3. **Preserve special characters literally**: `²`, `–` (en-dash), `&`, `°`, parentheses, etc. Do NOT normalize `m2` to `m²` or `-` to `–`. The PHP layer handles display conversion downstream.

4. **Whitespace around numeric range hyphens**: when a hyphen `-` sits between two numbers with no space, add a single space on each side.
   - `5-10 L/ha` → `5 - 10 L/ha`
   - `2-4 kg/500 m²` → `2 - 4 kg/500 m²`
   - `12-15 Kg/ha` → `12 - 15 Kg/ha`
   - Apply only to hyphens between digits. Do NOT change hyphens inside words ("growth-stage" stays as is).
   - Do NOT change en-dashes `–` (they're already spaced in source).

5. **Multi-line cells in fertigation**: when a single cell holds two or more values on separate lines (e.g., one for greenhouses and one for hectares), join them with a literal `\n` (newline).
   - Example source: `1.5 - 3 L / GH/500 m²` on line 1, `10 - 20 L / Ha` on line 2.
   - JSON: `"fertigation": "1.5 - 3 L / GH/500 m²\n10 - 20 L / Ha"`

6. **Fertigation & Foliar Rates**:
   - **Duplicate (Default for single values / Merged Columns)**: If a row has only one rate because the cell is visually merged across the columns (i.e. there is no vertical divider line `|` between them for that row, or the text is centered across both columns), duplicate that value into BOTH `fertigation` and `foliar`. This triggers a `colspan="2"` in the product page template, displaying it as a single merged column.
   - **Empty Foliar**: Set `foliar` to `""` ONLY IF there is a clear vertical line/border separating the columns in that row and the foliar cell is left empty (blank). Do not assume it is merged if the border line is clearly separating them.
   - **Explicit Flags**: Set `foliar` to `""` if the entire table lacks a Foliar column, or if the text row explicitly ends with `[foliar-empty]` (strip this tag from the final JSON).

7. **Ignore decoration**: footnotes, asterisks pointing to commentary (`**Not recommended for…`), highlighted backgrounds, merged-header decorations, table column-group labels like "Application Rate". Extract only the text content of data cells.

8. **Crop names may include parentheses or extra qualifiers** like "Vegetables (GH/Open Field)" or "Vegetables Green houses Open Field". Preserve them verbatim; do not split or simplify.

9. **When in doubt, ask**: if a row's structure is genuinely ambiguous (e.g. you can't tell which column a value belongs to), ask the user before writing the file. Never silently guess.

## Output style

- JSON should be pretty-printed with 2-space indentation.
- String values use double quotes.
- The final element of an array has no trailing comma.
