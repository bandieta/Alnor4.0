using System;
using System.Collections.Generic;
using System.Text;

namespace WindowsApplication1
{
    public class ThicknessCalc
    {
        public static int CalculateThikness(string material, int bokA, int bokB)
        {
            int a = Math.Max(bokA, bokB);

            if (material == "PVC")
            {
                if (a <= 499) return 4;
                if (a <= 799) return 5;
                if (a <= 999) return 6;
                if (a <= 1199) return 8;
                if (a <= 1500) return 10;
                return 12;
            }

            if (a <= 400) return 4;
            if (a <= 600) return 5;
            if (a <= 800) return 6;
            if (a <= 1000) return 8;
            if (a <= 1200) return 10;
            return 12;

        }
    }
}
    