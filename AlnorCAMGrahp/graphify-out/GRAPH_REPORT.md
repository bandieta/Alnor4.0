# Graph Report - AlnorCAMGrahp  (2026-07-23)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 493 nodes · 569 edges · 53 communities (42 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2ce58ce5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Form1
- Form2
- Blacha
- Blacha
- Form
- Form1
- WindowsApplication1.Properties
- Form3
- DictionariesManager
- Form2
- AboutBox1
- AboutBox1
- Form3
- Form4
- WindowsApplication1
- Form3
- Form4
- ksztaltka
- Form6
- Form7
- Info
- Form6
- Form7
- Info
- AboutBox1
- Form2
- Form4
- Info
- AboutBox1
- Form2
- Form4
- Info
- csgl
- loadingdialog
- csgl
- loadingdialog
- MyDataGridRow
- Backup/projekto/Program.cs
- langselected/Program.cs
- projekto/IMultiLang.cs
- MyDataGridRow
- projekto/Program.cs
- Class1.cs
- projekto/gridclass.cs
- Backup/projekto.sln
- projekto.sln
- langselected

## God Nodes (most connected - your core abstractions)
1. `WindowsApplication1` - 58 edges
2. `Blacha` - 29 edges
3. `Blacha` - 29 edges
4. `Form1` - 26 edges
5. `Form1` - 24 edges
6. `Form2` - 13 edges
7. `Form2` - 13 edges
8. `IMultiLang` - 12 edges
9. `DictionariesManager` - 10 edges
10. `AboutBox1` - 9 edges

## Surprising Connections (you probably didn't know these)
- `AboutBox1` --implements--> `IMultiLang`  [EXTRACTED]
  projekto/AboutBox1.cs → Backup/projekto/IMultiLang.cs
- `Form2` --implements--> `IMultiLang`  [EXTRACTED]
  projekto/Form2.cs → Backup/projekto/IMultiLang.cs
- `Form4` --implements--> `IMultiLang`  [EXTRACTED]
  projekto/Form4.cs → Backup/projekto/IMultiLang.cs
- `Info` --implements--> `IMultiLang`  [EXTRACTED]
  projekto/Info.cs → Backup/projekto/IMultiLang.cs
- `Form1` --references--> `datagridviewex`  [EXTRACTED]
  projekto/Form1.Designer.cs → Backup/projekto/datagridviewex.cs

## Import Cycles
- None detected.

## Communities (53 total, 11 thin omitted)

### Community 0 - "Form1"
Cohesion: 0.06
Nodes (26): MouseEventArgs, datagridviewex, BackgroundWorker, BindingSource, Button, ColorDialog, ComboBox, DataGridView (+18 more)

### Community 1 - "Form2"
Cohesion: 0.08
Nodes (12): bool, Dictionary, EventArgs, FormClosingEventArgs, String, Form2, Dictionary, IMultiLang (+4 more)

### Community 4 - "Form"
Cohesion: 0.08
Nodes (13): csgl, EventArgs, FormClosedEventArgs, Form7, loadingdialog, Form, csgl, EventArgs (+5 more)

### Community 5 - "Form1"
Cohesion: 0.08
Nodes (23): CheckBox, BackgroundWorker, BindingSource, Button, ColorDialog, ComboBox, DataGridView, DataGridViewImageColumn (+15 more)

### Community 6 - "WindowsApplication1.Properties"
Cohesion: 0.11
Nodes (14): ApplicationSettingsBase, EventArgs, Form6, Bitmap, CultureInfo, ResourceManager, Resources, Settings (+6 more)

### Community 7 - "Form3"
Cohesion: 0.16
Nodes (7): Dictionary, EventArgs, string, Form3, bool, String, ksztaltka

### Community 8 - "DictionariesManager"
Cohesion: 0.16
Nodes (5): CurrentLanguage, Dictionary, DictionariesManager, Dictionary, DictionariesManager

### Community 9 - "Form2"
Cohesion: 0.17
Nodes (6): bool, Dictionary, EventArgs, FormClosingEventArgs, String, Form2

### Community 10 - "AboutBox1"
Cohesion: 0.20
Nodes (7): Button, IContainer, Label, PictureBox, TableLayoutPanel, TextBox, AboutBox1

### Community 11 - "AboutBox1"
Cohesion: 0.20
Nodes (7): Button, IContainer, Label, PictureBox, TableLayoutPanel, TextBox, AboutBox1

### Community 12 - "Form3"
Cohesion: 0.22
Nodes (6): Button, DateTimePicker, IContainer, Label, TextBox, Form3

### Community 13 - "Form4"
Cohesion: 0.33
Nodes (3): Dictionary, EventArgs, Form4

### Community 14 - "WindowsApplication1"
Cohesion: 0.22
Nodes (5): string, gridclass, WindowsApplication1, CurrentLanguage, ThicknessCalc

### Community 15 - "Form3"
Cohesion: 0.22
Nodes (6): Button, DateTimePicker, IContainer, Label, TextBox, Form3

### Community 16 - "Form4"
Cohesion: 0.33
Nodes (3): Dictionary, EventArgs, Form4

### Community 17 - "ksztaltka"
Cohesion: 0.31
Nodes (3): bool, String, ksztaltka

### Community 18 - "Form6"
Cohesion: 0.25
Nodes (5): IContainer, LinkLabel, PictureBox, RichTextBox, Form6

### Community 19 - "Form7"
Cohesion: 0.25
Nodes (5): IContainer, LinkLabel, PictureBox, RichTextBox, Form7

### Community 20 - "Info"
Cohesion: 0.32
Nodes (3): Dictionary, EventArgs, Info

### Community 21 - "Form6"
Cohesion: 0.25
Nodes (5): IContainer, LinkLabel, PictureBox, RichTextBox, Form6

### Community 22 - "Form7"
Cohesion: 0.25
Nodes (5): IContainer, LinkLabel, PictureBox, RichTextBox, Form7

### Community 23 - "Info"
Cohesion: 0.32
Nodes (3): Dictionary, EventArgs, Info

### Community 24 - "AboutBox1"
Cohesion: 0.33
Nodes (3): Dictionary, EventArgs, AboutBox1

### Community 25 - "Form2"
Cohesion: 0.29
Nodes (4): Button, IContainer, ListBox, Form2

### Community 26 - "Form4"
Cohesion: 0.29
Nodes (4): IContainer, PictureBox, RichTextBox, Form4

### Community 27 - "Info"
Cohesion: 0.29
Nodes (4): Button, IContainer, Label, Info

### Community 28 - "AboutBox1"
Cohesion: 0.33
Nodes (3): Dictionary, EventArgs, AboutBox1

### Community 29 - "Form2"
Cohesion: 0.29
Nodes (4): Button, IContainer, ListBox, Form2

### Community 30 - "Form4"
Cohesion: 0.29
Nodes (4): IContainer, PictureBox, RichTextBox, Form4

### Community 31 - "Info"
Cohesion: 0.29
Nodes (4): Button, IContainer, Label, Info

### Community 32 - "csgl"
Cohesion: 0.33
Nodes (3): IContainer, TextBox, csgl

### Community 33 - "loadingdialog"
Cohesion: 0.33
Nodes (3): IContainer, PictureBox, loadingdialog

### Community 34 - "csgl"
Cohesion: 0.33
Nodes (3): IContainer, TextBox, csgl

### Community 35 - "loadingdialog"
Cohesion: 0.33
Nodes (3): IContainer, PictureBox, loadingdialog

### Community 36 - "MyDataGridRow"
Cohesion: 0.50
Nodes (3): Bitmap, string, MyDataGridRow

### Community 40 - "MyDataGridRow"
Cohesion: 0.50
Nodes (3): Bitmap, string, MyDataGridRow

## Knowledge Gaps
- **5 isolated node(s):** `S`, `langselected`, `langselected`, `S`, `CurrentLanguage`
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `WindowsApplication1` connect `WindowsApplication1` to `Form1`, `Form2`, `Blacha`, `Blacha`, `Form`, `Form1`, `WindowsApplication1.Properties`, `Form3`, `DictionariesManager`, `Form2`, `AboutBox1`, `AboutBox1`, `Form3`, `Form4`, `Form3`, `Form4`, `ksztaltka`, `Form6`, `Form7`, `Info`, `Form6`, `Form7`, `Info`, `AboutBox1`, `Form2`, `Form4`, `Info`, `AboutBox1`, `Form2`, `Form4`, `Info`, `csgl`, `loadingdialog`, `csgl`, `loadingdialog`, `MyDataGridRow`, `Backup/projekto/Program.cs`, `projekto/IMultiLang.cs`, `MyDataGridRow`, `projekto/Program.cs`, `Class1.cs`, `projekto/gridclass.cs`?**
  _High betweenness centrality (0.823) - this node is a cross-community bridge._
- **What connects `S`, `langselected`, `langselected` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Form1` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `Form2` be split into smaller, more focused modules?**
  _Cohesion score 0.08387096774193549 - nodes in this community are weakly interconnected._
- **Should `Blacha` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `Blacha` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `Form` be split into smaller, more focused modules?**
  _Cohesion score 0.07881773399014778 - nodes in this community are weakly interconnected._