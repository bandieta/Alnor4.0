# Behavioral Hotspots - AlnorCAMGrahpClean

Generated: 2026-07-23
Source graph: graph.json
Filtered graph: graph.behavioral.json

## Filter definition
- Removed relation: contains
- Kept relations: references, method, inherits, calls, implements, imports

## Filtered graph size
- Nodes: 214
- Links: 222

## Top hotspots (degree on filtered links)
1. Blacha (28)
2. Form1 (25)
3. Form2 (12)
4. Form (9)
5. ksztaltka (8)
6. Form3 (8)
7. DictionariesManager (8)
8. AboutBox1 (8)
9. Form4 (7)
10. Form3 (7)
11. Info (6)
12. IMultiLang (6)
13. Form7 (6)
14. Form6 (6)
15. Info (5)
16. Form4 (5)
17. Form2 (5)
18. AboutBox1 (5)
19. loadingdialog (4)
20. csgl (4)

## Refactor priority candidates
- Blacha and Form1: first candidates for dependency decomposition.
- DictionariesManager and IMultiLang: isolate localization contracts and usage boundaries.
- Forms with repeated hotspots (Form2/Form3/Form4/Info): look for duplicated UI + translation patterns to extract shared services.
