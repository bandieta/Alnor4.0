using System;
using System.Collections.Generic;
using System.Text;

namespace gen
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
                               string matChemo, string gruChemo, bool isChe, string wykChe)
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
            wykonanieChemo = wykChe;
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


        bool normalized = false;
        internal void normalizeProfileAndL()
        {

            if (!isChemo || normalized) return;


            {
                if (symbol == "TR8a")
                {
                    //L = (tab[6]);
                    tab[1] = (Convert.ToInt32(tab[1]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[2] = (Convert.ToInt32(tab[2]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[3] = (Convert.ToInt32(tab[3]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[4] = (Convert.ToInt32(tab[4]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[5] = (Convert.ToInt32(tab[5]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[9] = (Convert.ToInt32(tab[9]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    normalized = true;
                }

                if (symbol == "TR9a")
                {
                    // L = tab[5];
                    tab[1] = (Convert.ToInt32(tab[1]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[2] = (Convert.ToInt32(tab[2]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[3] = (Convert.ToInt32(tab[3]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[9] = (Convert.ToInt32(tab[9]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    normalized = true;
                }

                if (symbol == "QDa")
                {
                    tab[1] = (Convert.ToInt32(tab[1]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[2] = (Convert.ToInt32(tab[2]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    normalized = true;
                }

                if (symbol == "QBa")
                {
                    tab[1] = (Convert.ToInt32(tab[1]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[2] = (Convert.ToInt32(tab[2]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    normalized = true;
                }
                if (symbol == "QBNa")
                {
                    tab[1] = (Convert.ToInt32(tab[1]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[2] = (Convert.ToInt32(tab[2]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    normalized = true;
                }
                if (symbol == "QPR6a")
                {
                    tab[1] = (Convert.ToInt32(tab[1]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[2] = (Convert.ToInt32(tab[2]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[3] = (Convert.ToInt32(tab[3]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[4] = (Convert.ToInt32(tab[4]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    normalized = true;
                }
                if (symbol == "PR1a")
                {
                    tab[1] = (Convert.ToInt32(tab[1]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[2] = (Convert.ToInt32(tab[2]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[3] = (Convert.ToInt32(tab[3]) - 5).ToString();
                    normalized = true;
                }
                if (symbol == "PR7a")
                {
                    tab[1] = (Convert.ToInt32(tab[1]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[2] = (Convert.ToInt32(tab[2]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[3] = (Convert.ToInt32(tab[3]) - 5).ToString();  
                    normalized = true;
                }
                if (symbol == "QPR2a")
                {
                    tab[1] = (Convert.ToInt32(tab[1]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[2] = (Convert.ToInt32(tab[2]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[3] = (Convert.ToInt32(tab[3]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[4] = (Convert.ToInt32(tab[4]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    normalized = true;
                }
                if (symbol == "QBRa")
                {
                    tab[1] = (Convert.ToInt32(tab[1]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[2] = (Convert.ToInt32(tab[2]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[3] = (Convert.ToInt32(tab[3]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    normalized = true;
                }
                if (symbol == "QBR1a")
                {
                    tab[1] = (Convert.ToInt32(tab[1]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[2] = (Convert.ToInt32(tab[2]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[3] = (Convert.ToInt32(tab[3]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[4] = (Convert.ToInt32(tab[4]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    normalized = true;
                }
                if (symbol == "QBFRa")
                {
                    tab[1] = (Convert.ToInt32(tab[1]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[2] = (Convert.ToInt32(tab[2]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[3] = (Convert.ToInt32(tab[3]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    normalized = true;
                }
                if (symbol == "QBFa")
                {
                    tab[1] = (Convert.ToInt32(tab[1]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[2] = (Convert.ToInt32(tab[2]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    normalized = true; 
                }
                if (symbol == "QESa")
                {
                    tab[1] = (Convert.ToInt32(tab[1]) + 3).ToString();
                    tab[2] = (Convert.ToInt32(tab[2]) + 3).ToString();
                    normalized = true;
                }
                if (symbol == "TR1a")
                {
                    tab[1] = (Convert.ToInt32(tab[1]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[2] = (Convert.ToInt32(tab[2]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[3] = (Convert.ToInt32(tab[3]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[4] = (Convert.ToInt32(tab[4]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    //f
                    tab[6] = (Convert.ToInt32(tab[6]) - Convert.ToInt32(gruboscChemo)).ToString();
                    normalized = true;
                }
                if (symbol == "TR2a")
                {
                    tab[1] = (Convert.ToInt32(tab[1]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[2] = (Convert.ToInt32(tab[2]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    //f
                    tab[5] = (Convert.ToInt32(tab[5]) - Convert.ToInt32(gruboscChemo)).ToString();
                    normalized = true;
                }
                if (symbol == "TRa")
                {
                    tab[1] = (Convert.ToInt32(tab[1]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[2] = (Convert.ToInt32(tab[2]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[3] = (Convert.ToInt32(tab[3]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[4] = (Convert.ToInt32(tab[4]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    normalized = true;
                }
                if (symbol == "QPR3a")
                {
                    tab[1] = (Convert.ToInt32(tab[1]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[2] = (Convert.ToInt32(tab[2]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    normalized = true;
                }
                if (symbol == "QPR4a")
                {
                    tab[1] = (Convert.ToInt32(tab[1]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[2] = (Convert.ToInt32(tab[2]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[3] = (Convert.ToInt32(tab[3]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    normalized = true;
                }
                if (symbol == "TR6a")
                {
                    tab[2] = (Convert.ToInt32(tab[2]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[3] = (Convert.ToInt32(tab[3]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    normalized = true;
                }
                if (symbol == "CZ1a")
                {
                    tab[1] = (Convert.ToInt32(tab[1]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[2] = (Convert.ToInt32(tab[2]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[3] = (Convert.ToInt32(tab[3]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[4] = (Convert.ToInt32(tab[4]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[10] = (Convert.ToInt32(tab[10]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[11] = (Convert.ToInt32(tab[11]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();

                    tab[6] = (Convert.ToInt32(tab[6]) - Convert.ToInt32(gruboscChemo)).ToString();
                    tab[13] = (Convert.ToInt32(tab[13]) - Convert.ToInt32(gruboscChemo)).ToString();
                    normalized = true;
                }
                if (symbol == "CZ2a")
                {
                    tab[1] = (Convert.ToInt32(tab[1]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[2] = (Convert.ToInt32(tab[2]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();

                    //f f1
                    tab[5] = (Convert.ToInt32(tab[5]) - Convert.ToInt32(gruboscChemo)).ToString();
                    tab[13] = (Convert.ToInt32(tab[13]) - Convert.ToInt32(gruboscChemo)).ToString();
                    normalized = true;
                }
                if (symbol == "TR3a")
                {
                    tab[1] = (Convert.ToInt32(tab[1]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[2] = (Convert.ToInt32(tab[2]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[3] = (Convert.ToInt32(tab[3]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[4] = (Convert.ToInt32(tab[4]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    normalized = true;
                }
                if (symbol == "TR4a")
                {
                    tab[1] = (Convert.ToInt32(tab[1]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[2] = (Convert.ToInt32(tab[2]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[3] = (Convert.ToInt32(tab[3]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[4] = (Convert.ToInt32(tab[4]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    normalized = true;
                }
                if (symbol == "TR5a")
                {
                    tab[1] = (Convert.ToInt32(tab[1]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[2] = (Convert.ToInt32(tab[2]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[3] = (Convert.ToInt32(tab[3]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[4] = (Convert.ToInt32(tab[4]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[5] = (Convert.ToInt32(tab[5]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    normalized = true;
                }
                if (symbol == "QD1a")
                {
                    tab[1] = (Convert.ToInt32(tab[1]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[2] = (Convert.ToInt32(tab[2]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    normalized = true;
                }

                if (symbol == "QD2a")
                {
                    tab[1] = (Convert.ToInt32(tab[1]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[2] = (Convert.ToInt32(tab[2]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    normalized = true;
                }

                if (symbol == "TR7a")
                {
                    tab[1] = (Convert.ToInt32(tab[1]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[2] = (Convert.ToInt32(tab[2]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[3] = (Convert.ToInt32(tab[3]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    tab[4] = (Convert.ToInt32(tab[4]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    normalized = true;
                }
            }


            // L for kolnierze
            if (wykonanieChemo == "Kolnierze")
            {
                if (symbol == "TR8a")
                {
                    //L = (tab[6]);
                    tab[6] = (Convert.ToInt32(tab[6]) - 2 * Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    //l3
                    tab[7] = (Convert.ToInt32(tab[7]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    normalized = true;
                    return;
                }

                if (symbol == "TR9a")
                {
                    // L = tab[5];
                    tab[5] = (Convert.ToInt32(tab[5]) - 2 * Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    normalized = true;
                    return;
                }

                if (symbol == "QDa")
                {
                    //  L = tab[9];
                    tab[9] = (Convert.ToInt32(tab[9]) - 2 * Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    normalized = true;
                    return;
                }

                if (symbol == "QBa")
                {
                    tab[3] = (Convert.ToInt32(tab[3]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    tab[4] = (Convert.ToInt32(tab[4]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    normalized = true;
                    return;

                }
                if (symbol == "QBNa")
                {
                    tab[3] = (Convert.ToInt32(tab[3]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    tab[4] = (Convert.ToInt32(tab[4]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    normalized = true;
                    return;

                }
                if (symbol == "QPR6a")
                {
                    // L = tab[9];
                    tab[9] = (Convert.ToInt32(tab[9]) - 2 * Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    normalized = true;
                    return;
                }
                if (symbol == "PR1a")
                {
                    //L = tab[9];
                    tab[9] = (Convert.ToInt32(tab[9]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    normalized = true;
                    return;
                }
                if (symbol == "PR7a")
                {
                    // L = tab[9];
                    tab[9] = (Convert.ToInt32(tab[9]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    normalized = true;
                    return;
                }
                if (symbol == "QPR2a")
                {
                    // L = tab[9];
                    tab[9] = (Convert.ToInt32(tab[9]) - 2 * Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    normalized = true;
                    return;
                }
                if (symbol == "QBRa")
                {
                    tab[5] = (Convert.ToInt32(tab[5]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    tab[4] = (Convert.ToInt32(tab[4]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    normalized = true;
                    return;

                }
                if (symbol == "QBR1a")
                {
                    tab[5] = (Convert.ToInt32(tab[5]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    tab[6] = (Convert.ToInt32(tab[6]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    normalized = true;
                    return;

                }
                if (symbol == "QBFRa")
                {
                    tab[5] = (Convert.ToInt32(tab[5]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    tab[4] = (Convert.ToInt32(tab[4]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    normalized = true;
                    return;

                }
                if (symbol == "QBFa")
                {
                    tab[3] = (Convert.ToInt32(tab[3]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    tab[4] = (Convert.ToInt32(tab[4]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    normalized = true;
                    return;

                }
                if (symbol == "QESa")
                {
                    tab[3] = (Convert.ToInt32(tab[3]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();

                    normalized = true;
                    return;

                }
                if (symbol == "TR1a")
                {
                    //L = tab[9];
                    tab[9] = (Convert.ToInt32(tab[9]) - 2 * Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();

                    //e
                    tab[5] = (Convert.ToInt32(tab[5]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    //l3
                    tab[10] = (Convert.ToInt32(tab[10]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();

                    normalized = true;
                    return;
                }
                if (symbol == "TR2a")
                {
                    //L = tab[9];
                    tab[9] = (Convert.ToInt32(tab[9]) - 2 * Convert.ToInt32(gruboscChemo)).ToString();
                    //e
                    tab[4] = (Convert.ToInt32(tab[4]) - Convert.ToInt32(gruboscChemo)).ToString();
                    normalized = true;
                    return;
                }
                if (symbol == "TRa")
                {
                    // L = tab[9];
                    tab[9] = (Convert.ToInt32(tab[9]) - 2 * Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    //p
                    tab[6] = (Convert.ToInt32(tab[6]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    normalized = true;
                    return;
                }
                if (symbol == "QPR3a")
                {
                    //L = tab[9];
                    tab[9] = (Convert.ToInt32(tab[9]) - 2 * Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    normalized = true;
                    return;
                }
                if (symbol == "QPR4a")
                {
                    // L = tab[9];
                    tab[9] = (Convert.ToInt32(tab[9]) - 2 * Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    normalized = true;
                    return;
                }
                if (symbol == "TR6a")
                {
                    // L = tab[9];
                    tab[4] = (Convert.ToInt32(tab[4]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    normalized = true;
                    return;
                }
                if (symbol == "CZ1a")
                {
                    // L = tab[9];
                    tab[9] = (Convert.ToInt32(tab[9]) - 2 * Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();

                    //e1
                    tab[5] = (Convert.ToInt32(tab[5]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    //e
                    tab[12] = (Convert.ToInt32(tab[12]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    //l3
                    tab[7] = (Convert.ToInt32(tab[7]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    //l4
                    tab[8] = (Convert.ToInt32(tab[8]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    normalized = true;
                    return;
                }
                if (symbol == "CZ2a")
                {
                    //L = tab[9];
                    tab[9] = (Convert.ToInt32(tab[9]) - 2 * Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();

                    //e e1
                    tab[9] = (Convert.ToInt32(tab[9]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    tab[9] = (Convert.ToInt32(tab[9]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    // l3 l4
                    tab[9] = (Convert.ToInt32(tab[9]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    tab[9] = (Convert.ToInt32(tab[9]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();

                    normalized = true;
                    return;
                }
                if (symbol == "TR3a")
                {
                    tab[5] = (Convert.ToInt32(tab[5]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    tab[6] = (Convert.ToInt32(tab[6]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    tab[7] = (Convert.ToInt32(tab[7]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    tab[8] = (Convert.ToInt32(tab[8]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();

                    normalized = true;
                    return;

                }
                if (symbol == "TR4a")
                {
                    //L = tab[9];
                    tab[9] = (Convert.ToInt32(tab[9]) - 2 * Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    tab[6] = (Convert.ToInt32(tab[6]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    normalized = true;
                    return;
                }
                if (symbol == "TR5a")
                {
                    //L = tab[9];
                    tab[9] = (Convert.ToInt32(tab[9]) - 2 * Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    normalized = true;
                    return;
                }
                if (symbol == "QD1a")
                {
                    // L = tab[9];
                    tab[9] = (Convert.ToInt32(tab[9]) - 2 * Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    normalized = true;
                    return;
                }

                if (symbol == "QD2a")
                {
                    //L = tab[9];
                    tab[9] = (Convert.ToInt32(tab[9]) - 2 * Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    normalized = true;
                    return;
                }

                if (symbol == "TR7a")
                {
                    tab[5] = (Convert.ToInt32(tab[5]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    tab[6] = (Convert.ToInt32(tab[6]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();
                    tab[7] = (Convert.ToInt32(tab[7]) - Encoder.CalculateWidth(Convert.ToInt32(gruboscChemo))).ToString();

                    normalized = true;
                    return;

                }
            }

            normalized = true;
        }
    }
}
