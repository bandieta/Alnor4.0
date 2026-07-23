using System;
using System.Collections.Generic;
using System.Text;

namespace gen
{
    public class ksztaltka
    {
        public String symbol;
        public String oznaczenie;
        public String nazwa;
        public String sztuk;
        public String uwagi;
        public String przekroj;
        public String material;

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
        public bool obcy;

        public String pelny_symbol;

        public ksztaltka() { }


        public void prawe_menu(String a, String z1, String b, String c, String d, String e, String f, String g)
        {
            blacha = a;
            material = z1;
            wykonanie = b;
            klasa_szczelnosci = c;
            l_wzmoc = d;
            ramkawl = e;
            ramkawyl = f;
            ramkaod = g;
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

    }
}
