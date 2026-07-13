---
name: format-nutrient-table
description: Generates a strictly formatted text block for Eurofert product nutrient tables (Label|Value) from a user-provided image, spreadsheet row, or raw data, ready to be pasted into the ACF nutrient_table_rows field.
---

# Format Nutrient Table Skill

Use this skill when the user asks you to extract or format a nutrient content table for a Eurofert product from an image, spreadsheet row, or raw text.

## Rules for Formatting Nutrient Tables

1. **Format**: The final output MUST be in `Label|Value` format (exactly one pipe character `|` between label and value) with one entry per line.
2. **Missing/Blank Values**: If a value is blank, a dash `-`, or otherwise missing, **do not include that row** in the output unless specifically instructed to include it.
3. **Zero Values**: If a value is explicitly `0`, include it in the output (e.g. `Ammoniacal-N (NH4-N)|0`).
4. **Asterisks/Symbols**: Preserve symbols like asterisks in the labels (e.g., `Copper*`) unless instructed to strip them.
5. **No extra characters**: Do not add extra pipe characters, tabs, or blank lines. The PHP parser requires a strict structure to avoid throwing internal error notices. 
6. **Delivery**: Provide the output in a raw code block so the user can easily copy and paste it into their spreadsheet or WordPress ACF field.

## Example Input vs Output

**Input (from spreadsheet row):**
Total Nitrogen: 10
Ammoniacal-N: 0
Nitric-N: 5.4
Ureic-N: 4.6
Phosphate: 10
Potassium: 40
Magnesium: -
Sulfur Trioxide: 13.5
Boron: 0.01
Copper*: 0.02

**Output:**
```text
Total Nitrogen|10
Ammoniacal-N (NH4-N)|0
Nitric-N (NO3-N)|5.4
Ureic-N (NH2-N)|4.6
Phosphate (P2O5)|10
Potassium (K2O)|40
Sulfur Trioxide (SO3)|13.5
Boron|0.01
Copper*|0.02
```
