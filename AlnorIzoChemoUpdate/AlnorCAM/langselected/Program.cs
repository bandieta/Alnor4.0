using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace langselected
{
    class Program
    {
        static void Main(string[] args)
        {
            foreach (var item in args)
            { Console.Out.WriteLine(item); }

            Console.In.ReadLine();
        }
    }
}
