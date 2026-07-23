using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;

//using System.Text;
using System.Xml;
using System.Xml.Serialization;
using WindowsApplication1;

namespace gen
{
    
    public partial class Form1 : Form
    {
        String nazwa;
        List<ksztaltka> lista = new List<ksztaltka>();
        public Form1()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            try
            {
                OpenFileDialog p = new OpenFileDialog();
                p.ShowDialog();
                if (p.FileName == "") return;

                // Tworzymy obiekt serializatora, któremy podajemy typ jaki bêdziemy serializowaæ
                XmlSerializer Serializer = new XmlSerializer(typeof(System.Collections.Generic.List<ksztaltka>));

                string password = "dupazbit";
                UnicodeEncoding UE = new UnicodeEncoding();
                byte[] key = UE.GetBytes(password);

                // odczyt zaszyfrowanych danych
                // gs jest strumieniem po±rednim
                System.IO.FileStream gs = new System.IO.FileStream(p.FileName, System.IO.FileMode.Open);
                System.Security.Cryptography.RijndaelManaged RMCryptp = new System.Security.Cryptography.RijndaelManaged();
                System.Security.Cryptography.CryptoStream ds = new System.Security.Cryptography.CryptoStream(gs,
                RMCryptp.CreateDecryptor(key, key),
                System.Security.Cryptography.CryptoStreamMode.Read);
                XmlTextReader XmlTextReader = new XmlTextReader(ds);


                // Tworzymy strumieñ danych XML powi¹zany z plikiem Samochód.xml
                // XmlTextReader XmlTextReader = new XmlTextReader(p.FileName);

                lista = (List<ksztaltka>)Serializer.Deserialize(XmlTextReader);

                // Zamykamy strumieñ danych powi¹zany z plikiem Samochód.xml
                XmlTextReader.Close();

                dataGridView1.Rows.Clear();
                int i;
                for (i = 0; i < lista.Count; i++)
                    dataGridView1.Rows.Add(lista[i].oznaczenie, lista[i].nazwa, lista[i].pelny_symbol, lista[i].sztuk, lista[i].material, lista[i].tab[15], lista[i].przekroj, lista[i].tab[16]);

                dataGridView1.CurrentCell = dataGridView1[0, i - 1];

                System.IO.FileInfo f = new System.IO.FileInfo(p.FileName);
                textBox1.Text = p.FileName;

                nazwa = textBox2.Text = System.IO.Path.GetFileNameWithoutExtension(p.FileName) + ".txt";
                textBox3.Text = lista[0].Qnazwa;
                textBox4.Text = lista[0].Qzamawia;
                textBox5.Text = lista[0].Qdata;
            }
            catch { MessageBox.Show(" B³¹d otwarcia pliku! "); }
            

        }

        private void Form1_Load(object sender, EventArgs e)
        {

        }

        private void button2_Click(object sender, EventArgs e)
        {
            SaveFileDialog p = new SaveFileDialog();
            p.FileName = nazwa;
            p.ShowDialog();
            if (p.FileName == "") return;
            textBox2.Text = p.FileName;
            nazwa = System.IO.Path.GetFileName(p.FileName);
            
             

        }

        private void button3_Click(object sender, EventArgs e)
        {
            System.IO.StreamWriter plik = new System.IO.StreamWriter(textBox2.Text,false,System.Text.Encoding.Default);
            
            
            plik.WriteLine("ZESTAWIENIE WENTYLACJI MECHANICZNEJ wykonane programem ...... wer.1.0");
            plik.WriteLine("----------------");
            plik.WriteLine("Ma³e pola rozwiniêæ kana³ów i kszta³tek zaokr¹glono do [m2]: 1.0");
            plik.WriteLine("----------------");
            plik.WriteLine("");

            plik.WriteLine("JOB_START");
            plik.WriteLine("JOBHEADER_START");
            plik.WriteLine("JOB_NAME");
            //////////////////////////////////////////////
            plik.WriteLine(lista[0].Qnazwa);
            plik.WriteLine("JOB_REFERENCE");
            //////////////////////////////////////////////
            plik.WriteLine(lista[0].Qzamawia);
            plik.WriteLine("JOB_DATE");
			//plik.WriteLine(DateTime.Now.ToString("d"));
            plik.WriteLine(lista[0].Qdata);

            plik.WriteLine("CUSTOMERADDRESS_START");
            plik.WriteLine(nazwa);
            plik.WriteLine("CUSTOMERADDRESS_END");
            plik.WriteLine("JOBHEADER_END");

            for (int i = 0; i < lista.Count; i++)
            {
                if (!lista[i].obcy && lista[i].symbol != "CZ1a" && lista[i].symbol != "CZ2a" )
                {
                    Plik.AddPrefix(plik);
                    Plik.DodajNazwePliku(plik, lista, i, lista[i].izolowana);
                    Plik.AddQuantityEtc(plik, lista, i, false);
                    WpiszKsztaltke(plik, lista[i].symbol, lista[i].tab);
                    Plik.AddSuffix(plik);

                    if (lista[i].izolowana && !lista[i].plaszcz.Contains("Bez P³aszcza"))
                    {
                        Plik.AddPrefix(plik);
                        Plik.DodajNazwePliku(plik, lista, i, false);
                        Plik.AddQuantityEtc(plik, lista, i, true);
                        WpiszKsztaltke(plik, lista[i].symbol, lista[i].tabIzo());
                        Plik.AddSuffix(plik);
                    }
                }
            }

            plik.WriteLine("JOB_END");
            plik.WriteLine("----------------");
            plik.WriteLine("ELEMENTY Z PROJEKTU nieujête w powy¿szym exporcie");

            plik.WriteLine("{0,-10} {1,-30} {2,-20} {3,-15} {4,-10}","Oznaczenie","Nazwa","Symbol","Szt.","Uwagi");

            for (int i = 0; i < lista.Count; i++)
            {
               // if (lista[i].obcy)
                    if (lista[i].symbol == "CZ1a" || lista[i].symbol == "CZ2a")
                        plik.WriteLine("{0,-10} {1,-30} {2,-20} {3,-20} {4,-15}", lista[i].oznaczenie, lista[i].nazwa, lista[i].pelny_symbol, lista[i].sztuk, lista[i].uwagi);
                    else if (lista[i].obcy)                     
                        plik.WriteLine("{0,-10} {1,-30} {2,-20} {3,-20} {4,-15}", lista[i].oznaczenie, lista[i].nazwa, lista[i].symbol, lista[i].sztuk, lista[i].uwagi);
            }
            //////////////////////////////////////
            //Wyw11- 4	Wentylator œcienny	WOS-3001	1	brak uwag {separatorem tabulator

            plik.WriteLine("----------------");
            
            ///////////////////////////////
            //Pole powierzchni rozwiniêæ kana³ów prostok¹tnych:	0.8	 m2		{suma pól rozwiniêæ kana³ów
            //Pole powierzchni rozwiniêæ podst. kszta³tek prostok¹tnych:	0.8	 m2	{suma pól rozwiniêæ kszta³tek

            plik.Close();

            Form2 f2 = new Form2();  f2.Show();
         }

        private void WpiszKsztaltke(System.IO.StreamWriter plik, string symbol, string[] tab)
        {
            switch (symbol)
            {
                case "QDa":
                    plik.WriteLine(tab[1]);
                    plik.WriteLine(tab[2]);
                    plik.WriteLine(tab[9]);

                    if (tab[9] == "0,45")
                    { }
                    break;
                case "QBNa":
                    plik.WriteLine(tab[1]);
                    plik.WriteLine(tab[2]);
                    plik.WriteLine(tab[3]);
                    plik.WriteLine(tab[4]);
                    plik.WriteLine(tab[5]);
                    plik.WriteLine(tab[10]);
                    break;
                case "QBa":
                    plik.WriteLine(tab[1]);
                    plik.WriteLine(tab[2]);
                    plik.WriteLine(tab[3]);
                    plik.WriteLine(tab[4]);
                    plik.WriteLine(tab[5]);
                    plik.WriteLine("90");
                    break;
                case "QPR6a":
                    plik.WriteLine(tab[1]);
                    plik.WriteLine(tab[2]);
                    plik.WriteLine(tab[3]);
                    plik.WriteLine(tab[4]);
                    plik.WriteLine(tab[5]);
                    plik.WriteLine(tab[6]);
                    plik.WriteLine(tab[9]);
                    break;
                case "PR1a":
                    plik.WriteLine(tab[1]);
                    plik.WriteLine(tab[2]);
                    plik.WriteLine(tab[3]);
                    plik.WriteLine(tab[4]);
                    plik.WriteLine(tab[5]);
                    plik.WriteLine(tab[9]);
                    break;
                case "PR7a":
                    plik.WriteLine(tab[1]);
                    plik.WriteLine(tab[2]);
                    plik.WriteLine(tab[3]);
                    plik.WriteLine(tab[6]);
                    plik.WriteLine(tab[7]);
                    plik.WriteLine(tab[4]);
                    plik.WriteLine(tab[5]);
                    plik.WriteLine(tab[9]);
                    break;
                case "QPR2a":
                    plik.WriteLine(tab[1]);
                    plik.WriteLine(tab[2]);
                    plik.WriteLine(tab[3]);
                    plik.WriteLine(tab[4]);
                    plik.WriteLine(tab[7]);
                    plik.WriteLine(tab[8]);
                    plik.WriteLine(tab[5]);
                    plik.WriteLine(tab[6]);
                    plik.WriteLine(tab[9]);
                    break;
                case "QBRa":
                    plik.WriteLine(tab[1]);
                    plik.WriteLine(tab[3]);
                    plik.WriteLine(tab[2]);
                    plik.WriteLine(tab[5]);
                    plik.WriteLine(tab[4]);
                    plik.WriteLine(tab[6]);
                    plik.WriteLine(tab[10]);
                    break;
                case "QBR1a":
                    plik.WriteLine(tab[1]);
                    plik.WriteLine(tab[2]);
                    plik.WriteLine(tab[3]);
                    plik.WriteLine(tab[4]);
                    plik.WriteLine(tab[5]);
                    plik.WriteLine(tab[6]);
                    plik.WriteLine(tab[7]);
                    plik.WriteLine(tab[10]);
                    plik.WriteLine(tab[9]);
                    break;
                case "QBFRa":
                    plik.WriteLine(tab[1]);
                    plik.WriteLine(tab[2]);
                    plik.WriteLine(tab[3]);
                    plik.WriteLine(tab[4]);
                    plik.WriteLine(tab[5]);
                    plik.WriteLine(tab[6]);
                    break;
                case "QBFa":
                    plik.WriteLine(tab[1]);
                    plik.WriteLine(tab[2]);
                    plik.WriteLine(tab[3]);
                    plik.WriteLine(tab[4]);
                    plik.WriteLine(tab[5]);
                    break;
                case "QESa":
                    plik.WriteLine(tab[1]);
                    plik.WriteLine(tab[2]);
                    plik.WriteLine(tab[3]);
                    plik.WriteLine(tab[4]);
                    plik.WriteLine(tab[5]);
                    break;
                case "TR4a":
                    plik.WriteLine(tab[2]);
                    plik.WriteLine(tab[1]);
                    plik.WriteLine(tab[3]);
                    plik.WriteLine(tab[4]);
                    plik.WriteLine(tab[9]);
                    int wartosc = Convert.ToInt32(tab[5]) +
                                  Convert.ToInt32(tab[10]) +
                    Convert.ToInt32(tab[4]) / 2;
                    plik.WriteLine(wartosc.ToString());
                    plik.WriteLine(tab[10]);
                    plik.WriteLine("90");
                    plik.WriteLine(tab[5]);
                    plik.WriteLine(tab[6]);

                    break;
                case "TR5a":
                    plik.WriteLine(tab[1]);
                    plik.WriteLine(tab[2]);
                    plik.WriteLine(tab[3]);
                    plik.WriteLine(tab[4]);
                    plik.WriteLine(tab[5]);
                    plik.WriteLine(tab[9]);
                    plik.WriteLine(tab[12]);
                    plik.WriteLine("" + -(Convert.ToInt32(tab[10])));
                    plik.WriteLine(tab[11]);
                    plik.WriteLine(tab[6]);
                    plik.WriteLine(tab[7]);
                    break;
                case "QD1a":
                    plik.WriteLine(tab[2]);
                    plik.WriteLine(tab[1]);
                    plik.WriteLine(tab[9]);
                    plik.WriteLine(tab[10]);
                    break;
                case "QD2a":
                    plik.WriteLine(tab[2]);
                    plik.WriteLine(tab[1]);
                    plik.WriteLine(tab[9]);
                    break;
                case "TR3a":
                    plik.WriteLine(tab[2]);
                    plik.WriteLine(tab[1]);
                    plik.WriteLine(tab[3]);
                    plik.WriteLine(tab[4]);
                    wartosc = Convert.ToInt32(tab[6]) +
                                 Convert.ToInt32(tab[9]) +
                                 Convert.ToInt32(tab[4]) / 2;
                    plik.WriteLine(wartosc.ToString());
                    plik.WriteLine(tab[10]);
                    plik.WriteLine(tab[9]);
                    plik.WriteLine(tab[8]);
                    plik.WriteLine(tab[6]);
                    plik.WriteLine(tab[7]);
                    plik.WriteLine(tab[5]);
                    plik.WriteLine("50");
                    break;
                case "TR6a":
                    plik.WriteLine(tab[1]);
                    plik.WriteLine(tab[9]);
                    plik.WriteLine("50");
                    plik.WriteLine("50");
                    plik.WriteLine(tab[2]);
                    plik.WriteLine(tab[3]);
                    plik.WriteLine(tab[4]);

                    break;
                case "QPR4a":
                    plik.WriteLine(tab[1]);
                    plik.WriteLine(tab[2]);
                    plik.WriteLine(tab[3]);
                    plik.WriteLine(tab[4]);
                    plik.WriteLine(tab[5]);
                    plik.WriteLine(tab[6]);
                    plik.WriteLine(tab[9]);
                    break;
                case "QPR3a":
                    plik.WriteLine(tab[1]);
                    plik.WriteLine(tab[2]);
                    plik.WriteLine(tab[3]);
                    plik.WriteLine(tab[4]);
                    plik.WriteLine(tab[5]);
                    plik.WriteLine(tab[9]);
                    break;
                case "TRa":
                    plik.WriteLine(tab[1]);
                    plik.WriteLine(tab[2]);
                    plik.WriteLine(tab[3]);
                    plik.WriteLine(tab[4]);
                    plik.WriteLine(tab[5]);
                    wartosc = Convert.ToInt32(tab[9]) -
                                 (Convert.ToInt32(tab[5]) +
                                 Convert.ToInt32(tab[11]) +
                                 Convert.ToInt32(tab[4]) +
                                 Convert.ToInt32(tab[10]));
                    plik.WriteLine(wartosc.ToString());
                    plik.WriteLine(tab[6]);
                    plik.WriteLine(tab[10]);
                    plik.WriteLine(tab[11]);
                    break;
                case "TR2a":
                    plik.WriteLine(tab[2]);
                    plik.WriteLine(tab[1]);
                    plik.WriteLine(tab[9]);
                    plik.WriteLine(tab[3]);
                    plik.WriteLine(tab[4]);
                    wartosc = Convert.ToInt32(tab[1]) / 2 - Convert.ToInt32(tab[5]);
                    plik.WriteLine(wartosc.ToString());
                    plik.WriteLine(tab[10]);
                    break;


                case "TR1a":
                    plik.WriteLine(tab[2]);
                    plik.WriteLine(tab[1]);
                    plik.WriteLine(tab[9]);
                    plik.WriteLine(tab[4]);
                    plik.WriteLine(tab[3]);
                    plik.WriteLine(tab[5]);
                    plik.WriteLine("" + (Convert.ToInt32(tab[1]) / 2 - Convert.ToInt32(tab[6])));
                    plik.WriteLine(tab[10]);
                    break;

                case "TR7a":
                    plik.WriteLine(tab[1]);
                    plik.WriteLine(tab[2]);
                    plik.WriteLine(tab[3]);
                    plik.WriteLine(tab[9]);
                    plik.WriteLine(tab[4]);
                    plik.WriteLine(tab[5]);
                    plik.WriteLine(tab[6]);
                    plik.WriteLine(tab[7]);
                    plik.WriteLine(tab[11]);
                    plik.WriteLine(tab[10]);
                    break;
                case "TR8a":
                    {
                        // a,b,c,d,w,g,l,l3,m,n,e,f,i
                        int a = Convert.ToInt32(tab[1]);
                        int b = Convert.ToInt32(tab[2]);
                        int c = Convert.ToInt32(tab[9]);
                        int d = Convert.ToInt32(tab[3]);
                        int w = Convert.ToInt32(tab[4]);
                        int g = Convert.ToInt32(tab[5]);
                        int l = Convert.ToInt32(tab[6]);
                        int l3 = Convert.ToInt32(tab[7]);
                        int m = Convert.ToInt32(tab[8]);
                        int n = Convert.ToInt32(tab[10]);
                        int ee = Convert.ToInt32(tab[11]);
                        int f = Convert.ToInt32(tab[12]);
                        int ii = Convert.ToInt32(tab[13]);
                        //                 400		<< A
                        //300		<< B
                        //500		<< C
                        //400		<< D
                        //50		<< D+N-B
                        //50		<< C-M-A
                        //30		<< I
                        //30		<< I
                        //750		<< L
                        //300		<< W
                        //160		<< G
                        //0		<< zawsze zero tutaj
                        //300		<< L-E
                        //0		<< B/2-F
                        //100		<< L3
                        plik.WriteLine(a.ToString());
                        plik.WriteLine(b.ToString());
                        plik.WriteLine(c.ToString());
                        plik.WriteLine(d.ToString());

                        // 50		<< jeœli c<a: C-M-A  jeœli c>=a: C+M-A
                        // 50		<< jeœli d<b: D+N-B  jeœli d>=b: D-N-B
                        // plik.WriteLine((d + n - b).ToString());
                        // plik.WriteLine((c - m - a).ToString());

                        //if (d < b)
                        { plik.WriteLine((d - b - n).ToString()); }
                        //else
                        //{ plik.WriteLine((d - n - b).ToString()); }

                        //if (c < a)
                        //{ plik.WriteLine((a - m - c).ToString()); }
                        //else
                        { plik.WriteLine((c + m - a).ToString()); }

                        plik.WriteLine((ii).ToString());
                        plik.WriteLine((ii).ToString());
                        plik.WriteLine((l).ToString());
                        plik.WriteLine((w).ToString());
                        plik.WriteLine((g).ToString());
                        plik.WriteLine("0");
                        plik.WriteLine((l - ee).ToString());
                        plik.WriteLine((b / 2 - f).ToString());
                        plik.WriteLine((l3).ToString());
                    }
                    break;
                case "TR9a":
                    {
                        //a,b,c,d,d1,l,l3,m,n,e,f, dalej i,,j automatycznie generowane jako 30mm.
                        int a = Convert.ToInt32(tab[1]);
                        int b = Convert.ToInt32(tab[2]);
                        int c = Convert.ToInt32(tab[9]);
                        int d = Convert.ToInt32(tab[3]);
                        int d1 = Convert.ToInt32(tab[4]);
                        int l = Convert.ToInt32(tab[5]);
                        int l3 = Convert.ToInt32(tab[6]);
                        int m = Convert.ToInt32(tab[7]);
                        int n = Convert.ToInt32(tab[8]);
                        int ee = Convert.ToInt32(tab[10]);
                        int f = Convert.ToInt32(tab[11]);
                        int ii = Convert.ToInt32(tab[12]);
                        int j = Convert.ToInt32(tab[13]);
                        //                          400		<< A
                        //300		<< B
                        //500		<< C
                        //400		<< D
                        //50		<< D+N-B
                        //50		<< C-M-A
                        //30		<< J
                        //30		<< I
                        //750		<< L
                        //200		<< D1
                        //200		<< D1
                        //100		<< D1/2
                        //300		<< L-E
                        //0		<< B/2-F
                        //100		<< L3
                        plik.WriteLine(a.ToString());
                        plik.WriteLine(b.ToString());
                        plik.WriteLine(c.ToString());
                        plik.WriteLine(d.ToString());


                        //50  << jeœli d<b: D-B-N  jeœli d>=b: D-N-B
                        // 50  << jeœli c<a: A-M-C jeœli c>=a: C+M-A

                        //plik.WriteLine((d+n-b).ToString());
                        //plik.WriteLine((c -m-a).ToString());

                        //if (d < b)
                        { plik.WriteLine((d - b - n).ToString()); }
                        //else
                        //{ plik.WriteLine((d - n - b).ToString()); }

                        //if (c < a)
                        //{ plik.WriteLine((a - m - c).ToString()); }
                        //else
                        { plik.WriteLine((c + m - a).ToString()); }

                        plik.WriteLine((j).ToString());
                        plik.WriteLine((ii).ToString());
                        plik.WriteLine((l).ToString());
                        plik.WriteLine((d1).ToString());
                        plik.WriteLine((d1).ToString());
                        plik.WriteLine((d1 / 2).ToString());
                        plik.WriteLine((l - ee).ToString());
                        plik.WriteLine((b / 2 - f).ToString());
                        plik.WriteLine((l3).ToString());
                    }
                    break;
            }
        }

        private void button4_Click(object sender, EventArgs e)
        {
            Close();
        }
    }
}