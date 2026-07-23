using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Text;

namespace WindowsApplication1
{
    public class ksztaltka
    {
        public bool obcy;
        public String symbol;
        public String oznaczenie;
        public String nazwa;
        public String sztuk;
        public String uwagi; 
        public String przekroj;
        public String material;

        public String materialChemo;
        public String gruboscChemo;
        public String wykonanieChemo;
        public bool isChemo;

        public string Qnazwa;
        public string Qzamawia;
        public string Qdata;



        public String blacha;
        public String wykonanie;
        public String klasa_szczelnosci;
        public String l_wzmoc;
        public String ramkawl;
        public String ramkawyl;
        public String ramkaod;

        public string powierznia;
        public string powierzniaIz;
        public String pelny_symbol;
        public String pelny_symbolIz;


        public bool izolowana = false;
        public string plaszcz;
        public string gruboscIlozacji;

        public ksztaltka() { }


        public void prawe_menu(String a, String z1, String b, String c, String d,
                               String e, String f, String g,
                               string plaszcz, string gruboscIlozacji, bool izolowana,
                               string matChemo, string gruChemo, bool isChe, string wykoChemo)
        {
            blacha = a;
            material = z1;
            wykonanie = b;
            klasa_szczelnosci = c;
            l_wzmoc = d;
            ramkawl = e;
            ramkawyl = f;
            ramkaod = g;
            this.izolowana = izolowana;
            this.plaszcz = plaszcz;
            this.gruboscIlozacji = gruboscIlozacji;

            materialChemo = matChemo;
            gruboscChemo = gruChemo;
            wykonanieChemo = wykoChemo;
            isChemo = isChe;
        }



        public ksztaltka(String q) { symbol = q; }
        
        // wartosci liczbowe
        public String[] tab = new String[17];

        public void pobierz_wartosci_liczbowe(String a, String b, String c, String d, String e, String f, String g,
                                              String h, String i, String j, String k, String l, String m, String n,
                                              String o, String p, String r)
        {
            tab[0] = a;
            tab[1] = b;
            tab[2] = c;
            tab[3] = d;
            tab[4] = e;
            tab[5] = f;
            tab[6] = g;
            tab[7] = h;
            tab[8] = i;
            tab[9] = j;
            tab[10] = k;
            tab[11] = l;
            tab[12] = m;
            tab[13] = n;
            tab[14] = o;
            tab[15] = p;
            tab[16] = r;
        }

        private static void Add(string[] oRet, int i, double value)
        { oRet[i] = (Convert.ToDouble(oRet[i]) + value).ToString(); }

        public string[] tabIzo()
        {
            string[] oRet = new string[17];
            for (int i = 0; i < tab.Length; i++)
            { oRet[i] = tab[i]; }

            double gg = Convert.ToDouble(gruboscIlozacji.Replace("mm", "").Replace(" ",""));
            double gg2 = gg * 2.0;

            //QDa
            //a = a + 2gg
            //b = b + 2gg
            if (symbol == "QDa")
            {
                Add(oRet, 1, gg2);
                Add(oRet, 2, gg2);
            }
            //QBNa
            //a = a + 2gg
            //b = b + 2gg
            //r = r - gg
            if (symbol == "QBNa" || symbol == "QBa")
            {
                Add(oRet, 1, gg2);
                Add(oRet, 2, gg2);
                Add(oRet, 5, -gg);
            }
            //QPR6a
            //a = a + 2gg
            //b = b + 2gg
            //c = c + 2gg
            //d = d + 2gg
            if (symbol == "QPR6a")
            {
                Add(oRet, 1, gg2);
                Add(oRet, 2, gg2);
                Add(oRet, 3, gg2);
                Add(oRet, 4, gg2);
            }
            //PR1a
            //a = a + 2gg
            //b = b + 2gg
            //d = d + 2gg
            if (symbol == "PR1a")
            {
                Add(oRet, 1, gg2);
                Add(oRet, 2, gg2);
                Add(oRet, 3, gg2);
            }
            //PR7a
            //a = a + 2gg
            //b = b + 2gg
            //d = d + 2gg
            if (symbol == "PR7a")
            {
                Add(oRet, 1, gg2);
                Add(oRet, 2, gg2);
                Add(oRet, 3, gg2);
            }
            //QPR2a
            //a = a + 2gg
            //b = b + 2gg
            //c = c + 2gg
            //d = d + 2gg
            if (symbol == "QPR2a")
            {
                Add(oRet, 1, gg2);
                Add(oRet, 2, gg2);
                Add(oRet, 3, gg2);
                Add(oRet, 4, gg2);
            }
            //QBRa
            //a = a + 2gg
            //b = b + 2gg
            //d = d + 2gg
            //r = r - gg
            if (symbol == "QBRa")
            {
                Add(oRet, 1, gg2);
                Add(oRet, 2, gg2);
                Add(oRet, 3, gg2);
                Add(oRet, 6, -gg);
            }
            //QBR1a
            //a = a + 2gg
            //b = b + 2gg
            //d = d + 2gg
            //r = r - gg
            if (symbol == "QBR1a")
            {
                Add(oRet, 1, gg2);
                Add(oRet, 2, gg2);
                Add(oRet, 4, gg2);
                Add(oRet, 7, -gg);
            }
            //QBFRa
            //a = a + 2gg
            //b = b + 2gg
            //d = d + 2gg
            //r = r - gg
            if (symbol == "QBFRa")
            {
                Add(oRet, 1, gg2);
                Add(oRet, 2, gg2);
                Add(oRet, 3, gg2);
                Add(oRet, 6, -gg);
            }
            //QBFa
            //a = a + 2gg
            //b = b + 2gg
            //r = r - gg
            if (symbol == "QBFa")
            {
                Add(oRet, 1, gg2);
                Add(oRet, 2, gg2);
                Add(oRet, 5, -gg);
            }
            //QESa
            //a = a + 2gg
            //b = b + 2gg
            if (symbol == "QESa")
            {
                Add(oRet, 1, gg2);
                Add(oRet, 2, gg2);
            }
            //TR1a
            //a = a + 2gg
            //b = b + 2gg
            //w = w + 2gg
            //d = d + 2gg
            if (symbol == "TR1a")
            {
                Add(oRet, 1, gg2);
                Add(oRet, 2, gg2);
                Add(oRet, 4, gg2);
                Add(oRet, 3, gg2);
            }
            //TR2a
            //a = a + 2gg
            //b = b + 2gg
            //d = d + 2gg
            if (symbol == "TR2a")
            {
                Add(oRet, 1, gg2);
                Add(oRet, 2, gg2);
                Add(oRet, 3, gg2);
            }
            //TRa
            //a = a + 2gg
            //b = b + 2gg
            //d = d + 2gg
            //h = h + 2gg
            //r = r - gg
            //q = q - gg
            if (symbol == "TRa")
            {
                Add(oRet, 1, gg2);
                Add(oRet, 2, gg2);
                Add(oRet, 3, gg2);
                Add(oRet, 4, gg2);
                Add(oRet, 11, -gg);
                Add(oRet, 10, -gg);
            }
            //QPR3a
            //a = a + 2gg
            //b = b + 2gg
            if (symbol == "QPR3a")
            {
                Add(oRet, 1, gg2);
                Add(oRet, 2, gg2);
            }
            //QPR4a
            //a = a + 2gg
            //b = b + 2gg
            //d = d + 2gg
            if (symbol == "QPR4a")
            {
                Add(oRet, 1, gg2);
                Add(oRet, 2, gg2);
                Add(oRet, 3, gg2);
            }
            //TR6a
            //e = e + 2gg
            //f = f + 2gg
            if (symbol == "TR6a")
            {
                Add(oRet, 1, gg2);
                Add(oRet, 3, gg2);
            }
            //CZ1a
            //a = a + 2gg
            //b = b + 2gg
            //w = w + 2gg
            //d = d + 2gg
            //w1 = w1 + 2gg
            //d1 = d1 + 2gg
            if (symbol == "CZ1a")
            {
                Add(oRet, 1, gg2);
                Add(oRet, 2, gg2);
                Add(oRet, 4, gg2);
                Add(oRet, 3, gg2);
                Add(oRet, 11, gg2);
                Add(oRet, 10, gg2);
            }
            //CZ2a
            //a = a + 2gg
            //b = b + 2gg
            //d = d + 2gg
            //d1 = d1 + 2gg
            if (symbol == "CZ2a")
            {
                Add(oRet, 1, gg2);
                Add(oRet, 2, gg2);
                Add(oRet, 3, gg2);
                Add(oRet, 11, gg2);
            }
            //TR3a
            //a = a + 2gg
            //b = b + 2gg
            //c = c + 2gg
            //d = d + 2gg
            //g = g - gg
            //f = f - gg
            if (symbol == "TR3a")
            {
                Add(oRet, 1, gg2);
                Add(oRet, 2, gg2);
                Add(oRet, 3, gg2);
                Add(oRet, 4, gg2);
                Add(oRet, 9, -gg);
                Add(oRet, 10, -gg);
            }
            //TR4a
            //a = a + 2gg
            //b = b + 2gg
            //c = c + 2gg
            //d = d + 2gg
            //i = i - gg
            if (symbol == "TR4a")
            {
                Add(oRet, 1, gg2);
                Add(oRet, 2, gg2);
                Add(oRet, 3, gg2);
                Add(oRet, 4, gg2);
                Add(oRet, 5, -gg);               
            }
            //TR5a
            //a = a + 2gg
            //b = b + 2gg
            //c = c + 2gg
            //d = d + 2gg
            //e = e + 2gg
            if (symbol == "TR5a")
            {
                Add(oRet, 1, gg2);
                Add(oRet, 2, gg2);
                Add(oRet, 3, gg2);
                Add(oRet, 4, gg2);
                Add(oRet, 5, gg2);
            }
            //QD1a
            //a = a + 2gg
            //b = b + 2gg
            if (symbol == "TR5a")
            {
                Add(oRet, 1, gg2);
                Add(oRet, 2, gg2);
                Add(oRet, 3, gg2);
                Add(oRet, 4, gg2);
                Add(oRet, 5, gg2);
            }
            //QD1a
            //a = a + 2gg
            //b = b + 2gg
            if (symbol == "QD1a")
            {
                Add(oRet, 1, gg2);
                Add(oRet, 2, gg2);
            }
            //TR7a
            //a = a + 2gg
            //b = b + 2gg
            //d = d + 2gg
            //h = h + 2gg
            //p = p - gg
            //j = j - gg
            if (symbol == "TR7a")
            {
                Add(oRet, 1, gg2);
                Add(oRet, 2, gg2);
                Add(oRet, 3, gg2);
                Add(oRet, 4, gg2);
                Add(oRet, 7, gg);
                Add(oRet, 6, gg);
            }
            //TR8a
            //a = a + 2gg
            //b = b + 2gg
            //c = c + 2gg
            //d = d + 2gg
            //w = w + 2gg
            //g = g + 2gg
            if (symbol == "TR8a")
            {
                Add(oRet, 1, gg2);
                Add(oRet, 3, gg2);
                Add(oRet, 9, gg2);
                Add(oRet, 2, gg2);
                Add(oRet, 4, gg);
                Add(oRet, 5, gg);
            }
            //TR9a
            //a = a + 2gg
            //b = b + 2gg
            //c = c + 2gg
            //d = d + 2gg
            //d1 = d1 + 2gg
            if (symbol == "TR9a")
            {
                Add(oRet, 1, gg2);
                Add(oRet, 3, gg2);
                Add(oRet, 9, gg2);
                Add(oRet, 2, gg2);
                Add(oRet, 4, gg);
            }

            return oRet;
        }


        public int pobierzL()
        {
            string L = "0";

            if (symbol == "TR8a")
            {
                L = (tab[6]);
            }

            if (symbol == "TR9a")
            {
                L = tab[5];
            }

            if (symbol == "QDa")
            {
                L = tab[9];
            }

            if (symbol == "QBa")
            {
                //g.A00 = "a =";
                //g.A01 = k.tab[1];
                //g.A02 = "b =";
                //g.A03 = k.tab[2];
                //g.A04 = "e =";
                //g.A05 = k.tab[3];
                //g.A06 = "f =";
                //g.A07 = k.tab[4];
                //g.A08 = "r =";
                //g.A09 = k.tab[5];
            }
            if (symbol == "QBNa")
            {
                //g.A00 = "a =";
                //g.A01 = k.tab[1];
                //g.A02 = "b =";
                //g.A03 = k.tab[2];
                //g.A04 = "e =";
                //g.A05 = k.tab[3];
                //g.A06 = "f =";
                //g.A07 = k.tab[4];
                //g.A08 = "r =";
                //g.A09 = k.tab[5];
                //g.A10 = "alfa =";
                //g.A11 = k.tab[10];
            }
            if (symbol == "QPR6a")
            {
                L = tab[9];
            }
            if (symbol == "PR1a")
            {
                L = tab[9];
            }
            if (symbol == "PR7a")
            {
                L = tab[9];
            }
            if (symbol == "QPR2a")
            {
                L = tab[9];
            }
            if (symbol == "QBRa")
            {
                //g.A00 = "a =";
                //g.A01 = k.tab[1];
                //g.A02 = "b =";
                //g.A03 = k.tab[2];
                //g.A04 = "d =";
                //g.A05 = k.tab[3];
                //g.A06 = "e =";
                //g.A07 = k.tab[4];
                //g.A08 = "f =";
                //g.A09 = k.tab[5];
                //g.A10 = "f =";
                //g.A11 = k.tab[6];
                //g.A12 = "alfa =";
                //g.A13 = k.tab[10];
            }
            if (symbol == "QBR1a")
            {
                //g.A00 = "a =";
                //g.A01 = k.tab[1];
                //g.A02 = "b =";
                //g.A03 = k.tab[2];
                //g.A04 = "c =";
                //g.A05 = k.tab[3];
                //g.A06 = "d =";
                //g.A07 = k.tab[4];
                //g.A08 = "e =";
                //g.A09 = k.tab[5];
                //g.A10 = "f =";
                //g.A11 = k.tab[6];
                //g.A12 = "r =";
                //g.A13 = k.tab[7];
                //g.A14 = "alfa =";
                //g.A15 = k.tab[10];
                //g.A16 = "g = ";
                //g.A17 = k.tab[9];
            }
            if (symbol == "QBFRa")
            {
                //g.A00 = "a =";
                //g.A01 = k.tab[1];
                //g.A02 = "b =";
                //g.A03 = k.tab[2];
                //g.A04 = "d =";
                //g.A05 = k.tab[3];
                //g.A06 = "e =";
                //g.A07 = k.tab[4];
                //g.A08 = "f =";
                //g.A09 = k.tab[5];
                //g.A10 = "f =";
                //g.A11 = k.tab[6];
            }
            if (symbol == "QBFa")
            {
                //g.A00 = "a =";
                //g.A01 = k.tab[1];
                //g.A02 = "b =";
                //g.A03 = k.tab[2];
                //g.A04 = "e =";
                //g.A05 = k.tab[3];
                //g.A06 = "f =";
                //g.A07 = k.tab[4];
                //g.A08 = "r =";
                //g.A09 = k.tab[5];
            }
            if (symbol == "QESa")
            {
                //g.A00 = "a =";
                //g.A01 = k.tab[1];
                //g.A02 = "b =";
                //g.A03 = k.tab[2];
                //g.A04 = "e =";
                //g.A05 = k.tab[3];
            }
            if (symbol == "TR1a")
            {
                L = tab[9];
            }
            if (symbol == "TR2a")
            {
                L = tab[9];
            }
            if (symbol == "TRa")
            {
                L = tab[9];
            }
            if (symbol == "QPR3a")
            {
                L = tab[9];
            }
            if (symbol == "QPR4a")
            {
                L = tab[9];
            }
            if (symbol == "TR6a")
            {
                L = tab[9];
            }
            if (symbol == "CZ1a")
            {
                L = tab[9];
            }
            if (symbol == "CZ2a")
            {
                L = tab[9];
            }
            if (symbol == "TR3a")
            {
                //g.A00 = "a =";
                //g.A01 = k.tab[2];
                //g.A02 = "b =";
                //g.A03 = k.tab[1];
                //g.A04 = "c =";
                //g.A05 = k.tab[3];
                //g.A06 = "d =";
                //g.A07 = k.tab[4];
                //g.A08 = "m =";
                //g.A09 = k.tab[5];
                //g.A10 = "h =";
                //g.A11 = k.tab[6];
                //g.A12 = "i =";
                //g.A13 = k.tab[7];
                //g.A14 = "j =";
                //g.A15 = k.tab[8];

                //g.A16 = "g =";
                //g.A17 = k.tab[9];
                //g.A18 = "f =";
                //g.A19 = k.tab[10];
            }
            if (symbol == "TR4a")
            {
                L = tab[9];
            }
            if (symbol == "TR5a")
            {
                L = tab[9];
            }
            if (symbol == "QD1a")
            {
                L = tab[9];
            }

            if (symbol == "QD2a")
            {
                L = tab[9];
            }

            if (symbol == "TR7a")
            {
                //g.A00 = "a =";
                //g.A01 = k.tab[1];
                //g.A02 = "b =";
                //g.A03 = k.tab[2];
                //g.A04 = "d =";
                //g.A05 = k.tab[3];
                //g.A06 = "h =";
                //g.A07 = k.tab[4];
                //g.A08 = "i =";
                //g.A09 = k.tab[5];
                //g.A10 = "j =";
                //g.A11 = k.tab[6];
                //g.A12 = "p =";
                //g.A13 = k.tab[7];

                //g.A14 = "e =";
                //g.A15 = k.tab[9];
                //g.A16 = "r =";
                //g.A17 = k.tab[10];
                //g.A18 = "q =";
                //g.A19 = k.tab[11];
            }

            return Convert.ToInt32(L);
        }
    }
}
