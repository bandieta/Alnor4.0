using System;
using System.Collections.Generic;
using System.Text;

namespace WindowsApplication1
{
    public interface IMultiLang
    {
        void Translate(Dictionary<string, string> dict);
    }
}
