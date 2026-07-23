# Graph Report - AlnorCAMGrahpClean  (2026-07-23)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 249 nodes · 286 edges · 23 communities (21 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2ce58ce5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Form1
- WindowsApplication1
- Blacha
- Form
- Form2
- Form3
- IMultiLang
- AboutBox1
- Resources
- DictionariesManager
- Form3
- Form4
- ksztaltka
- Form7
- Info
- Form2
- Form4
- Info
- csgl
- Program.cs

## God Nodes (most connected - your core abstractions)
1. `WindowsApplication1` - 30 edges
2. `Blacha` - 29 edges
3. `Form1` - 26 edges
4. `Form2` - 13 edges
5. `AboutBox1` - 9 edges
6. `DictionariesManager` - 9 edges
7. `Form3` - 9 edges
8. `ksztaltka` - 9 edges
9. `Form3` - 8 edges
10. `Form4` - 8 edges

## Surprising Connections (you probably didn't know these)
- `DictionariesManager` --references--> `CurrentLanguage`  [EXTRACTED]
  DictionariesManager.cs → CurrentLanguage.cs
- `Form2` --implements--> `IMultiLang`  [EXTRACTED]
  Form2.cs → IMultiLang.cs
- `Form3` --implements--> `IMultiLang`  [EXTRACTED]
  Form3.cs → IMultiLang.cs
- `Form4` --implements--> `IMultiLang`  [EXTRACTED]
  Form4.cs → IMultiLang.cs
- `Info` --implements--> `IMultiLang`  [EXTRACTED]
  Info.cs → IMultiLang.cs

## Import Cycles
- None detected.

## Communities (23 total, 2 thin omitted)

### Community 0 - "Form1"
Cohesion: 0.07
Nodes (26): BackgroundWorker, BindingSource, CheckBox, ColorDialog, ComboBox, DataGridView, datagridviewex, DataGridViewImageColumn (+18 more)

### Community 1 - "WindowsApplication1"
Cohesion: 0.07
Nodes (16): Decoder, WindowsApplication1, IContainer, LinkLabel, PictureBox, RichTextBox, Form6, string (+8 more)

### Community 3 - "Form"
Cohesion: 0.14
Nodes (8): csgl, Form, EventArgs, Form6, EventArgs, Form7, FormClosedEventArgs, loadingdialog

### Community 4 - "Form2"
Cohesion: 0.20
Nodes (5): bool, Dictionary, EventArgs, Form2, FormClosingEventArgs

### Community 5 - "Form3"
Cohesion: 0.21
Nodes (5): String, Dictionary, EventArgs, string, Form3

### Community 6 - "IMultiLang"
Cohesion: 0.20
Nodes (5): Dictionary, EventArgs, AboutBox1, Dictionary, IMultiLang

### Community 7 - "AboutBox1"
Cohesion: 0.20
Nodes (7): Button, IContainer, Label, PictureBox, TextBox, AboutBox1, TableLayoutPanel

### Community 8 - "Resources"
Cohesion: 0.22
Nodes (7): ApplicationSettingsBase, WindowsApplication1.Properties, CultureInfo, Bitmap, Resources, Settings, ResourceManager

### Community 9 - "DictionariesManager"
Cohesion: 0.28
Nodes (3): CurrentLanguage, Dictionary, DictionariesManager

### Community 10 - "Form3"
Cohesion: 0.22
Nodes (6): DateTimePicker, Button, IContainer, Label, TextBox, Form3

### Community 11 - "Form4"
Cohesion: 0.33
Nodes (3): Dictionary, EventArgs, Form4

### Community 12 - "ksztaltka"
Cohesion: 0.31
Nodes (3): bool, String, ksztaltka

### Community 13 - "Form7"
Cohesion: 0.25
Nodes (5): IContainer, LinkLabel, PictureBox, RichTextBox, Form7

### Community 14 - "Info"
Cohesion: 0.32
Nodes (3): Dictionary, EventArgs, Info

### Community 15 - "Form2"
Cohesion: 0.29
Nodes (4): Button, IContainer, Form2, ListBox

### Community 16 - "Form4"
Cohesion: 0.29
Nodes (4): IContainer, PictureBox, RichTextBox, Form4

### Community 17 - "Info"
Cohesion: 0.29
Nodes (4): Button, IContainer, Label, Info

### Community 18 - "csgl"
Cohesion: 0.33
Nodes (3): IContainer, TextBox, csgl

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `WindowsApplication1` connect `WindowsApplication1` to `Form1`, `Form`, `Form2`, `Form3`, `IMultiLang`, `AboutBox1`, `Resources`, `DictionariesManager`, `Form3`, `Form4`, `ksztaltka`, `Form7`, `Info`, `Form2`, `Form4`, `Info`, `csgl`, `Program.cs`?**
  _High betweenness centrality (0.839) - this node is a cross-community bridge._
- **Why does `Blacha` connect `Blacha` to `WindowsApplication1`?**
  _High betweenness centrality (0.211) - this node is a cross-community bridge._
- **Why does `Form1` connect `Form1` to `WindowsApplication1`?**
  _High betweenness centrality (0.182) - this node is a cross-community bridge._
- **Should `Form1` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `WindowsApplication1` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `Blacha` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `Form` be split into smaller, more focused modules?**
  _Cohesion score 0.13970588235294118 - nodes in this community are weakly interconnected._