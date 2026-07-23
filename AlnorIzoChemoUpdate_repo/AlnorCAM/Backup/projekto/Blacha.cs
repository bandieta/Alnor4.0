using System;
using System.Collections.Generic;
using System.Text;

namespace WindowsApplication1
{
    public class Blacha
    {
        public static double Rozwiniecie_TR8(int a, int b, int c, int d, int w, int g, int l, int l3, int m, int n)
        {
            //jeśli a+b jestwieksze równe c+d => ab= a+b+a+b
            //w przeciwnym przypadku ab= c+d+c+d
            //jeśli m jestwieksze równe n => pp= sqrt(m*m + l*l)
            //w przeciwnym przypadku pp= sqrt(n*n + l*l)
            //pole = ab*pp + 2(w+g)*l3

            double wartosc = 1;

            double ab = a + a + b + b;
            double pp = Math.Sqrt(m * m + l * l);
            if (a + b < c + d) ab = c + c + d + d;
            if (m < n) pp = Math.Sqrt(n * n + l * l);

            wartosc = (ab * pp + 2 * (w + g) * l3) / 1000000.0;
            return wartosc;
        }

        public static double Rozwiniecie_TR9a(int a, int b, int c, int d, int d1, int l, int l3, int m, int n)
        {
            double wartosc = 1;
            //jeśli a+b jestwieksze równe c+d => ab= a+b+a+b
            //w przeciwnym przypadku ab= c+d+c+d
            //jeśli m jestwieksze równe n => pp= sqrt(m*m + l*l)
            //w przeciwnym przypadku pp= sqrt(n*n + l*l)
            //pole = ab*pp + 2(w+g)*l3

            double ab = a + a + b + b;
            double pp = Math.Sqrt(m * m + l * l);
            if (a + b < c + d) ab = c + c + d + d;
            if (m < n) pp = Math.Sqrt(n * n + l * l);

            //ab*pp + 2PI*d1*l3
            wartosc = (ab * pp + 2 * Math.PI * d1 * l3) / 1000000.0;
            return wartosc;
        }

        public static double Rozwiniecie_QDa(int a, int b, int l)
        {
            double wartosc = 1;

            wartosc = (2 * (a + b) * l) / 1000000.0;
            return wartosc;
        }

        public static double Rozwiniecie_QBa(int a, int b, int f, int ee, int r)
        {
            double wartosc = (2 * (a + b) * (Math.PI / 2 * (r + b) + ee + f)) / 1000000;
            return wartosc;
        }

        public static double Rozwiniecie_QBNa(int a, int b, int f, int ee, int alfa, int r)
        {
            double wartosc = (2 * (a + b) * (alfa * Math.PI / 180 * (r + b) + ee + f)) / 1000000;
            return wartosc;
        }

        public static double Rozwiniecie_QPR6a(int a, int b, int l, int c, int d, int p)
        {
            double wartosc;
            double pp;
            //wstępnie liczymy pp jest to większa wartość spośród "(b - d)/2" i "(a - c)/2"
            pp = Math.Max((b - d) / 2, (a - c) / 2);

            //pole = 2*(a+b) * sqrt( l*l + p*p)
            if (c + d > a + b)
                wartosc = (2 * (c + d) * Math.Sqrt(l * l + p * p)) / 1000000;
            else
                wartosc = (2 * (a + b) * Math.Sqrt(l * l + p * p)) / 1000000;

            return wartosc;
        }

        public static double Rozwiniecie_QPR1a(int a, int b, int l, int d)
        {
            double wartosc, pp, pp0;
            //wstępnie liczymy p jest to większa wartość spośród "(b - d)/2" i "(a - d)/2"
            pp = Math.Max((b - d) / 2, (a - d) / 2);
            //oraz p0 jako większą wartość z 2*(a+b) oraz pi*d
            pp0 = Math.Max(2 * (a + b), Math.PI * d);
            //pole = p0 * sqrt( l*l + p*p)
            wartosc = pp0 * Math.Sqrt(l * l + pp * pp) / 1000000;
            return wartosc;
        }

        public static double Rozwiniecie_PR7a(int a, int b, int l, int d, int ee, int f)
        {

            double wartosc, pp, pp0, ll1;


            //Wzór przybliżony na liczenie pola rozwinięcia blachy:
            //najpierw liczymy przeliczeniową długość kształtki l1 
            //(e oraz f mogą być dodatnie lub ujemne, abs to wartość absolutna, sqrt pierwiastek):
            //wstępnie pp to będzie największa wartość spośród:
            //1.abs(b-d+e)
            //2.abs e
            //3.abs(a-d+f)
            //4.abs f
            //teraz l1=sqrt(l*l + pp*pp)

            pp = Math.Max(Math.Abs(b - d + ee), Math.Abs(ee));
            pp = Math.Max(pp, Math.Abs(a - d + f));
            pp = Math.Max(pp, Math.Abs(f));
            ll1 = Math.Sqrt(l * l + pp * pp);
            //oraz p0 jako większą wartość z 2*(a+b) oraz pi*d
            pp0 = Math.Max(2 * (a + b), Math.PI * d);
            //ostatecznie pole = p0 * l1
            wartosc = pp0 * ll1 / 1000000;
            return wartosc;
        }

        public static double Rozwiniecie_QPR2a(int a, int b, int l, int c, int d, int ee, int f)
        {
            double wartosc, pp, pp0, ll1;


            //Wzór przybliżony na liczenie pola rozwinięcia blachy:
            //najpierw liczymy przeliczeniową długość kształtki l1 
            //(e oraz f mogą być dodatnie lub ujemne, abs to wartość absolutna, sqrt pierwiastek):
            //wstępnie pp to będzie największa wartość spośród:
            //1.abs(b-d+e)
            //2.abs e
            //3.abs(a-d+f)
            //4.abs f
            //teraz l1=sqrt(l*l + pp*pp)

            pp = Math.Max(Math.Abs(b - d + ee), Math.Abs(ee));
            pp = Math.Max(pp, Math.Abs(a - c + f));
            pp = Math.Max(pp, Math.Abs(f));
            ll1 = Math.Sqrt(l * l + pp * pp);
            //oraz p0 jako większą wartość z 2*(a+b) oraz pi*d
            pp0 = Math.Max(2 * (a + b), Math.PI * d);
            //ostatecznie pole = p0 * l1
            wartosc = 2 * (a + b) * ll1 / 1000000;
            return wartosc;
        }

        public static double Rozwiniecie_QESa(int a, int b)
        {
            double wartosc = (((a * b))) / 1000000.0;
            return wartosc;
        }

        public static double Rozwiniecie_QBFRa(int a, int b, int d, int ee, int f)
        {
            double wartosc = (2 * (a + b) * (b + d + ee + f)) / 1000000.0;
            return wartosc;
        }

        public static double Rozwiniecie_QBFa(int a, int b, int d, int ee, int f)
        {
            double wartosc = (2 * (a + b) * (b + d + ee + f)) / 1000000.0;
            return wartosc;
        }

        public static double Rozwiniecie_QBRa(int a, int b, int ee, int f, int alfa, int r)
        {
            double wartosc = 1;
            //wartosc = (2 * (a + b) * (Math.PI * (r + b) / 2 + ee + f)) / 1000000;
            wartosc = 2 * (a + b) * ((alfa / 180.0) * Math.PI * (r + b) + ee + f) / 1000000.0;
            return wartosc;
        }

        public static double Rozwiniecie_QBR1a(int a, int b, int ee, int f, int alfa, int r)
        {
            double wartosc = 1;
            //wartosc = (2 * (a + b) * (Math.PI * (r + b) / 2 + ee + f)) / 1000000;
            wartosc = 2 * (a + b) * ((alfa / 180.0) * Math.PI * (r + b) + ee + f) / 1000000.0;
            return wartosc;
        }

        public static double Rozwiniecie_TR1a(int a, int b, int d, int w, int B, int l)
        {
            double wartosc = 1;
            //2(a+b)*L + 2(w+d)*l3
            wartosc = (2 * (a + b) * l + 2 * (w + d) * B) / 1000000.0;
            return wartosc;
        }

        public static double Rozwiniecie_TR2a(int a, int b, int d, int B, int l)
        {
            double wartosc = 1;
            wartosc = (2 * (a + b) * l + Math.PI * d * B) / 1000000;
            return wartosc;
        }

        public static double Rozwiniecie_CZ1a(int a, int b, int B, int B1, int d, int w, int d1, int w1, int l)
        {
            double wartosc = 1;
            wartosc = (2 * (a + b) * l + 2 * (w + d) * B + 2 * (w1 + d1) * B1) / 1000000.0;
            return wartosc;
        }

        public static double Rozwiniecie_CZ2a(int a, int b, int B, int B1, int d, int d1, int l)
        {
            double wartosc = 1;
            wartosc = (2 * (a + b) * l + Math.PI * d * B + Math.PI * d1 * B1) / 1000000;
            return wartosc;
        }

        public static double Rozwiniecie_QD2a(int a, int b, int l)
        {
            double wartosc = 1;
            //pole = 2(a+b)*l
            wartosc = (2 * (a + b) * l) / 1000000.0;
            return wartosc;
        }

        public static double Rozwiniecie_QD1a(int a, int b, int l, int alfa)
        {
            double wartosc = 1;
            //pole = 2(a+b)*[l + b*ctg(alfa)]
            wartosc = (2 * (a + b) * (l + b / Math.Tan(alfa * Math.PI / 180.0))) / 1000000;
            return wartosc;
        }

        public static double Rozwiniecie_TR6a(int a, int ee, int f, int g)
        {
            double wartosc = 1;
            //pole = 2*(e+f) * {g + [a - sgrt(a*a - f*f)]/2}
            wartosc = (2 * (ee + f) * (g + (a - Math.Sqrt(a * a - f * f) / 2))) / 1000000;
            return wartosc;
        }

        public static double Rozwiniecie_TRa(int a, int b, int l, int r, int d, int h, int p)
        {
            int m = b + r + p - d;
            double wartosc = (2 * (a + b) * l + 2 * (a + h) * (double)m) / 1000000;
            return wartosc;
        }

        public static double Rozwiniecie_TR4a(int a, int b, int d, int i, int j, int g, int l)
        {
            double wartosc = 1;
            wartosc = ((2 * (b + g + j) * l + 2 * a * (Math.PI * (g + d) / 2 + i + j))) / 1000000;
            return wartosc;
        }

        public static double Rozwiniecie_TR7a(int a, int b, int d, int h, int i, int j, int ee, int r, int q, int p)
        {
            int pq = h + r + i + q + j;
            double wartosc = 1;
            wartosc = (2 * (a + d) * Math.Sqrt(pq * pq + ee * ee) + 2 * (a + h) * (d + q + p - ee - b)) / 1000000;
            return wartosc;
        }

        public static double Rozwiniecie_TR5a(int a, int b, int l, int i)
        {
            double wartosc = 1;
            wartosc = ((2 * a + 4 * b) * Math.Sqrt(l * l + i * i)) / 1000000;
            return wartosc;
        }

        public static double Rozwiniecie_QPR3a(int a, int b, int ee, int l)
        {
            double wartosc = 1;
            wartosc = (2 * (a + b) * Math.Sqrt(l * l + ee * ee)) / 1000000;
            return wartosc;
        }

        public static double Rozwiniecie_QPR4a(int a, int b, int d, int ee, int l)
        {
            double wartosc = 1;
            if (b - d + ee >= ee) wartosc = 2 * (a + b) * Math.Sqrt(l * l + (b - d + ee) * (b - d + ee));
            if (b - d + ee < ee) wartosc = 2 * (a + b) * Math.Sqrt(l * l + ee * ee);

            wartosc = wartosc / 1000000;
            return wartosc;
        }

        public static double Rozwiniecie_TR3a(int a, int b, int c, int d, int m, int k, int i, int g, int f)
        {
            double wartosc = 1;
            int pp = c + f + k;
            if (c < d) pp = d + g + k;
            wartosc = (2 * (b + g + m + f + i) * pp + 2 * a * ((Math.PI * (f + c) / 2 + k + i) + (Math.PI * (g + d) / 2 + k + m))) / 1000000;
            return wartosc;
        }


    }
}
