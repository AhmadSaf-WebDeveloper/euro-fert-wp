---
name: Eurofert Database Protocol
description: CRITICAL INSTRUCTIONS. Trigger this skill ONLY when the user mentions "xampp-mysql", "database", "SQL", "wp_postmeta", or data syncing.
---

# Eurofert DB Protocol

**CRITICAL AGENT BOUNDARIES:**

1. **READ-ONLY MCP:** The `xampp-mysql` tool is for inspection only. NEVER use raw SQL (`UPDATE`, `INSERT`, `DELETE`) to modify the database.
2. **CLEAN READS:** Strip ACF references (`field_*`) and raw serialization from `wp_postmeta`. Output plain text.
3. **NORMALIZE (reco_rows):** If `fertigation` or `foliar` has a value but the other is empty, **they are EQUAL**. Copy the known value to the empty field. NEVER leave either blank.
4. **WRITE VIA WP-CLI ONLY:** To update or insert data, you MUST use the terminal with `wp post meta set ... --format=json` or `wp eval-file`. Always append `--path=c:\xampp\htdocs\eurofert`.
5. **MANDATORY PAUSE:** Output the proposed JSON and WP-CLI command as an Artifact. **HALT EXECUTION.** Await explicit user approval before running terminal commands.
