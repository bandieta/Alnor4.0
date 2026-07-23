using System;
using System.Collections.Generic;

using System.Text;
using System.Drawing;

namespace WindowsApplication1
{
    public class MyDataGridRow
    {
        Bitmap bitmap;
        string name;
        string symbol;

        public MyDataGridRow(Bitmap bi, string a, string b)
        {
            bitmap = bi;
            name = a;
            symbol = b;
        }

        public Bitmap Bitmap
        {
            get { return bitmap; }
            set { bitmap = value; }
        }
        public string Name
        {
            get { return name; }
            set { name = value; }
        }
        public string Symbol
        {
            get { return symbol; }
            set { symbol = value; }
        }
    }
}
