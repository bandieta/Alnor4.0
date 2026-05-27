// Reference extract from original WinForms source:
// /Users/michalbandrowski/Desktop/ALNOR 3.O/AlnorIzoChemoUpdate/AlnorCAM/projekto/Form1.cs
// Decoded from UTF-16LE. This file is for geometry reference only.

if (symbol == "QBa")
{
    int a = Convert.ToInt32(textBox4.Text);
    int b = Convert.ToInt32(textBox5.Text);
    int f = Convert.ToInt32(textBox7.Text);
    int ee = Convert.ToInt32(textBox6.Text);
    int r = Convert.ToInt32(textBox8.Text);

    if (!sprawdz_Pormien(r, ee, f)) return;
    if (r < 100) { r = 0; }

    int p = 25;
    int l = 3;

    double max;
    if (a > b) max = a; else max = b;
    if (max > 1000) p = 30;
    if (max > 2501) p = 40;

    max += r + ee;
    if (p > max) max = p;
    if (f > max) max = f;
    if (ee > max) max = ee;

    int mnoznik = 80;
    a = (Int32)(a / max * mnoznik);
    b = (Int32)(b / max * mnoznik);
    p = (Int32)(p / max * mnoznik);
    ee = (Int32)(ee / max * mnoznik);
    f = (Int32)(f / max * mnoznik);
    r = (Int32)(r / max * mnoznik);

    int push_x = (Int32)((110 - a - l) % 110 / 2);
    if (push_x < 0) push_x = -push_x;
    int push_y = (Int32)((90 - b) / 2) + 5;

    // Small cross-section rectangle
    Point[] punkty = new Point[4];
    punkty[0].X = 190 + push_x; punkty[0].Y = 20 + push_y;
    punkty[1].X = 190 + a + push_x; punkty[1].Y = 20 + push_y;
    punkty[2].X = 190 + a + push_x; punkty[2].Y = 20 + push_y + b;
    punkty[3].X = 190 + push_x; punkty[3].Y = 20 + push_y + b;

    // Large flange rectangle around cross-section
    Point[] punkty1 = new Point[4];
    punkty1[0].X = 190 - p + push_x; punkty1[0].Y = 20 - p + push_y;
    punkty1[1].X = 190 + p + a + push_x; punkty1[1].Y = 20 - p + push_y;
    punkty1[2].X = 190 + p + a + push_x; punkty1[2].Y = 20 + p + b + push_y;
    punkty1[3].X = 190 - p + push_x; punkty1[3].Y = 20 + p + b + push_y;

    // Left horizontal leg (f x b)
    Point[] punkty2 = new Point[4];
    punkty2[0].X = 20 + push_x; punkty2[0].Y = 20 + push_y;
    punkty2[1].X = 20 + f + push_x; punkty2[1].Y = 20 + push_y;
    punkty2[2].X = 20 + f + push_x; punkty2[2].Y = 20 + b + push_y;
    punkty2[3].X = 20 + push_x; punkty2[3].Y = 20 + b + push_y;

    // Lower vertical leg (b x e)
    Point[] punkty3 = new Point[4];
    punkty3[0] = punkty2[2]; punkty3[0].X += r; punkty3[0].Y += r;
    punkty3[1] = punkty3[0]; punkty3[1].X += b;
    punkty3[2] = punkty3[1]; punkty3[2].Y += ee;
    punkty3[3] = punkty3[0]; punkty3[3].Y += ee;

    // Inner corner radius r
    Rectangle rr = new Rectangle(
        2 * punkty2[2].X - punkty3[0].X,
        punkty2[2].Y,
        2 * (punkty3[0].X - punkty2[2].X),
        2 * (punkty3[0].Y - punkty2[2].Y)
    );
    if (r == 0)
    {
        rr = new Rectangle(new Point(punkty2[1].X - b, punkty2[1].Y), new Size(b * 2, b * 2));
    }
    formGraphics.DrawArc(myPen, rr, 270f, 90f);

    // Outer corner radius r + b
    rr = new Rectangle(
        2 * punkty2[1].X - punkty3[1].X,
        punkty2[1].Y,
        2 * (punkty3[1].X - punkty2[1].X),
        2 * (punkty3[1].Y - punkty2[1].Y)
    );
    if (r != 0)
    {
        formGraphics.DrawArc(myPen, rr, 270f, 90f);
    }

    // Dimension labels drawn in Form1: a, b, e, f, r.
}
