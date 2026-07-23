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
            catch (Exception qw) { MessageBox.Show(" B³¹d otwarcia pliku! "); }
            

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
            plik.WriteLine("Ma³e pola rozwiniêæ kana³ów i kszta³tek zaokr¹glono do [m2]: 0.8");
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
                if (!lista[i].obcy)
                {
                    plik.WriteLine("ITEM_START");
                    plik.WriteLine("ITEMHEADER_START");

                    plik.WriteLine("ITEMFILE");

                    ///////////////////////
                    switch (lista[i].symbol)
                    {
                        case "QDa":
                            plik.WriteLine("C:/CAM/REMOTE-WZORCE/KANA£.ITM");
                            break;
                        case "QBNa":
                            plik.WriteLine("C:/CAM/REMOTE-WZORCE/£UK PROSTY.ITM");
                            break;
                        case "QBa":
                            plik.WriteLine("C:/CAM/REMOTE-WZORCE/£UK PROSTY.ITM");
                            break;
                        case "QPR6a":
                            plik.WriteLine("C:/CAM/REMOTE-WZORCE/REDUKCJA SYMETRYCZNA.ITM");
                            break;
                        case "PR1a":
                            plik.WriteLine("C:/CAM/REMOTE-WZORCE/KWADRAT-KO£O.ITM");
                            break;
                        case "PR7a":
                            plik.WriteLine("C:/CAM/REMOTE-WZORCE/KWADRAT-KO£O ASYM..ITM");
                            break;
                        case "QPR2a":
                            plik.WriteLine("C:/CAM/REMOTE-WZORCE/REDUKCJA ASYMETRYCZNA.ITM");
                            break;
                        case "QBRa":
                            plik.WriteLine("C:/CAM/REMOTE-WZORCE/£UK REDUKCYJNY.ITM");
                            break;
                        case "QBFRa":
                            plik.WriteLine("C:/CAM/REMOTE-WZORCE/KOLANO REDUKCYJNE.ITM");
                            break;
                        case "QBFa":
                            plik.WriteLine("C:/CAM/REMOTE-WZORCE/KOLANO PROSTE.ITM");
                            break;
                        case "QEa":
                            plik.WriteLine("C:/CAM/REMOTE-WZORCE/ZAŒLEPKA.ITM");
                            break;
                        case "TR1a":
                            plik.WriteLine("C:/CAM/REMOTE-WZORCE/TRÓJNIK KANA£OWY.ITM");
                            break;



                        case "TR7a":
                            plik.WriteLine("C:/CAM/REMOTE-WZORCE/TRÓJNIK SKOŒNY.ITM");
                            break;


                        case "TR4a":
                            plik.WriteLine("C:/CAM/REMOTE-WZORCE/TRÓJNIK KOLANOWY.ITM");
                            break;
                        case "TR5a":
                            plik.WriteLine("C:/CAM/REMOTE-WZORCE/TRÓJNIK PORTKOWY.ITM");
                            break;
                        case "QD1a":
                            plik.WriteLine("C:/CAM/REMOTE-WZORCE/ODGA£ÊZIENIE.ITM");
                            break;
                        case "QD2a":
                            plik.WriteLine("C:/CAM/REMOTE-WZORCE/SZTUCER.ITM");
                            break;
                        case "TR3a":
                            plik.WriteLine("C:/CAM/REMOTE-WZORCE/TRÓJNIK OR£OWY.ITM");
                            break;
                        case "TR6a":
                            plik.WriteLine("C:/CAM/REMOTE-WZORCE/NAK£ADKA.ITM");
                            break;
                        case "QPR4a":
                            plik.WriteLine("C:/CAM/REMOTE-WZORCE/ODSADZKA ASYMETRYCZNA.ITM");
                            break;
                        case "QPR3a":
                            plik.WriteLine("C:/CAM/REMOTE-WZORCE/ODSADZKA PROSTA.ITM");
                            break;
                        case "TRa":
                            plik.WriteLine("C:/CAM/REMOTE-WZORCE/TRÓJNIK PROSTY.ITM");
                            break;
                        case "TR2a":
                            plik.WriteLine("C:/CAM/REMOTE-WZORCE/TRÓJNIK KWADRAT-KO£O.ITM");
                            break;




                    }

                    plik.WriteLine("ITEM_NUMBER");
                    plik.WriteLine(lista[i].oznaczenie);
                    plik.WriteLine("SPEC");
                    plik.WriteLine("");
                    plik.WriteLine("MATERIAL");

                    switch (lista[i].material)
                    {
                        case "Ocynk":
                            plik.WriteLine("OCYNK");
                            break;
                        case "Kwasówka":
                            plik.WriteLine("STAINLESS");
                            break;
                        case "Aluminium":
                            plik.WriteLine("ALUMINIUM");
                            break;
                    }

                    plik.WriteLine("GAUGE");
                    
                    lista[i].blacha = lista[i].blacha.Replace(",", ".");

                    plik.WriteLine(lista[i].blacha);
                    plik.WriteLine("QUANTITY");
                    plik.WriteLine(lista[i].sztuk);
                    plik.WriteLine("INSULATION_MATERIAL");
                    plik.WriteLine("");
                    plik.WriteLine("INSULATION_GAUGE");
                    plik.WriteLine("");
                    plik.WriteLine("INSULATION_SIDE");
                    plik.WriteLine("");
                    plik.WriteLine("NOTES");
                    if (lista[i].tab[16].Length > 0)
                        plik.Write(lista[i].tab[16] + ", ");
                    plik.WriteLine(lista[i].pelny_symbol);
                    plik.WriteLine("ITEMHEADER_END");
                    plik.WriteLine("DIMS_START");


                    switch (lista[i].symbol)
                    {
                        case "QDa":
                            plik.WriteLine(lista[i].tab[1]);
                            plik.WriteLine(lista[i].tab[2]);
                            plik.WriteLine(lista[i].tab[9]);
                            break;
                        case "QBNa":
                            plik.WriteLine(lista[i].tab[1]);
                            plik.WriteLine(lista[i].tab[2]);
                            plik.WriteLine(lista[i].tab[3]);
                            plik.WriteLine(lista[i].tab[4]);
                            plik.WriteLine(lista[i].tab[5]);
                            plik.WriteLine(lista[i].tab[10]);
                            break;
                        case "QBa":
                            plik.WriteLine(lista[i].tab[1]);
                            plik.WriteLine(lista[i].tab[2]);
                            plik.WriteLine(lista[i].tab[3]);
                            plik.WriteLine(lista[i].tab[4]);
                            plik.WriteLine(lista[i].tab[5]);
                            plik.WriteLine("90");
                            break;
                        case "QPR6a":
                            plik.WriteLine(lista[i].tab[1]);
                            plik.WriteLine(lista[i].tab[2]);
                            plik.WriteLine(lista[i].tab[3]);
                            plik.WriteLine(lista[i].tab[4]);
                            plik.WriteLine(lista[i].tab[5]);
                            plik.WriteLine(lista[i].tab[6]);
                            plik.WriteLine(lista[i].tab[9]);
                            break;
                        case "PR1a":
                            plik.WriteLine(lista[i].tab[1]);
                            plik.WriteLine(lista[i].tab[2]);
                            plik.WriteLine(lista[i].tab[3]);
                            plik.WriteLine(lista[i].tab[4]);
                            plik.WriteLine(lista[i].tab[5]);
                            plik.WriteLine(lista[i].tab[9]);
                            break;
                        case "PR7a":
                            plik.WriteLine(lista[i].tab[1]);
                            plik.WriteLine(lista[i].tab[2]);
                            plik.WriteLine(lista[i].tab[3]);
                            plik.WriteLine(lista[i].tab[6]);
                            plik.WriteLine(lista[i].tab[7]);
                            plik.WriteLine(lista[i].tab[4]);
                            plik.WriteLine(lista[i].tab[5]);
                            plik.WriteLine(lista[i].tab[9]);
                            break;
                        case "QPR2a":
                            plik.WriteLine(lista[i].tab[1]);
                            plik.WriteLine(lista[i].tab[2]);
                            plik.WriteLine(lista[i].tab[3]);
                            plik.WriteLine(lista[i].tab[4]);
                            plik.WriteLine(lista[i].tab[7]);
                            plik.WriteLine(lista[i].tab[8]);
                            plik.WriteLine(lista[i].tab[5]);
                            plik.WriteLine(lista[i].tab[6]);
                            plik.WriteLine(lista[i].tab[9]);
                            break;
                        case "QBRa":
                            plik.WriteLine(lista[i].tab[1]);
                            plik.WriteLine(lista[i].tab[2]);
                            plik.WriteLine(lista[i].tab[3]);
                            plik.WriteLine(lista[i].tab[4]);
                            plik.WriteLine(lista[i].tab[5]);
                            plik.WriteLine(lista[i].tab[6]);
                            plik.WriteLine(lista[i].tab[10]);

                            break;
                        case "QBFRa":
                            plik.WriteLine(lista[i].tab[1]);
                            plik.WriteLine(lista[i].tab[2]);
                            plik.WriteLine(lista[i].tab[3]);
                            plik.WriteLine(lista[i].tab[4]);
                            plik.WriteLine(lista[i].tab[5]);
                            plik.WriteLine(lista[i].tab[6]);
                            break;
                        case "QBFa":
                            plik.WriteLine(lista[i].tab[1]);
                            plik.WriteLine(lista[i].tab[2]);
                            plik.WriteLine(lista[i].tab[3]);
                            plik.WriteLine(lista[i].tab[4]);
                            plik.WriteLine(lista[i].tab[5]);
                            break;
                        case "QEa":
                            plik.WriteLine(lista[i].tab[1]);
                            plik.WriteLine(lista[i].tab[2]);
                            plik.WriteLine(lista[i].tab[3]);
                            plik.WriteLine(lista[i].tab[4]);
                            plik.WriteLine(lista[i].tab[5]);
                            break;
                        case "TR4a":
                            plik.WriteLine(lista[i].tab[2]);
                            plik.WriteLine(lista[i].tab[1]);
                            plik.WriteLine(lista[i].tab[3]);
                            plik.WriteLine(lista[i].tab[4]);
                            plik.WriteLine(lista[i].tab[9]);
                            int wartosc = Convert.ToInt32(lista[i].tab[5]) +
                                          Convert.ToInt32(lista[i].tab[10]) +
                            Convert.ToInt32(lista[i].tab[4]) / 2;
                            plik.WriteLine(wartosc.ToString());
                            plik.WriteLine(lista[i].tab[10]);
                            plik.WriteLine("90");
                            plik.WriteLine(lista[i].tab[5]);
                            plik.WriteLine(lista[i].tab[6]);

                            break;
                        case "TR5a":
                            plik.WriteLine(lista[i].tab[1]);
                            plik.WriteLine(lista[i].tab[2]);
                            plik.WriteLine(lista[i].tab[3]);
                            plik.WriteLine(lista[i].tab[4]);
                            plik.WriteLine(lista[i].tab[5]);
                            plik.WriteLine(lista[i].tab[9]);
                            plik.WriteLine(lista[i].tab[12]);
                            plik.WriteLine("" + -(Convert.ToInt32(lista[i].tab[10])));
                            plik.WriteLine(lista[i].tab[11]);
                            plik.WriteLine(lista[i].tab[6]);
                            plik.WriteLine(lista[i].tab[7]);
                            break;
                        case "QD1a":
                            plik.WriteLine(lista[i].tab[2]);
                            plik.WriteLine(lista[i].tab[1]);
                            plik.WriteLine(lista[i].tab[9]);
                            plik.WriteLine(lista[i].tab[10]);
                            break;
                        case "QD2a":
                            plik.WriteLine(lista[i].tab[2]);
                            plik.WriteLine(lista[i].tab[1]);
                            plik.WriteLine(lista[i].tab[9]);
                            break;
                        case "TR3a":
                            plik.WriteLine(lista[i].tab[2]);
                            plik.WriteLine(lista[i].tab[1]);
                            plik.WriteLine(lista[i].tab[3]);
                            plik.WriteLine(lista[i].tab[4]);
                            wartosc = Convert.ToInt32(lista[i].tab[6]) +
                                         Convert.ToInt32(lista[i].tab[9]) +
                                         Convert.ToInt32(lista[i].tab[4]) / 2;
                            plik.WriteLine(wartosc.ToString());
                            plik.WriteLine(lista[i].tab[10]);
                            plik.WriteLine(lista[i].tab[9]);
                            plik.WriteLine(lista[i].tab[8]);
                            plik.WriteLine(lista[i].tab[6]);
                            plik.WriteLine(lista[i].tab[7]);
                            plik.WriteLine(lista[i].tab[5]);
                            plik.WriteLine("50");
                            break;
                        case "TR6a":
                            plik.WriteLine(lista[i].tab[1]);
                            plik.WriteLine("50");
                            plik.WriteLine("50");
                            plik.WriteLine(lista[i].tab[2]);
                            plik.WriteLine(lista[i].tab[3]);
                            plik.WriteLine(lista[i].tab[4]);

                            break;
                        case "QPR4a":
                            plik.WriteLine(lista[i].tab[1]);
                            plik.WriteLine(lista[i].tab[2]);
                            plik.WriteLine(lista[i].tab[3]);
                            plik.WriteLine(lista[i].tab[4]);
                            plik.WriteLine(lista[i].tab[5]);
                            plik.WriteLine(lista[i].tab[6]);
                            plik.WriteLine(lista[i].tab[9]);
                            break;
                        case "QPR3a":
                            plik.WriteLine(lista[i].tab[1]);
                            plik.WriteLine(lista[i].tab[2]);
                            plik.WriteLine(lista[i].tab[3]);
                            plik.WriteLine(lista[i].tab[4]);
                            plik.WriteLine(lista[i].tab[5]);
                            plik.WriteLine(lista[i].tab[9]);
                            break;
                        case "TRa":
                            plik.WriteLine(lista[i].tab[1]);
                            plik.WriteLine(lista[i].tab[2]);
                            plik.WriteLine(lista[i].tab[3]);
                            plik.WriteLine(lista[i].tab[4]);
                            plik.WriteLine(lista[i].tab[5]);
                            wartosc = Convert.ToInt32(lista[i].tab[9]) -
                                         (Convert.ToInt32(lista[i].tab[5]) +
                                         Convert.ToInt32(lista[i].tab[11]) +
                                         Convert.ToInt32(lista[i].tab[4]) +
                                         Convert.ToInt32(lista[i].tab[10]));
                            plik.WriteLine(wartosc.ToString());
                            plik.WriteLine(lista[i].tab[6]);
                            plik.WriteLine(lista[i].tab[10]);
                            plik.WriteLine(lista[i].tab[11]);
                            break;
                        case "TR2a":
                            plik.WriteLine(lista[i].tab[2]);
                            plik.WriteLine(lista[i].tab[1]);
                            plik.WriteLine(lista[i].tab[9]);
                            plik.WriteLine(lista[i].tab[3]);
                            plik.WriteLine(lista[i].tab[4]);
                            wartosc = Convert.ToInt32(lista[i].tab[1]) / 2 - Convert.ToInt32(lista[i].tab[5]);
                            plik.WriteLine(wartosc.ToString());
                            plik.WriteLine(lista[i].tab[10]);
                            break;


                        case "TR1a":
                            plik.WriteLine(lista[i].tab[2]);
                            plik.WriteLine(lista[i].tab[1]);
                            plik.WriteLine(lista[i].tab[9]);
                            plik.WriteLine(lista[i].tab[4]);
                            plik.WriteLine(lista[i].tab[3]);
                            plik.WriteLine(lista[i].tab[5]);
                            plik.WriteLine("" + (Convert.ToInt32(lista[i].tab[1]) / 2 - Convert.ToInt32(lista[i].tab[6])));
                            plik.WriteLine(lista[i].tab[10]);
                            break;

                        case "TR7a":
                            plik.WriteLine(lista[i].tab[1]);
                            plik.WriteLine(lista[i].tab[2]);
                            plik.WriteLine(lista[i].tab[3]);
                            plik.WriteLine(lista[i].tab[9]);
                            plik.WriteLine(lista[i].tab[4]);
                            plik.WriteLine(lista[i].tab[5]);
                            plik.WriteLine(lista[i].tab[6]);
                            plik.WriteLine(lista[i].tab[7]);
                            plik.WriteLine(lista[i].tab[11]);
                            plik.WriteLine(lista[i].tab[10]);
                            break;
                    }


                    plik.WriteLine("DIMS_END");
                    plik.WriteLine("OPTIONS_START");
                    plik.WriteLine("OPTIONS_END");
                    plik.WriteLine("CONNS_START");
                    plik.WriteLine("CONNS_END");
                    plik.WriteLine("SEAMS_START");
                    plik.WriteLine("SEAMS_END");
                    plik.WriteLine("ITEM_END");
                }
            }

            plik.WriteLine("JOB_END");
            plik.WriteLine("----------------");
            plik.WriteLine("ELEMENTY Z PROJEKTU nieujête w powy¿szym exporcie");

            plik.WriteLine("{0,-10} {1,-30} {2,-20} {3,-15} {4,-10}","Oznaczenie","Nazwa","Symbol","Szt.","Uwagi");

            for (int i = 0; i < lista.Count; i++)
            {
                if (lista[i].obcy)
                    if (lista[i].symbol == "CZ1a" || lista[i].symbol == "CZ2a")
                        plik.WriteLine("{0,-10} {1,-30} {2,-20} {3,-20} {4,-15}", lista[i].oznaczenie, lista[i].nazwa, lista[i].pelny_symbol, lista[i].sztuk, lista[i].uwagi);
                    else
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

        private void button4_Click(object sender, EventArgs e)
        {
            Close();
        }
    }
}