using System;
using System.Collections.Generic;
using System.Text;

namespace gen
{
    internal class Encoder
    {
        public static int CalculateWidth(int i)
        {
            if (i < 6) return i + 1;
            if (i < 12) return i + 2;

            return 12;
        }

    }
}
