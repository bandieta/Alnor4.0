using System;
using System.Collections.Generic;
using System.Text;

namespace WindowsApplication1
{
    public class Decoder
    {
        public static string decodeSymbol(string chemoMaterial, string chemoGrubosc)
        {
            return chemoMaterial + "-" + chemoGrubosc;

        }
    }
}
