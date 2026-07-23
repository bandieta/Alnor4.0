using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;

namespace WindowsApplication1
{
    public partial class Form2 : Form, IMultiLang
    {
        public bool wybrano;
        public void elementy(String[] p)
        {
            try
            {
                listBox1.Items.Clear();
                for (int i = 0; i < p.Length; i++)
                    listBox1.Items.Add(p[i]);
                listBox1.SelectedIndex = 0;
            }
            catch { }
        }

        public void elementy(String[] p, String[] pIz, double[] izolacje, double[] kanal1500)
        {
            this.button1.Text = "OK";
            if (p.Length == 0 && pIz.Length == 0) return;
            this.Text = "Suma Blachy";

            listBox1.Items.Clear();
            for (int i = 0; i < p.Length; i++)
                listBox1.Items.Add(p[i]);

            double sumKsz = 0;
            double sumKan = 0;
            double sumKan1500 = 0;
            double sumKszIz = 0;
            double sumKanIz = 0;
            double sumKanIz1500 = 0;

            foreach (String item in p)
            {
                string a = (item.Split(':'))[1].Replace("m2", "");
                if (item.Contains("ksz"))
                { sumKsz += Convert.ToDouble(a); }
                else
                { sumKan += Convert.ToDouble(a); }
            }

            if (sumKsz > 0)
                listBox1.Items.Add("Suma blachy (kszta速ki) : " + sumKsz.ToString() + "m2");
            if (sumKan > 0)
                listBox1.Items.Add("Suma blachy (kana造) : " + sumKan.ToString() + "m2");
            if (kanal1500[0] > 0)
                listBox1.Items.Add("Suma blachy (kana造 1500) : " + kanal1500[0].ToString() + "m2");


            for (int i = 0; i < pIz.Length; i++)
                listBox1.Items.Add(pIz[i]);

            listBox1.SelectedIndex = 0;


            foreach (String item in pIz)
            {
                string a = (item.Split(':'))[1].Replace("m2", "");
                if (item.Contains("ksz"))
                { sumKszIz += Convert.ToDouble(a); }
                else
                { sumKanIz += Convert.ToDouble(a); }
            }

            if (sumKszIz > 0)
                listBox1.Items.Add("Iz. Suma blachy (kszta速ki) : " + sumKszIz.ToString() + "m2");
            if (sumKanIz > 0)
                listBox1.Items.Add("Iz. Suma blachy (kana造) : " + sumKanIz.ToString() + "m2");
            if (kanal1500[1] > 0)
                listBox1.Items.Add("Suma blachy (kana造 1500) : " + kanal1500[1].ToString() + "m2");


            if (izolacje[0] > 0)
            { listBox1.Items.Add("Izolacja 30mm Suma : " + Math.Round(izolacje[0],2));}
            if (izolacje[1] > 0)
            { listBox1.Items.Add("Izolacja 50mm Suma : " + Math.Round(izolacje[1], 2)); }
            if (izolacje[2] > 0)
            { listBox1.Items.Add("Izolacja 100mm Suma : " + Math.Round(izolacje[2], 2)); }
        }


        public int wybrany()
        {
            return listBox1.SelectedIndex;
        }

        public Form forma = null;
        public Form2()
        {
            InitializeComponent();
            forma = this;
        }

        private void listBox1_SelectedIndexChanged(object sender, EventArgs e)
        {
            
        }

        private void button1_Click(object sender, EventArgs e)
        {
        wybrano = true;
            Close();
        }

        private void Form2_Load(object sender, EventArgs e)
        {
            wybrano = false;
            Translate(DictionariesManager.Manager.GetCurrentDictionary());
        }

        private void button2_Click(object sender, EventArgs e)
        {
            listBox1.SelectedIndex = -1;
            Close();
        }

        private void Form2_FormClosing(object sender, FormClosingEventArgs e)
        {
            
        }

        #region IMultiLang Members

        public void Translate(Dictionary<string, string> dict)
        {
            if(dict != null)
            foreach (string item in dict.Keys)
            { TryTranslate(item, dict[item]); }
        }

        private void TryTranslate(string from, string to)
        {
            this.Text = this.Text.Replace(from, to);
            button1.Text = button1.Text.Replace(from, to);
            button2.Text = button2.Text.Replace(from, to);
        }

        #endregion
    }
}